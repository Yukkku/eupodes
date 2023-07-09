/**
 * Segment Treeの実装
 */
export class SegmentTree<T> {
  #e: T;
  #op: (a: T, b: T) => T;
  #data: T[];
  #size: number;
  #length: number;

  /**
   * SegmentTreeは`e`で初期化される
   * @param e モノイドの単位元
   * @param op モノイドの演算
   * @param length SegmentTreeの要素数
   */
  constructor(e: T, op: (a: T, b: T) => T, length: number);

  /**
   * @param e モノイドの単位元
   * @param op モノイドの演算
   * @param array SegmentTreeの初期値
   */
  constructor(e: T, op: (a: T, b: T) => T, array: T[]);

  constructor(e: T, op: (a: T, b: T) => T, input: number | T[]) {
    this.#e = e;
    this.#op = op;

    if (typeof input === "number") {
      this.#length = input;
      this.#size = 1;

      while (this.#size < input) {
        this.#size <<= 1;
      }

      this.#data = [];

      for (let i = 0; i < this.#size; i += 1) {
        this.#data.push(e, e);
      }

      return;
    }

    this.#length = input.length;
    this.#size = 1;

    while (this.#size < input.length) {
      this.#size <<= 1;
    }

    this.#data = [];

    for (let i = 0; i < this.#size; i += 1) {
      this.#data.push(e);
    }

    for (let i = 0; i < input.length; i += 1) {
      this.#data.push(input[i]);
    }

    for (let i = input.length; i < this.#size; i += 1) {
      this.#data.push(e);
    }

    for (let i = this.#size - 1; i > 0; i -= 1) {
      this.#data[i] = op(this.#data[i << 1], this.#data[(i << 1) + 1]);
    }
  }

  /**
   * 要素の更新を行う
   * @param value 更新後の値
   * @param index 更新する要素のindex
   */
  set(value: T, index: number) {
    let i = index + this.#size;
    this.#data[i] = value;

    while (i > 1) {
      i >>= 1;
      this.#data[i] = this.#op(this.#data[i << 1], this.#data[(i << 1) + 1]);
    }
  }

  /**
   * 区間積を計算する
   * @param bigin 区間の開始位置(含む)
   * @param end 区間の終了位置(含まない)
   * @returns `[bigin, end)`の総積
   */
  get(bigin: number, end: number): T;

  /**
   * 要素を取得する
   * @param index 取得する要素のindex
   * @returns indexに対応する要素
   */
  get(index: number): T;

  get(bigin: number, end?: number): T {
    if (end == null) {
      return this.#data[this.#size + bigin];
    }

    let left = this.#e;
    let right = this.#e;

    bigin += this.#size;
    end += this.#size;

    while (bigin < end) {
      if (bigin & 1) {
        left = this.#op(left, this.#data[bigin]);
        bigin += 1;
      }
      if (end & 1) {
        end -= 1;
        right = this.#op(this.#data[end], right);
      }
      bigin >>= 1;
      end >>= 1;
    }

    return this.#op(left, right);
  }

  search(func: (a: T) => boolean, l = 0): number {
    let i = l + this.#size;
    let val = this.#e;
    while (1) {
      if (i & 1) {
        const newval = this.#op(val, this.#data[i]);
        if (func(newval)) {
          val = newval;
          i += 1;
          if ((i & (i - 1)) === 0) {
            return this.#length;
          }
        } else {
          break;
        }
      }
      i >>= 1;
    }

    while (i < this.#size) {
      i <<= 1;
      const newval = this.#op(val, this.#data[i]);
      if (func(newval)) {
        val = newval;
        i += 1;
      }
    }

    return i - this.#size;
  }
}
