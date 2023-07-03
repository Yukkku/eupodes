export class EulerTour {
  #data: number[] = [];
  #l: number[] = [];
  #r: number[] = [];
  constructor(edges: ([number, number]|[number, number, number])[], root = 0) {
    const n = edges.length + 1;
    const adj: number[][] = [];
    const prog: (0 | 1)[] = [];
    for (let i = 0; i < n; i += 1) {
      adj.push([]);
      prog.push(0);
      this.#l.push(0);
      this.#r.push(0);
    }
    for (const edge of edges) {
      adj[edge[0]].push(edge[1]);
      adj[edge[1]].push(edge[0]);
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
      for (const u of adj[v]) {
        if (prog[u]) continue;
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

  *[Symbol.iterator]() {
    for (const v of this.#data) {
      yield v;
    }
  }
}
