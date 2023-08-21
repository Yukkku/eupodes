import { assert } from "../../util.ts";

export type Node<T> = [T, number, number, Node<T> | null, Node<T> | null];
export const VALUE = 0;
export const SIZE = 1;
export const RANK = 2;
export const LEFT = 3;
export const RIGHT = 4;

export const nodeMk = <T>(val: T): Node<T> => [
  val,
  1,
  1,
  null,
  null,
];

/**
 * `SIZE`, `RANK`を正しい値にセットする
 */
export const nodeSet = (node: Node<unknown>) => {
  node[SIZE] = (node[RIGHT]?.[SIZE] ?? 0) + (node[LEFT]?.[SIZE] ?? 0) + 1;
  node[RANK] = Math.max(node[RIGHT]?.[RANK] ?? 0, node[LEFT]?.[RANK] ?? 0) + 1;
};

/**
 * 右回転。不正な`SIZE`,`RANK`可
 */
const nodeRrot = (node: Node<unknown>) => {
  if (!node[LEFT]) return;

  node[RIGHT] = [
    node[VALUE],
    0,
    0,
    node[LEFT][RIGHT],
    node[RIGHT],
  ];
  nodeSet(node[RIGHT]);

  node[VALUE] = node[LEFT][VALUE];
  node[LEFT] = node[LEFT][LEFT];
  nodeSet(node);
};

/**
 * 左回転。不正な`SIZE`,`RANK`可
 */
const nodeLrot = (node: Node<unknown>) => {
  if (!node[RIGHT]) return;

  node[LEFT] = [
    node[VALUE],
    0,
    0,
    node[LEFT],
    node[RIGHT][LEFT],
  ];
  nodeSet(node[LEFT]);

  node[VALUE] = node[RIGHT][VALUE];
  node[RIGHT] = node[RIGHT][RIGHT];
  nodeSet(node);
};

/**
 * 良い感じに回転して平衡を取る。不正な`SIZE`,`RANK`可
 */
export const nodeBal = (node: Node<unknown>) => {
  const d = (node[LEFT]?.[RANK] ?? 0) - (node[RIGHT]?.[RANK] ?? 0);

  if (d > 1) {
    assert(node[LEFT]);
    const sd = (node[LEFT][LEFT]?.[RANK] ?? 0) -
      (node[LEFT][RIGHT]?.[RANK] ?? 0);
    if (sd < 0) {
      nodeLrot(node[LEFT]);
    }
    nodeRrot(node);
  } else if (d < -1) {
    assert(node[RIGHT]);
    const sd = (node[RIGHT][LEFT]?.[RANK] ?? 0) -
      (node[RIGHT][RIGHT]?.[RANK] ?? 0);
    if (sd > 0) {
      nodeRrot(node[RIGHT]);
    }
    nodeLrot(node);
  } else {
    nodeSet(node);
  }
};

export function* nodeIter<T>(node: Node<T>) {
  const s = [node];
  const m: (0 | 1)[] = [0];
  while (s.length) {
    const v = s.pop()!;
    let u = m.pop()!;
    if (u === 0) {
      if (v[LEFT]) {
        s.push(v, v[LEFT]);
        m.push(1, 0);
      } else {
        u = 1;
      }
    }
    if (u === 1) {
      yield v[VALUE];
      if (v[RIGHT]) {
        s.push(v[RIGHT]);
        m.push(0);
      }
    }
  }
}
