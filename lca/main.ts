import { EulerTour } from "../euler_tour/main.ts";

export class LCA extends EulerTour {
  #dup: number[][] = [];
  constructor(
    edges: ([number, number] | [number, number, number])[],
    root = 0,
  ) {
    const len = edges.length + 1;
    super(edges, root);
    let p: number[] = [];
    for (let i = 0; i < len; i += 1) {
      p.push(this.parent(i));
    }
    this.#dup.push(p);
    if (len === 1) return;
    while (1) {
      const np: number[] = [];
      let count = 0;
      for (let i = 0; i < len; i += 1) {
        const v = p[p[i]] ?? -1;
        if (v !== -1) count += 1;
        np.push(v);
      }
      if (count === 0) break;
      this.#dup.push(np);
      p = np;
    }
    this.#dup.reverse();
  }

  /**
   * 頂点`u`と頂点`v`の最小共通祖先を求める
   * @param u 1つめの頂点の番号
   * @param v 2つめの頂点の番号
   * @returns 最小共通祖先の番号
   */
  lca(u: number, v: number): number {
    if (this.inSubtree(u, v)) return u;
    let y = u;
    for (let i = 0; i < this.#dup.length; i += 1) {
      const p = this.#dup[i];
      if (p[y] === -1) continue;
      if (!this.inSubtree(p[y], v)) y = p[y];
    }
    return this.parent(y);
  }

  /**
   * 根から頂点`v`への距離を返す
   * @param v 対象の頂点
   * @returns 根から頂点`v`への距離
   */
  cost(v: number): number;
  /**
   * 頂点`u`から頂点`v`への距離を返す
   * @param u 1つめの頂点
   * @param v 2つめの頂点
   * @returns 頂点`u`,`v`間の距離
   */
  cost(u: number, v: number): number;
  cost(u: number, v?: number): number {
    if (!v) { // vは0 or undefined.どちらも根からの距離
      return super.cost(u);
    }
    return super.cost(u) + super.cost(v) - 2 * super.cost(this.lca(u, v));
  }
}
