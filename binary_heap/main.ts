import { defaultConpare, type Heap, type IndexedHeap } from "../util.ts";

/**
 * 二分ヒープの実装。デフォルトではmin-heapになっている
 */
export class BinaryHeap<T> implements Heap<T> {
  #data: [null, ...T[]] = [null];
  #compare: (a: T, b: T) => number;

  get size(): number {
    return this.#data.length - 1;
  }

  /**
   * @param compareFunc 比較に用いる関数
   */
  constructor(compareFunc: (a: T, b: T) => number = defaultConpare) {
    this.#compare = compareFunc;
  }

  /**
   * 要素を追加する
   * @param items 追加する要素
   * @returns 追加後のヒープの要素数
   */
  insert(...items: T[]) {
    let i = this.#data.length;
    this.#data.push(...items);

    for (; i < this.#data.length; i += 1) {
      this.#upHeap(i);
    }

    return this.size;
  }

  /**
   * 要素をすべて消す
   */
  clear() {
    this.#data = [null];
  }

  /**
   * 最も優先される要素を削除し、その要素を返す。要素がないなら何もせず、`undefined`を返す
   * @returns 最優先の要素、または`undefined`
   */
  delete() {
    if (this.size === 0) {
      return;
    }
    if (this.size === 1) {
      return <T> this.#data.pop();
    }

    const retVal = this.#data[1];
    this.#data[1] = <T> this.#data.pop();

    this.#downHeap(1);

    return retVal;
  }

  /**
   * 最も優先される要素を返す。要素がないなら`undefined`を返す
   * @returns 最優先の要素、または`undefined`
   */
  find(): T | undefined {
    return this.#data[1];
  }

  #upHeap(idx: number) {
    if (idx <= 1) return;

    const parent = idx >>> 1;

    if (this.#compare(<T> this.#data[idx], <T> this.#data[parent]) < 0) {
      const tmp = <T> this.#data[idx];
      this.#data[idx] = <T> this.#data[parent];
      this.#data[parent] = tmp;

      this.#upHeap(parent);
    }
  }

  #downHeap(idx: number) {
    if (idx * 2 < this.#data.length) {
      let comi: number;
      if (
        idx * 2 + 1 < this.#data.length &&
        this.#compare(<T> this.#data[idx * 2], <T> this.#data[idx * 2 + 1]) > 0
      ) {
        comi = idx * 2 + 1;
      } else {
        comi = idx * 2;
      }

      if (this.#compare(<T> this.#data[idx], <T> this.#data[comi]) > 0) {
        const tmp = <T> this.#data[comi];
        this.#data[comi] = this.#data[idx];
        this.#data[idx] = tmp;
        this.#downHeap(comi);
      }
    }
  }
}

/**
 * 値の更新ができるBinary Heapの実装
 */
export class IndexedBinaryHeap<T> implements IndexedHeap<T> {
  #values: (T | undefined)[] = [];
  #tree: [0, ...number[]] = [0];
  #points: number[] = [];
  #compare: (a: T, b: T) => number;

  constructor(
    length: number,
    compareFunc: (a: T, b: T) => number = defaultConpare,
  ) {
    this.#compare = compareFunc;

    for (let i = 0; i < length; i += 1) {
      this.#points.push(0);
      this.#values.push(undefined);
    }
  }

  get size() {
    return this.#tree.length - 1;
  }
  get length() {
    return this.#values.length;
  }

  get(index: number): T | undefined {
    return this.#values[index];
  }

  set(index: number, value: T): true {
    if (this.#points[index] === 0) {
      const point = this.#tree.length;
      this.#values[index] = value;
      this.#points[index] = point;
      this.#tree.push(index);
      this.#upHeap(point);
      return true;
    }

    const diff = this.#compare(value, this.#values[index] as T);
    this.#values[index] = value;

    if (diff > 0) {
      this.#downHeap(this.#points[index]);
    } else if (diff < 0) {
      this.#upHeap(this.#points[index]);
    }

    return true;
  }

  clear() {
    const length = this.#values.length;
    this.#tree = [0];
    this.#points = [];
    this.#values = [];

    for (let i = 0; i < length; i += 1) {
      this.#points.push(0);
      this.#values.push(undefined);
    }
  }

  delete(index: number): boolean {
    const point = this.#points[index];

    if (point) {
      this.#values[index] = undefined;
      this.#points[index] = 0;
      const subIdx = this.#tree.pop() as number;

      if (point < this.#tree.length) {
        this.#tree[point] = subIdx;
        this.#points[subIdx] = point;
        this.#downHeap(point);
      }

      return true;
    }

    return false;
  }

  has(index: number): boolean {
    if (this.#points[index]) {
      return true;
    }

    return false;
  }

  find(): [number, T] | undefined {
    const idx = this.#tree[1];
    if (idx !== undefined) {
      return [idx, this.#values[idx] as T];
    }
  }

  pop(): [number, T] | undefined {
    const idx = this.#tree[1];
    if (idx === undefined) return;

    const retVal: [number, T] = [idx, this.#values[idx] as T];

    this.#values[idx] = undefined;
    this.#points[idx] = 0;
    const subIdx = this.#tree.pop() as number;

    if (this.#tree.length > 1) {
      this.#tree[1] = subIdx;
      this.#points[subIdx] = 1;
      this.#downHeap(1);
    }

    return retVal;
  }

  #upHeap(idx: number) {
    if (idx >= this.#tree.length) return;

    while (idx > 1) {
      const targetIdx = this.#tree[idx];
      const targetVal = this.#values[targetIdx] as T;
      const parent = idx >>> 1;
      const parentIdx = this.#tree[parent];
      const parentVal = this.#values[parentIdx] as T;
      const diff = this.#compare(targetVal, parentVal);

      if (diff >= 0) return;
      this.#tree[idx] = parentIdx;
      this.#tree[parent] = targetIdx;
      this.#points[targetIdx] = parent;
      this.#points[parentIdx] = idx;

      idx = parent;
    }
  }

  #downHeap(idx: number) {
    while (idx * 2 < this.#tree.length) {
      const targetIdx = this.#tree[idx];
      const targetVal = this.#values[targetIdx] as T;
      let child = idx * 2;
      let childIdx = this.#tree[child];
      let childVal = this.#values[childIdx] as T;

      if (child < this.#tree.length - 1) {
        const diff = this.#compare(
          this.#values[this.#tree[child + 1]] as T,
          childVal,
        );
        if (diff < 0) {
          child += 1;
          childIdx = this.#tree[child];
          childVal = this.#values[childIdx] as T;
        }
      }

      const diff = this.#compare(targetVal, childVal);

      if (diff <= 0) return;
      this.#tree[idx] = childIdx;
      this.#tree[child] = targetIdx;
      this.#points[targetIdx] = child;
      this.#points[childIdx] = idx;

      idx = child;
    }
  }
}
