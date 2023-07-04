export class EulerTour {
  #data: number[] = [];
  #l: number[] = [];
  #r: number[] = [];
  #depth: number[] = [];
  #cost: number[] = [];
  constructor(
    edges: ([number, number] | [number, number, number])[],
    root = 0,
  ) {
    const n = edges.length + 1;
    const a: number[][] = [];
    const c: number[][] = [];
    const prog: (0 | 1)[] = [];
    for (let i = 0; i < n; i += 1) {
      a.push([]);
      c.push([]);
      prog.push(0);
      this.#l.push(0);
      this.#r.push(0);
      this.#depth.push(0);
      this.#cost.push(0);
    }
    for (const edge of edges) {
      a[edge[0]].push(edge[1]);
      a[edge[1]].push(edge[0]);
      c[edge[0]].push(edge[2] ?? 1);
      c[edge[1]].push(edge[2] ?? 1);
    }
    const stack = [root];
    while (stack.length > 0) {
      const v = stack.pop() as number;
      this.#data.push(v);
      this.#r[v] = this.#data.length;
      if (prog[v]) {
        continue;
      }
      this.#l[v] = this.#data.length - 1;
      prog[v] = 1;
      let i = -1;
      for (const u of a[v]) {
        i += 1;
        if (prog[u]) continue;
        this.#depth[u] = this.#depth[v] + 1;
        this.#cost[u] = this.#cost[v] + c[v][i];
        stack.push(v);
        stack.push(u);
      }
    }
  }

  /**
   * 親ノードを返す
   * @param v 目的の頂点の番号
   * @returns 親ノードの番号。根の場合は-1;
   */
  parent(v: number): number {
    if (this.#l[v] === 0) return -1;
    return this.#data[this.#l[v] - 1];
  }

  /**
   * 頂点`u`の部分木に頂点`v`が含まれるか調べる
   * @param u 部分木の根の番号
   * @param v 調べる頂点の番号
   * @returns 含まれるなら`true`、含まれないなら`false`
   */
  inSubtree(u: number, v: number): boolean {
    return this.#l[u] <= this.#l[v] && this.#r[v] <= this.#r[u];
  }

  /**
   * 頂点`v`の深さを返す
   * @param v 対象の頂点
   * @returns 根から頂点`v`へのパスに含まれる辺の数
   */
  depth(v: number): number {
    return this.#depth[v];
  }

  /**
   * 根から頂点`v`への距離を返す
   * @param v 対象の頂点
   * @returns 根から頂点`v`への距離
   */
  cost(v: number): number {
    return this.#cost[v];
  }

  /**
   * 頂点に対応する区間を返す
   * @param v 対象の頂点
   * @returns [`retVal[0]`, `retVal[1]`)の形の半開区間
   */
  range(v: number): [number, number] {
    return [this.#l[v], this.#r[v]];
  }

  *[Symbol.iterator]() {
    for (const v of this.#data) {
      yield v;
    }
  }
}
