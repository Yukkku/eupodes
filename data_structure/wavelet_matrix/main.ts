const bitcount = (n: number) => {
  n = (n & 0x55555555) + ((n >>> 1) & 0x55555555);
  n = (n & 0x33333333) + ((n >>> 2) & 0x33333333);
  n = (n & 0x0f0f0f0f) + ((n >>> 4) & 0x0f0f0f0f);
  n = (n & 0x00ff00ff) + ((n >>> 8) & 0x00ff00ff);
  return (n & 0x0000ffff) + (n >>> 16);
};

/**
 * ウェーブレット行列の実装
 */
export class WaveletMatrix {
  #d: Int32Array;
  #r: Int32Array;
  #size: number;
  #len: number;

  /**
   * @param data 全ての要素`v`は整数かつ`0 <= v < 2**32`を満たす
   */
  constructor(data: ArrayLike<number>) {
    const len = data.length;
    const size = (len + 31) & -32; // lenを32の倍数で切り上げ
    this.#size = size;
    this.#len = len;
    this.#d = new Int32Array(size + 32); // 32個余分に持たせると#rankの処理がちょっと楽
    let d = data;
    let l = len;

    for (let i = 31; i >= 0; i -= 1) {
      const p = 1 << i;
      const nd = new Int32Array(size);
      let j = 0;

      for (let k = 0; k < l; k += 1) {
        if (d[k] & p) {
          this.#d[(k & -32) | i] |= 1 << (k & 31);
          nd[size - k + j - 1] = d[k];
        } else {
          nd[j++] = d[k];
        }
      }

      for (let k = d.length - 1, h = l; k >= l; k -= 1, h += 1) {
        if (d[k] & p) {
          this.#d[(h & -32) | i] |= 1 << (h & 31);
          nd[size - h + j - 1] = d[k];
        } else {
          nd[j++] = d[k];
        }
      }

      d = nd;
      l = j;
    }

    this.#r = new Int32Array(size + 32);
    for (let i = 0; i < size; i += 1) {
      this.#r[i + 32] = this.#r[i] + bitcount(this.#d[i]);
    }
  }

  /**
   * 下位`[j]`層目の完備辞書の`[i]`番目の値
   * @returns `0`または`1`
   */
  #access(i: number, j: number): 0 | 1 {
    return ((this.#d[(i & -32) | j] >>> (i & 31)) & 1) as 0 | 1;
  }

  /**
   * 下位`[j]`層目の完備辞書の`[i]`番目の要素までに立っているビットの数
   */
  #rank(i: number, j: number): number {
    return this.#r[(i & -32) | j] +
      bitcount(this.#d[(i & -32) | j] & ((1 << (i & 31)) - 1));
  }

  #select0(i: number, j: number) {
    let ok = 0;
    let ng = this.#size;

    while (ng - ok > 1) {
      const mid = (ok + ng) >>> 1;
      if (mid - this.#rank(mid, j) > i) {
        ng = mid;
      } else {
        ok = mid;
      }
    }
    return ok;
  }

  #select1(i: number, j: number) {
    let ok = 0;
    let ng = this.#size;

    while (ng - ok > 1) {
      const mid = (ok + ng) >>> 1;
      if (this.#rank(mid, j) > i) {
        ng = mid;
      } else {
        ok = mid;
      }
    }
    return ok;
  }

  /**
   * `i - 1`番目の要素の値を復元
   */
  access(i: number) {
    let retVal = 0;

    for (let j = 31; j >= 0; j -= 1) {
      if (this.#access(i, j)) {
        retVal |= 1 << j;
        i = this.#size - this.#r[this.#size | j] + this.#rank(i, j);
      } else {
        i -= this.#rank(i, j);
      }
    }

    return retVal < 0 ? retVal + 2 ** 32 : retVal; // 内部的には整数だけど表面上は非負整数!
  }

  /**
   * 区間`[l, r)`に含まれる`v`の個数
   */
  rank(l: number, r: number, v: number) {
    for (let i = 31; i >= 0; i -= 1) {
      if (v & (1 << i)) {
        const z = this.#size - this.#r[this.#size | i];
        l = z + this.#rank(l, i);
        r = z + this.#rank(r, i);
      } else {
        l -= this.#rank(l, i);
        r -= this.#rank(r, i);
      }
    }
    return r - l;
  }

  /**
   * `l - 1`番目の要素以降で`i - 1`番目に要素`v`が出現するindexを返す
   * `i`が負の場合に`l - 2`番目の以前の要素で`-i`番目に要素`v`が出現するindexを返す
   */
  select(l: number, i: number, v: number) {
    for (let i = 31; i >= 0; i -= 1) {
      if (v & (1 << i)) {
        l = this.#size - this.#r[this.#size | i] + this.#rank(l, i);
      } else {
        l -= this.#rank(l, i);
      }
    }

    l += i;

    for (let i = 0; i < 32; i += 1) {
      if (v & (1 << i)) {
        l = this.#select1(l + this.#r[this.#size | i] - this.#size, i);
      } else {
        l = this.#select0(l, i);
      }
    }

    return l;
  }

  /**
   * 区間`[l, r)`の中で`i - 1`番目に小さい要素の値を返す
   */
  quantile(l: number, r: number, i: number) {
    let retVal = 0;

    for (let j = 31; j >= 0; j -= 1) {
      const lc = this.#rank(l, j);
      const rc = this.#rank(r, j);

      if (i < (r - rc) - (l - lc)) {
        l -= lc;
        r -= rc;
      } else {
        retVal |= 1 << j;
        i -= (r - rc) - (l - lc);
        const z = this.#size - this.#r[this.#size | j];
        l = z + lc;
        r = z + rc;
      }
    }

    return retVal < 0 ? retVal + 2 ** 32 : retVal;
  }

  /**
   * 区間`[l, r)`の中で`i`未満の要素の個数
   */
  rangefreq(l: number, r: number, i: number) {
    let retVal = 0;

    for (let j = 31; j >= 0; j -= 1) {
      const lc = this.#rank(l, j);
      const rc = this.#rank(r, j);

      if (i & (1 << j)) {
        retVal += (r - rc) - (l - lc);
        l -= lc;
        r -= rc;
      } else {
        const z = this.#size - this.#r[this.#size | j];
        l = z + lc;
        r = z + rc;
      }
    }

    return retVal;
  }
}
