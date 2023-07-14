/**
 * ヒープとかのデフォルトの比較する関数。
 */
export function defaultCompare<T>(a: T, b: T): number {
  if (a > b) {
    return 1;
  }
  if (a < b) {
    return -1;
  }
  return 0;
}

/**
 * アサ―ト関数。TypeScriptの型を制御するのに使う。
 */
export function assert(condition: unknown): asserts condition {
  if (!condition) {
    throw new Error("Eupodesのバグです。私(Yukkku)に連絡ください。");
  }
}

export interface Heap<T> {
  readonly size: number;

  /**
   * 要素を追加する
   * @param items 追加する要素
   * @returns 追加後のヒープの要素数
   */
  insert(...items: T[]): number;

  /**
   * 要素をすべて消す
   */
  clear(): void;

  /**
   * 最も優先される要素を削除し、その要素を返す。要素がないなら何もせず、`undefined`を返す
   * @returns 最優先の要素、または`undefined`
   */
  delete(): T | undefined;

  /**
   * 最も優先される要素を返す。要素がないなら`undefined`を返す
   * @returns 最優先の要素、または`undefined`
   */
  find(): T | undefined;
}

export interface IndexedHeap<T> {
  readonly size: number;
  readonly length: number;

  get(index: number): T | undefined;
  set(index: number, value: T): boolean;
  has(index: number): boolean;
  delete(index: number): boolean;

  find(): [number, T] | undefined;
  pop(): [number, T] | undefined;
}

// mod計算用のwasm
// deno-fmt-ignore
const mod = new WebAssembly.Instance(
  new WebAssembly.Module(
    new Uint8Array([
      0, 97, 115, 109, 1, 0, 0, 0, 1, 8, 1, 96, 3, 127, 127, 127, 1, 127, 3, 3, 2, 0, 0, 7, 13, 2,
      3, 109, 117, 108, 0, 0, 3, 112, 111, 119, 0, 1, 10, 81, 2, 14, 0, 32, 0, 173, 32, 1, 173, 126,
      32, 2, 173, 130, 167, 11, 64, 1, 3, 126, 32, 0, 173, 33, 3, 66, 1, 33, 4, 32, 2, 173, 33, 5,
      3, 64, 32, 1, 65, 1, 113, 4, 64, 32, 4, 32, 3, 126, 32, 5, 130, 33, 4, 11, 32, 1, 65, 1, 118,
      34, 1, 4, 64, 32, 3, 32, 3, 126, 32, 5, 130, 33, 3, 12, 1, 11, 11, 32, 4, 167, 11, 0, 12, 4,
      110, 97, 109, 101, 2, 5, 2, 0, 0, 1, 0,
    ]),
  ),
).exports;

export const mulmod = mod.mul as (a: number, b: number, n: number) => number;
export const powmod = mod.pow as (a: number, b: number, n: number) => number;
