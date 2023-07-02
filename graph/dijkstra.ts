import { WeightedGraph } from "./util.ts";
import { IndexedRadixHeap } from "../radix_heap/main.ts";

/**
 * Dijkstra法の実装
 */
export class Dijkstra implements WeightedGraph {
  #edges: number[][] = [];
  #costs: number[][] = [];

  /**
   * @param size 頂点数
   */
  constructor(size: number) {
    for (let i = 0; i < size; i += 1) {
      this.#edges.push([]);
      this.#costs.push([]);
    }
  }

  /**
   * 辺を追加する
   * @param from 辺の始点 (無向辺の場合は端点)
   * @param to 辺の終点 (無向辺の場合は`from`と異なる端点)
   * @param cost 辺のコスト
   * @param directed 有向辺か否か(デフォルトでfalse)
   */
  addEdge(from: number, to: number, cost: number, directed = false) {
    this.#edges[from].push(to);
    this.#costs[from].push(cost);
    if (!directed) {
      this.#edges[to].push(from);
      this.#costs[to].push(cost);
    }
  }

  /** 頂点数 */
  get size() {
    return this.#edges.length;
  }

  /**
   * 頂点`from`からの距離の集合を返す
   * @param from 始点
   * @return 各頂点からの距離の配列
   */
  distance(from?: number): number[];
  /**
   * 頂点`from`から`to`への距離の集合を返す
   * @param from 始点
   * @param to 終点
   * @return `from`から`to`への最短経路の長さ
   */
  distance(from: number, to: number): number;
  distance(from = 0, to?: number): number[] | number {
    const size = this.size;
    const heap = new IndexedRadixHeap(size);
    const d: number[] = [];
    for (let i = 0; i < size; i += 1) {
      d.push(Infinity);
    }
    heap.set(from, 0);
    while (heap.size > 0) {
      const f = heap.pop() as [number, number];
      const v = f[0];
      const ds = f[1];
      if (v === to) {
        return ds;
      }
      d[v] = ds;
      const di = this.#edges[v].length;
      for (let i = 0; i < di; i += 1) {
        const tv = this.#edges[v][i];
        const td = ds + this.#costs[v][i];
        if (td < d[tv]) {
          heap.set(tv, td);
          d[tv] = td;
        }
      }
    }
    if (to == null) {
      return d;
    } else {
      return Infinity;
    }
  }
}
