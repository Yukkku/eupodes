import { assert, defaultCompare } from "../../util.ts";

type Node<T> = [T, number, number, Node<T> | null, Node<T> | null];

const VALUE = 0;
const HEIGHT = 1;
const SIZE = 2;
const LEFT = 3;
const RIGHT = 4;

const set = (node: Node<unknown>) => {
  node[SIZE] = (node[LEFT]?.[SIZE] ?? 0) + (node[RIGHT]?.[SIZE] ?? 0) + 1;
  node[HEIGHT] =
    Math.max(node[LEFT]?.[HEIGHT] ?? 0, node[RIGHT]?.[HEIGHT] ?? 0) + 1;
};

function lrot(node: Node<unknown>) {
  assert(node[RIGHT]);
  node[LEFT] = [
    /*VALUE: */ node[VALUE],
    0,
    0,
    /*LEFT:*/ node[LEFT],
    /*RIGHT:*/ node[RIGHT][LEFT],
  ];
  set(node[LEFT]);

  node[VALUE] = node[RIGHT][VALUE];
  node[RIGHT] = node[RIGHT][RIGHT];
  set(node);
}

function rrot(node: Node<unknown>) {
  assert(node[LEFT]);
  node[RIGHT] = [
    /*VALUE: */ node[VALUE],
    0,
    0,
    /*LEFT:*/ node[LEFT][RIGHT],
    /*RIGHT:*/ node[RIGHT],
  ];
  set(node[RIGHT]);

  node[VALUE] = node[LEFT][VALUE];
  node[LEFT] = node[LEFT][LEFT];
  set(node);
}

const baranced = (node: Node<unknown>) => {
  if (!node[RIGHT]) {
    if (node[LEFT] && node[LEFT][HEIGHT] >= 3) {
      if (node[LEFT][LEFT] === null) {
        lrot(node[LEFT]);
      }
      rrot(node);
    }
    return;
  }
  if (!node[LEFT]) {
    if (node[RIGHT][HEIGHT] >= 3) {
      if (node[RIGHT][RIGHT] === null) {
        rrot(node[RIGHT]);
      }
      lrot(node);
    }
    return;
  }

  const d = node[LEFT][HEIGHT] - node[RIGHT][HEIGHT];
  if (d >= 2) {
    assert(node[LEFT][LEFT] && node[LEFT][RIGHT]);
    if (node[LEFT][LEFT][HEIGHT] < node[LEFT][RIGHT][HEIGHT]) {
      lrot(node[LEFT]);
    }
    rrot(node);
  } else if (d <= -2) {
    assert(node[RIGHT][LEFT] && node[RIGHT][RIGHT]);
    if (node[RIGHT][LEFT][HEIGHT] > node[RIGHT][RIGHT][HEIGHT]) {
      rrot(node[RIGHT]);
    }
    lrot(node);
  }
};

const add = <T>(
  node: Node<T>,
  val: T,
  compare: (a: T, b: T) => number,
): boolean => {
  const d = compare(val, node[VALUE]);
  if (d > 0) {
    if (node[RIGHT] === null) {
      node[RIGHT] = [val, 1, 1, null, null];
    } else {
      if (add(node[RIGHT], val, compare)) {
        baranced(node);
      }
    }
    return true;
  } else if (d < 0) {
    if (node[LEFT] === null) {
      node[LEFT] = [val, 1, 1, null, null];
    } else {
      if (add(node[LEFT], val, compare)) {
        baranced(node);
      }
    }
    return true;
  }
  return false;
};

const at = <T>(node: Node<T>, idx: number): T | undefined => {
  if (node[LEFT]) {
    if (idx < node[LEFT][SIZE]) {
      return at(node[LEFT], idx);
    }
    if (idx === node[LEFT][SIZE]) {
      return node[VALUE];
    }
    if (node[RIGHT]) {
      return at(node[RIGHT], idx - node[LEFT][HEIGHT] - 1);
    }
  } else {
    if (idx === 0) return node[VALUE];
    if (node[RIGHT]) {
      return at(node[RIGHT], idx - 1);
    }
  }
};

const del = <T>(node: Node<T>, idx: number): T | undefined => {
  if (node[LEFT]) {
    if (idx < node[LEFT][SIZE]) {
      const retVal = del(node[LEFT], idx);
      if (node[LEFT][SIZE] === 0) node[LEFT] = null;
      baranced(node);
      return retVal;
    }
    if (idx === node[LEFT][SIZE]) {
      const retVal = node[VALUE];
      node[VALUE] = del(node[LEFT], node[LEFT][SIZE] - 1) as T;
      if (node[LEFT][SIZE] === 0) node[LEFT] = null;
      baranced(node);
      return retVal;
    }
    if (node[RIGHT]) {
      const retVal = del(node[RIGHT], idx - node[LEFT][SIZE] - 1);
      if (node[RIGHT][SIZE] === 0) node[RIGHT] = null;
      baranced(node);
      return retVal;
    }
  } else {
    if (idx === 0) {
      const retVal = node[VALUE];
      if (node[RIGHT]) {
        node[VALUE] = node[RIGHT][VALUE];
        node[SIZE] = node[RIGHT][SIZE];
        node[HEIGHT] = node[RIGHT][HEIGHT];
        node[LEFT] = node[RIGHT][LEFT];
        node[RIGHT] = node[RIGHT][RIGHT];
      } else {
        node[SIZE] = 0;
      }
      return retVal;
    }
    if (node[RIGHT]) {
      const retVal = del(node[RIGHT], idx);
      if (node[RIGHT][SIZE] === 0) node[RIGHT] = null;
      baranced(node);
      return retVal;
    }
  }
};

function* forEach<T>(node: Node<T>): Generator<T, void, unknown> {
  if (node[LEFT]) yield* forEach(node[LEFT]);
  yield node[VALUE];
  if (node[RIGHT]) yield* forEach(node[RIGHT]);
}

/**
 * AVL Treeの実装
 */
export class AVLTree<T> {
  #compare: (a: T, b: T) => number;
  #root: Node<T> | null = null;
  /**
   * @param compare 比較する関数
   */
  constructor(compare: (a: T, b: T) => number = defaultCompare) {
    this.#compare = compare;
  }

  /**
   * 要素を挿入する
   * @param value 対象の要素
   * @returns `this`
   */
  add(value: T): this {
    if (this.#root) {
      add(this.#root, value, this.#compare);
    } else {
      this.#root = [value, 1, 1, null, null];
    }
    return this;
  }

  /**
   * index+1番目の要素を調べる
   * @param index 要素のindex
   * @returns その要素。無い場合はundefined
   */
  at(index: number): T | undefined {
    if (this.#root) {
      return at(this.#root, index);
    }
  }

  /**
   * index+1番目の要素を削除する
   * @param index 要素のindex
   * @returns 削除した要素。要素が最初から無かった場合はundefined
   */
  delete(index: number): T | undefined {
    if (this.#root) {
      const retVal = del(this.#root, index);
      if (this.#root[SIZE] === 0) this.#root = null;
      return retVal;
    }
  }

  /**
   * 要素を順番に反復する
   * @param callbackfn 反復する関数
   * @param thisArg `callbackfn`の`this`
   */
  forEach(
    callbackfn: (value: T, index: number, avlTree: AVLTree<T>) => void,
    thisArg?: unknown,
  ): void {
    if (!this.#root) return;
    let i = 0;
    for (const v of forEach(this.#root)) {
      callbackfn.call(thisArg, v, i++, this);
    }
  }
}
