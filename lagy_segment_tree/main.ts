/** 恒等写像を表すシンボル。undefined, null∈Uである場合を考慮するために利用 */
const id = Symbol();
type id = typeof id;

// インターフェイスとかソースコードとかはALCを参考にしてるよ!

/**
 * 遅延Segment Treeの実装。
 */
export class LagySegmentTree<T, U> {
  #e: T;
  #op: (a: T, b: T) => T;
  #data: T[];
  #lagy: (U | id)[];
  #size: number;
  #log: number;
  #mapping: (v: T, f: U, size: number) => T;
  #composition: (a: U, b: U) => U;

  /**
   * SegmentTreeは`e`で初期化される
   * @param e モノイドの単位元
   * @param op モノイドの演算
   * @param length SegmentTreeの要素数
   */
  constructor(
    e: T,
    op: (a: T, b: T) => T,
    length: number,
    mapping: (v: T, f: U, size: number) => T,
    composition: (a: U, b: U) => U,
  );

  /**
   * @param e モノイドの単位元
   * @param op モノイドの演算
   * @param array SegmentTreeの初期値
   */
  constructor(
    e: T,
    op: (a: T, b: T) => T,
    array: T[],
    mapping: (v: T, f: U, size: number) => T,
    composition: (a: U, b: U) => U,
  );

  constructor(
    e: T,
    op: (a: T, b: T) => T,
    input: number | T[],
    mapping: (v: T, f: U, size: number) => T,
    composition: (a: U, b: U) => U,
  ) {
    this.#e = e;
    this.#op = op;
    this.#mapping = mapping;
    this.#composition = composition;

    if (typeof input === "number") {
      this.#size = 1;
      this.#log = 0;

      while (this.#size < input) {
        this.#size <<= 1;
        this.#log += 1;
      }

      this.#data = [];
      this.#lagy = [];

      for (let i = 0; i < this.#size; i += 1) {
        this.#data.push(e, e);
        this.#lagy.push(id);
      }

      return;
    }

    this.#size = 1;
    this.#log = 0;

    while (this.#size < input.length) {
      this.#size <<= 1;
      this.#log += 1;
    }

    this.#data = [];
    this.#lagy = [];

    for (let i = 0; i < this.#size; i += 1) {
      this.#data.push(e);
      this.#lagy.push(id);
    }

    for (const val of input) {
      this.#data.push(val);
    }

    for (let i = input.length; i < this.#size; i += 1) {
      this.#data.push(e);
    }

    for (let i = this.#size - 1; i > 0; i -= 1) {
      this.#data[i] = op(this.#data[i << 1], this.#data[(i << 1) + 1]);
    }
  }

  /**
   * 区間の更新を行う
   * @param bigin 区間の開始位置(含む)
   * @param end 区間の終了位置(含まない)
   */
  set(f: U, bigin: number, end: number): void;

  /**
   * 要素の更新を行う
   * @param index 更新する要素のindex
   * @param value 更新後の値
   */
  set(value: T, index: number): void;

  set(v: T | U, bigin: number, end?: number): void {
    if (end == null) {
      let idx = bigin + this.#size;

      for (let i = this.#log; i > 0; i -= 1) {
        this.#push(idx >> i, 1 << i);
      }

      this.#data[idx] = v as T;
      this.#lagy[idx] = id;

      while (idx > 1) {
        idx >>= 1;
        this.#update(idx);
      }

      return;
    }

    bigin += this.#size;
    end += this.#size;

    const f = v as U;

    for (let i = this.#log; i > 0; i -= 1) {
      if (((bigin >> i) << i) != bigin) this.#push(bigin >> i, 1 << i);
      if (((end >> i) << i) != end) this.#push((end - 1) >> i, 1 << i);
    }

    let l = bigin;
    let r = end;
    let size = 1;
    while (l < r) {
      if (l & 1) {
        this.#data[l] = this.#mapping(this.#data[l], f, size);

        if (l < this.#size) {
          const lagy = this.#lagy[l];

          if (lagy !== id) {
            this.#lagy[l] = this.#composition(lagy, f);
          } else {
            this.#lagy[l] = f;
          }
        }
        l += 1;
      }
      if (r & 1) {
        r -= 1;

        this.#data[r] = this.#mapping(this.#data[r], f, size);

        if (r < this.#size) {
          const lagy = this.#lagy[r];

          if (lagy !== id) {
            this.#lagy[r] = this.#composition(lagy, f);
          } else {
            this.#lagy[r] = f;
          }
        }
      }

      l >>= 1;
      r >>= 1;
      size <<= 1;
    }

    for (let i = 1; i <= this.#log; i += 1) {
      if (((bigin >> i) << i) != bigin) this.#update(bigin >> i);
      if (((end >> i) << i) != end) this.#update((end - 1) >> i);
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
      const idx = bigin + this.#size;

      for (let i = this.#log; i > 0; i -= 1) {
        this.#push(idx >> i, 1 << i);
      }

      return this.#data[idx];
    }

    let left = this.#e;
    let right = this.#e;

    bigin += this.#size;
    end += this.#size;

    for (let i = this.#log; i > 0; i -= 1) {
      if (((bigin >> i) << i) != bigin) this.#push(bigin >> i, 1 << i);
      if (((end >> i) << i) != end) this.#push((end - 1) >> i, 1 << i);
    }

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

  #push(index: number, size: number) {
    const lagy = this.#lagy[index];
    if (lagy === id) return;

    this.#data[index << 1] = this.#mapping(
      this.#data[index << 1],
      lagy,
      size >> 1,
    );
    this.#data[(index << 1) | 1] = this.#mapping(
      this.#data[(index << 1) | 1],
      lagy,
      size >> 1,
    );

    this.#lagy[index] = id;

    if ((index << 1) >= this.#size) return;

    const left = this.#lagy[index << 1];
    if (left === id) {
      this.#lagy[index << 1] = lagy;
    } else {
      this.#lagy[index << 1] = this.#composition(left, lagy);
    }

    const right = this.#lagy[(index << 1) | 1];
    if (right === id) {
      this.#lagy[(index << 1) | 1] = lagy;
    } else {
      this.#lagy[(index << 1) | 1] = this.#composition(right, lagy);
    }
  }

  #update(index: number) {
    this.#data[index] = this.#op(
      this.#data[index << 1],
      this.#data[(index << 1) + 1],
    );
  }

  debug() {
    console.log(this.#data);
    console.log(this.#lagy);
  }
}
