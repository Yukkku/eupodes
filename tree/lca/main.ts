import { EulerTour } from "../euler_tour/main.ts";

export class LCA extends EulerTour {
  #table: Readonly<Uint32Array>[] = [];

  constructor(
    edges: ArrayLike<[number, number] | [number, number, number]>,
    root = 0,
  ) {
    super(edges, root);
    let last = this.data();
    let len = 1;
    this.#table.push(last);

    while (len < last.length) {
      const n = new Uint32Array(last.length - len);

      for (let i = 0; i < n.length; i += 1) {
        const a = this.depth(last[i]);
        const b = this.depth(last[i + len]);
        n[i] = a < b ? last[i] : last[i + len];
      }

      this.#table.push(n);
      last = n;
      len <<= 1;
    }
  }

  /**
   * 頂点`u`と頂点`v`の最小共通祖先を求める
   * @param u 1つめの頂点の番号
   * @param v 2つめの頂点の番号
   * @returns 最小共通祖先の番号
   */
  lca(u: number, v: number): number {
    const uidx = this.indexOf(u);
    const vidx = this.indexOf(v);
    const l = uidx > vidx ? vidx : uidx;
    const r = (uidx < vidx ? vidx : uidx) + 1;

    const i = 31 - Math.clz32(r - l);

    const a = this.#table[i][l];
    const b = this.#table[i][r - (1 << i)];
    if (this.depth(a) > this.depth(b)) {
      return b;
    } else {
      return a;
    }
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
