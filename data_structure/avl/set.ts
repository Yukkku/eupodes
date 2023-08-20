import { assert, defaultCompare } from "../../util.ts";
import { Node, VALUE, SIZE, RANK, LEFT, RIGHT, nodeMk, nodeBal, nodeIter } from "./base.ts";

/**
 * 値を追加する
 */
const nodeAdd = <T>(node: Node<T>, val: T, compare: (a: T, b: T) => number) => {
  const d = compare(val, node[VALUE]);
  if (d > 0) {
    if (node[RIGHT]) {
      nodeAdd(node[RIGHT], val, compare);
    } else {
      node[RIGHT] = nodeMk(val);
    }
  } else if (d < 0) {
    if (node[LEFT]) {
      nodeAdd(node[LEFT], val, compare);
    } else {
      node[LEFT] = nodeMk(val);
    }
  }

  nodeBal(node);
};

/**
 * ただのHas。
 */
const nodeHas = <T>(node: Node<T>, val: T, compare: (a: T, b: T) => number): boolean => {
  const d = compare(val, node[VALUE]);
  if (d > 0) {
    if (node[RIGHT]) {
      return nodeHas(node[RIGHT], val, compare);
    } else {
      return false;
    }
  } else if (d < 0) {
    if (node[LEFT]) {
      return nodeHas(node[LEFT], val, compare);
    } else {
      return false;
    }
  }

  return true;
};

/**
 * 値を削除する。`node`自身をnullにする必要がある場合は`SIZE`を0にして`true`が返る
 * @returns 削除する要素があったか
 */
const nodeDel = <T>(
  node: Node<T>,
  val: T,
  compare: (a: T, b: T) => number,
): boolean => {
  const d = compare(val, node[VALUE]);
  let retVal: boolean;
  if (d > 0) {
    if (node[RIGHT]) {
      retVal = nodeDel(node[RIGHT], val, compare);
      if (node[RIGHT][SIZE] === 0) node[RIGHT] = null;
    } else {
      return false;
    }
  } else if (d < 0) {
    if (node[LEFT]) {
      retVal = nodeDel(node[LEFT], val, compare);
      if (node[LEFT][SIZE] === 0) node[LEFT] = null;
    } else {
      return false;
    }
  } else {
    retVal = true;

    if (node[RIGHT]) {
      node[VALUE] = nodeDelAt(node[RIGHT], 0);
      if (node[RIGHT][SIZE] === 0) node[RIGHT] = null;
    } else if (node[LEFT]) {
      node[VALUE] = node[LEFT][VALUE];
      node[SIZE] = node[LEFT][SIZE];
      node[RANK] = node[LEFT][RANK];
      node[RIGHT] = node[LEFT][RIGHT];
      node[LEFT] = node[LEFT][LEFT];
      return true;
    } else {
      node[SIZE] = 0;
      return true;
    }
  }

  if (retVal) nodeBal(node);

  return retVal;
};

// 絶対1個以上要素あるよねって感じのオーバーロード
function nodeAt<T>(node: Node<T>, i: 0): T;
function nodeAt<T>(node: Node<T>, i: number): T | undefined;
function nodeAt<T>(node: Node<T>, i: number): T | undefined {
  const l = node[LEFT]?.[SIZE] ?? 0;
  if (i > l) {
    if (node[RIGHT]) {
      return nodeAt(node[RIGHT], i - l - 1);
    } else {
      return;
    }
  } else if (i < l) {
    return nodeAt(node[LEFT]!, i);
  } else {
    return node[VALUE];
  }
}

function nodeDelAt<T>(node: Node<T>, i: 0): T;
function nodeDelAt<T>(node: Node<T>, i: number): T | undefined;
function nodeDelAt<T>(node: Node<T>, i: number): T | undefined {
  const l = node[LEFT]?.[SIZE] ?? 0;
  let retVal: T;
  if (i > l) {
    if (node[RIGHT]) {
      const s = node[RIGHT][SIZE];
      const g = nodeDelAt(node[RIGHT], i - l - 1);
      if (node[RIGHT][SIZE] < s) {
        retVal = g!;
        if (node[RIGHT][SIZE] === 0) node[RIGHT] = null;
      } else {
        return;
      }
    } else {
      return;
    }
  } else if (i < l) {
    assert(node[LEFT]);
    retVal = nodeDelAt(node[LEFT], i)!;
    if (node[LEFT][SIZE] === 0) node[LEFT] = null;
  } else {
    retVal = node[VALUE];

    if (node[RIGHT]) {
      node[VALUE] = nodeDelAt(node[RIGHT], 0);
      if (node[RIGHT][SIZE] === 0) node[RIGHT] = null;
    } else if (node[LEFT]) {
      node[VALUE] = node[LEFT][VALUE];
      node[SIZE] = node[LEFT][SIZE];
      node[RANK] = node[LEFT][RANK];
      node[RIGHT] = node[LEFT][RIGHT];
      node[LEFT] = node[LEFT][LEFT];
      return retVal;
    } else {
      node[SIZE] = 0;
      return retVal;
    }
  }

  nodeBal(node);
  return retVal;
}

/**
 * AVL Treeを使用したSetの拡張
 */
export class AvlSet<T> implements Set<T> {
  #root: Node<T> | null = null;
  #cmp: (a: T, b: T) => number;

  constructor(compare = defaultCompare<T>) {
    this.#cmp = compare;
  }

  add(value: T): this {
    if (this.#root) {
      nodeAdd(this.#root, value, this.#cmp);
    } else {
      this.#root = nodeMk(value);
    }

    return this;
  }

  at(index: number): T | undefined {
    if (this.#root) {
      return nodeAt(this.#root, index < 0 ? index + this.#root[SIZE] : index);
    }
  }

  clear(): void {
    this.#root = null;
  }

  delete(value: T): boolean {
    if (this.#root) {
      const retVal = nodeDel(this.#root, value, this.#cmp);
      if (this.#root[SIZE] === 0) this.#root = null;
      return retVal;
    } else {
      return false;
    }
  }

  deleteAt(index: number): T | undefined {
    if (this.#root) {
      return nodeDelAt(this.#root, index < 0 ? index + this.#root[SIZE] : index);
    }
  }

  forEach(
    callbackfn: (value: T, value2: T, set: AvlSet<T>) => void,
    thisArg?: unknown,
  ): void {
    for (const v of this) {
      callbackfn.call(thisArg, v, v, this);
    }
  }

  has(value: T): boolean {
    if (this.#root) {
      return nodeHas(this.#root, value, this.#cmp);
    }
    return false;
  }

  /**
   * 根のノードの要素を返す。何でもいいから中の要素1つ欲しいってときにどうぞ
   * @returns 根のノードの要素、要素がない場合は`undefined`
   */
  rootVal(): T | undefined {
    return this.#root?.[VALUE];
  }

  get size(): number {
    return this.#root?.[SIZE] ?? 0;
  }

  *entries(): IterableIterator<[T, T]> {
    for (const v of this) {
      yield [v, v];
    }
  }

  get keys() {
    return this[Symbol.iterator];
  }

  get values() {
    return this[Symbol.iterator];
  }

  [Symbol.iterator](): IterableIterator<T> {
    if (this.#root) {
      return nodeIter(this.#root);
    }

    return (function*(){})();
  }

  get [Symbol.toStringTag]() {
    return "AvlSet";
  }
}
