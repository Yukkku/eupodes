import { UnionFind } from "../main.ts";
import { WeightedGraph } from "./util.ts";

export class Kruskal implements WeightedGraph {
  #u: number[] = [];
  #v: number[] = [];
  #cost: number[] = [];
  #size: number;

  constructor(size: number) {
    this.#size = size;
  }

  /** 頂点数を返す */
  get size() {
    return this.#size;
  }

  /**
   * 辺を追加する
   * @returns 辺に割り当てられた番号。0から順番に振られる
   */
  addEdge(u: number, v: number, cost: number) {
    this.#u.push(u);
    this.#v.push(v);
    return this.#cost.push(cost) - 1;
  }

  /**
   * 最小全域森を構成する
   * @return 最小全域森の辺(に振られた番号)の`Set`
   */
  mst() {
    const ec = this.#u.length;
    const s = [];
    for (let i = 0; i < ec; i += 1) {
      s.push(i);
    }
    s.sort((a, b) => this.#cost[a] - this.#cost[b]);

    const uf = new UnionFind(this.#size);
    const retVal: number[] = [];

    for (let i = 0; i < s.length; i += 1) {
      const c = s[i];
      if (!uf.same(this.#u[c], this.#v[c])) {
        uf.marge(this.#u[c], this.#v[c]);
        retVal.push(c);
      }
    }
    return new Set(retVal);
  }
}
