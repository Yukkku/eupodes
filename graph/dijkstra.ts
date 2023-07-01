import { GraphWithCost } from "./util.ts";
import { IndexedRadixHeap } from "../radix_heap/main.ts";

/**
 * ダイクストラ法でグラフ上の最短経路を求める
 * @param graph 対象のグラフ コストは非負である必要がある
 * @param from 開始するノード
 * @returns 各頂点のノードfromからの距離
 */
export function dijkstra(graph: GraphWithCost, from: number) {
  const size = graph.size;
  const heap = new IndexedRadixHeap(size);
  const costs: number[] = [];
  const confirmed: boolean[] = [];

  for (let i = 0; i < size; i += 1) {
    costs.push(Infinity);
    confirmed.push(false);
  }

  costs[from] = 0;
  heap.set(from, 0);

  while (heap.size > 0) {
    const min = heap.pop() as [number, number];
    const idx = min[0];
    const len = min[1];

    if (confirmed[idx]) continue;

    confirmed[idx] = true;

    graph.getEdge(idx).forEach((cost, to) => {
      if (len + cost >= costs[to] || confirmed[to]) return;

      costs[to] = len + cost;
      heap.set(to, len + cost);
    });
  }

  return costs;
}
