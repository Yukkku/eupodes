import { type Heap, type IndexedHeap } from "../../util.ts";

/**
 * ```wat
 * (module
 *   (func (export "bsr") (param f64 f64) (result i32)
 *     i32.const 64
 *     local.get 0
 *     i64.reinterpret_f64
 *     local.get 1
 *     i64.reinterpret_f64
 *     i64.xor
 *     i64.clz
 *     i32.wrap_i64
 *     i32.sub
 *   )
 * )
 * ```
 */
// deno-fmt-ignore
const wasmExport = new WebAssembly.Instance(
  new WebAssembly.Module(
    new Uint8Array([
      0, 97, 115, 109, 1, 0, 0, 0, 1, 7, 1, 96, 2, 124, 124, 1, 127, 3, 2, 1, 0, 7, 7, 1, 3, 98,
      115, 114, 0, 0, 10, 17, 1, 15, 0, 65, 192, 0, 32, 0, 189, 32, 1, 189, 133, 121, 167, 107, 11,
      0, 10, 4, 110, 97, 109, 101, 2, 3, 1, 0, 0,
    ]),
  ),
).exports;

const bsr = wasmExport.bsr as (a: number, b: number) => number;

/**
 * 基数ヒープの実装。通常の実装では非負整数しか扱えないが、これは非負なら実数も扱える
 */
export class RadixHeap implements Heap<number> {
  #size = 0;
  #last = 0;
  #min = Infinity;
  #values: number[][];

  constructor() {
    this.#values = [];

    for (let i = 0; i < 64; i += 1) {
      this.#values.push([]);
    }
  }

  get size(): number {
    return this.#size;
  }

  /**
   * 要素を追加する
   * @param items 追加する要素
   * @returns 追加後のヒープの要素数
   */
  insert(...items: number[]): number {
    for (let i = 0; i < items.length; i += 1) {
      const item = items[i];
      if (item >= this.#last) {
        this.#values[bsr(item, this.#last)].push(item);
        this.#size += 1;

        if (item < this.#min) this.#min = item;
      }
    }

    return this.#size;
  }

  /**
   * 要素をすべて消す
   */
  clear(): void {
    this.#size = 0;
    this.#last = 0;

    this.#values = [];

    for (let i = 0; i < 64; i += 1) {
      this.#values.push([]);
    }
  }

  /**
   * 最も優先される要素を削除し、その要素を返す。要素がないなら何もせず、`undefined`を返す
   * @returns 最優先の要素、または`undefined`
   */
  delete(): number | undefined {
    if (this.#size === 0) return;
    this.#size -= 1;

    if (this.#last === this.#min) {
      this.#values[0].pop();
      this.#findMin();
      return this.#last;
    }

    const v = bsr(this.#min, this.#last);
    this.#last = this.#min;

    const target = this.#values[v];
    for (let i = 0; i < target.length; i += 1) {
      const item = target[i];
      this.#values[bsr(item, this.#last)].push(item);
    }

    this.#values[v] = [];

    this.#values[0].pop();
    this.#findMin();
    return this.#last;
  }

  /**
   * 最も優先される要素を返す。要素がないなら`undefined`を返す
   * @returns 最優先の要素、または`undefined`
   */
  find(): number | undefined {
    if (this.#size > 0) {
      return this.#min;
    }
  }

  #findMin() {
    if (this.#size === 0) {
      this.#min = Infinity;
      return;
    }

    let i = 0;

    while (this.#values[i].length === 0) {
      i += 1;
    }

    if (i > 0) {
      this.#min = this.#values[i].reduce((a, b) => Math.min(a, b), Infinity);
    }
  }
}

/**
 * ダイクストラ法用の基数ヒープ
 */
export class IndexedRadixHeap implements IndexedHeap<number> {
  #size = 0;
  #last = 0;
  #min = Infinity;
  #minidx = -1;
  #idxs: number[][];
  #vals: (number | undefined)[];

  constructor(length: number) {
    this.#idxs = [];
    this.#vals = [];

    for (let i = 0; i < 64; i += 1) {
      this.#idxs.push([]);
    }

    for (let i = 0; i < length; i += 1) {
      this.#vals.push(undefined);
    }
  }

  /** 値が存在している要素の個数 */
  get size() {
    return this.#size;
  }

  /** indexの最大値-1 */
  get length() {
    return this.#vals.length;
  }

  /**
   * 要素の値を取得する
   * @param index 対象のindex
   * @returns `index`に対応する要素(存在しないならundefined)
   */
  get(index: number): number | undefined {
    return this.#vals[index];
  }

  /**
   * 要素の値を設定する
   * @param index 対象のindex
   * @param value 設定したい値
   * @returns 書き換えが可能だったか
   */
  set(index: number, value: number): boolean {
    const beforeVal = this.#vals[index];

    if (value >= this.#last && (beforeVal === undefined || value < beforeVal)) {
      if (beforeVal === undefined) {
        this.#size += 1;
      }

      const v = bsr(this.#last, value);
      this.#idxs[v].push(index);
      this.#vals[index] = value;

      if (value < this.#min) {
        this.#min = value;
        this.#minidx = index;
      }
      return true;
    }

    return false;
  }

  /**
   * 最小の要素を返す
   * @returns [最小要素のindex, 最小要素の値]
   */
  find(): [number, number] | undefined {
    if (this.#size > 0) {
      return [this.#minidx, this.#min];
    }
  }

  /**
   * indexに対応する値があるかどうか返す
   * @param index 対象のindex
   * @returns indexに値が紐づけされてるか否か
   */
  has(index: number): boolean {
    return this.#vals[index] !== undefined;
  }

  /**
   * indexに対応した値を削除する
   * @param index 対象のindex
   * @returns 削除する前に値はあったか否か
   */
  delete(index: number): boolean {
    if (this.#vals[index] === undefined) {
      return false;
    }

    this.#vals[index] = undefined;
    this.#size -= 1;

    if (this.#minidx === index) {
      this.#findMin();
    }
    return true;
  }

  /**
   * 最小の要素を削除する
   * @returns [最小要素のindex, 最小要素の値]
   */
  pop(): [number, number] | undefined {
    if (this.#size === 0) return;
    const retVal: [number, number] = [this.#minidx, this.#min];
    const v = bsr(this.#last, this.#min);

    this.#last = this.#min;
    this.#vals[this.#minidx] = undefined;
    let found = false;

    this.#min = Infinity;
    this.#minidx = -1;
    this.#size -= 1;

    const target = this.#idxs[v];
    for (let i = 0; i < target.length; i += 1) {
      const idx = target[i];
      const val = this.#vals[idx];
      if (val === undefined) continue;

      this.#idxs[bsr(this.#last, val)].push(idx);
      found = true;

      if (val < this.#min) {
        this.#min = val;
        this.#minidx = idx;
      }
    }

    if (!found) {
      this.#findMin(v + 1);
    }

    return retVal;
  }

  #findMin(start = 0) {
    this.#min = Infinity;
    this.#minidx = -1;

    for (let i = start; i < 64; i += 1) {
      const idxs = this.#idxs[i];
      if (idxs.length === 0) continue;
      const nee: number[] = [];

      for (let i = 0; i < idxs.length; i += 1) {
        const idx = idxs[i];
        const val = this.#vals[idx];
        if (val === undefined) continue;

        nee.push(idx);

        if (val < this.#min) {
          this.#min = val;
          this.#minidx = idx;
        }
      }

      this.#idxs[i] = nee;

      if (nee.length > 0) {
        return;
      }
    }
  }
}
