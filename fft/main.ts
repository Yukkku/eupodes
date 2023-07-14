import { mulmod, powmod } from "../util.ts";

// TODO: 一部をナイーブな実装に置き換えて高速化する

/**
 * 数論変換とそれによる畳み込み乗算の実装
 */
export class FFT {
  /** 素数 */
  #p: number;
  /** 1の2v乗根 */
  #g: number;
  /** v乗根が存在する最大の2の冪/2 */
  #v = 1;

  /**
   * @param p 素数。p-1の約数に2の冪が多いと良い。デフォルトで119x2^23+1
   */
  constructor(p = 998244353) {
    this.#p = p;

    if (p === 998244353) {
      this.#g = 31;
      this.#v = 1 << 22;
      return;
    }

    let k = 1;
    while (powmod(k, p >>> 1, p) !== p - 1) k += 1;

    let q = p - 1;
    while (!(q & 1)) {
      q >>>= 1;
      this.#v <<= 1;
    }
    this.#v >>>= 1;
    this.#g = powmod(k, q, p);
  }

  get p() {
    return this.#p;
  }

  /**
   * 数論変換を実行する
   * @param arr 対象の配列。長さが2の冪でなくても揃えられる
   * @returns 数論変換した結果
   */
  fft(arr: ArrayLike<number>): Uint32Array {
    if (arr.length === 0) new Uint32Array([0]);
    if (arr.length === 1) new Uint32Array(arr);
    if ((arr.length & (0 - arr.length)) < arr.length) {
      const na = new Uint32Array(1 << (32 - Math.clz32(arr.length - 1)));
      for (let i = 0; i < arr.length; i += 1) {
        na[i] = arr[i];
      }
      arr = na;
    }
    const hl = arr.length >>> 1;

    for (let i = 1; i < arr.length; i <<= 1) {
      const z = powmod(this.#g, this.#v / i, this.#p);
      const na = new Uint32Array(arr.length);

      for (let j = 0; j < hl; j += i) {
        let f = 1;

        for (let k = 0; k < i; k += 1) {
          na[(j << 1) | k] =
            (arr[j | k] + mulmod(arr[j | k | hl], f, this.#p)) % this.#p;
          f = mulmod(f, z, this.#p);
        }
        for (let k = 0; k < i; k += 1) {
          na[(j << 1) | i | k] =
            (arr[j | k] + mulmod(arr[j | k | hl], f, this.#p)) % this.#p;
          f = mulmod(f, z, this.#p);
        }
      }
      arr = na;
    }
    return arr as Uint32Array;
  }
  /**
   * 逆数論変換を実行する
   * @param arr 対象の配列。長さが2の冪でなくても揃えられる
   * @returns 逆数論変換した結果
   */
  ifft(arr: ArrayLike<number>) {
    if (arr.length === 0) new Uint32Array([0]);
    if (arr.length === 1) new Uint32Array(arr);

    let a = new Uint32Array(1 << (32 - Math.clz32(arr.length - 1)));
    const r = powmod(a.length, this.#p - 2, this.#p);
    for (let i = 0; i < arr.length; i += 1) {
      a[i] = mulmod(arr[i], r, this.#p);
    }

    const hl = a.length >>> 1;

    for (let i = 1; i < a.length; i <<= 1) {
      const z = powmod(this.#g, this.#p - 1 - this.#v / i, this.#p);
      const na = new Uint32Array(arr.length);

      for (let j = 0; j < hl; j += i) {
        let f = 1;

        for (let k = 0; k < i; k += 1) {
          na[(j << 1) | k] = (a[j | k] + mulmod(a[j | k | hl], f, this.#p)) %
            this.#p;
          f = mulmod(f, z, this.#p);
        }
        for (let k = 0; k < i; k += 1) {
          na[(j << 1) | i | k] =
            (a[j | k] + mulmod(a[j | k | hl], f, this.#p)) % this.#p;
          f = mulmod(f, z, this.#p);
        }
      }
      a = na;
    }
    return a;
  }

  /**
   * mod pで畳み込みを行う
   * @param a 1つめの配列
   * @param b 2つめの配列
   * @returns 畳み込みの結果
   */
  convolution(a: ArrayLike<number>, b: ArrayLike<number>) {
    const len = 1 << (32 - Math.clz32(a.length + b.length - 2));
    const am = new Uint32Array(len);
    const bm = new Uint32Array(len);
    for (let i = 0; i < a.length; i += 1) am[i] = a[i];
    for (let i = 0; i < b.length; i += 1) bm[i] = b[i];
    const ag = this.fft(am);
    const bg = this.fft(bm);
    const cg = new Uint32Array(len);
    for (let i = 0; i < len; i += 1) cg[i] = mulmod(ag[i], bg[i], this.#p);
    return this.ifft(cg).subarray(0, a.length + b.length - 1);
  }
}
