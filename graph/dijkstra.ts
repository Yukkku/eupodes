import { WeightedGraph } from "./util.ts";
import { IndexedRadixHeap } from "../radix_heap/main.ts";

export class Dijkstra implements WeightedGraph {
  #edges: number[][] = [];
  #costs: number[][] = [];

  constructor(size: number) {
    for (let i = 0; i < size; i += 1) {
      this.#edges.push([]);
      this.#costs.push([]);
    }
  }

  addEdge(from: number, to: number, cost: number, directed = false) {
    this.#edges[from].push(to);
    this.#costs[from].push(cost);
    if (!directed) {
      this.#edges[to].push(from);
      this.#costs[to].push(cost);
    }
  }

  distance(from?: number): number[];
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

  get size() {
    return this.#edges.length;
  }
}
