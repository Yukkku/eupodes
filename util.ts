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
