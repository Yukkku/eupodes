/**
 * 非負整数の集合を管理する32分木の実装。今のところ`2**20`未満の非負整数のみ対応
 */
export class KaryTree {
  #root = 0;
  #a1 = new Int32Array(32);
  #a2 = new Int32Array(1024);
  #a3 = new Int32Array(32768);

  /**
   * `v`を集合に追加する
   * @param v `2**20`未満の非負整数
   */
  add(v: number): this {
    this.#a3[v >>> 5] |= 1 << (v & 31);
    this.#a2[v >>> 10] |= 1 << ((v >>> 5) & 31);
    this.#a1[v >>> 15] |= 1 << ((v >>> 10) & 31);
    this.#root |= 1 << ((v >>> 15) & 31);
    return this;
  }

  /**
   * `v`が集合に含まれているか判定する
   * @param v `2**20`未満の非負整数
   */
  has(v: number): boolean {
    return Boolean(this.#a3[v >>> 5] & (1 << (v & 31)));
  }

  /**
   * `v`を集合から削除する。元々含まれていないなら何もしない
   * @param v `2**20`未満の非負整数
   */
  delete(v: number): this {
    if (!(this.#a3[v >>> 5] &= ~(1 << (v & 31)))) {
      if (!(this.#a2[v >>> 10] &= ~(1 << ((v >>> 5) & 31)))) {
        if (!(this.#a1[v >>> 15] &= ~(1 << ((v >>> 10) & 31)))) {
          this.#root &= ~(1 << ((v >>> 15) & 31));
        }
      }
    }
    return this;
  }

  /**
   * 集合に含まれている数の最大値を返す。空の場合は`-1`を返す
   */
  max(): number {
    let k = 31 - Math.clz32(this.#root);
    if (k === -1) return -1;
    k = (k << 5) | (31 - Math.clz32(this.#a1[k]));
    k = (k << 5) | (31 - Math.clz32(this.#a2[k]));
    return (k << 5) | (31 - Math.clz32(this.#a3[k]));
  }

  /**
   * 集合に含まれている数の最小値を返す。空の場合は`-1`を返す
   */
  min(): number {
    let k = 31 - Math.clz32(this.#root & (0 - this.#root));
    if (k === -1) return -1;
    k = (k << 5) | (31 - Math.clz32(this.#a1[k] & (0 - this.#a1[k])));
    k = (k << 5) | (31 - Math.clz32(this.#a2[k] & (0 - this.#a2[k])));
    return (k << 5) | (31 - Math.clz32(this.#a3[k] & (0 - this.#a3[k])));
  }
}
