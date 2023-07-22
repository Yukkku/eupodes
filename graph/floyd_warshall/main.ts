import { WeightedGraph } from "../util.ts";

export class FloydWarshall implements WeightedGraph {
  #d: number[][] = [];

  constructor(size: number) {
    for (let i = 0; i < size; i += 1) {
      const tmp = [];
      for (let j = 0; j < size; j += 1) {
        tmp.push(i === j ? 0 : Infinity);
      }
      this.#d.push(tmp);
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
    this.#d[from][to] = Math.min(this.#d[from][to], cost);
    if (!directed) {
      this.#d[to][from] = Math.min(this.#d[to][from], cost);
    }
  }

  /** 頂点数 */
  get size() {
    return this.#d.length;
  }

  /**
   * ワーシャルフロイド法を適用する
   * @returns 距離の配列。添え字は`retVal[from][to]`の順
   */
  calc(): readonly number[][] {
    const size = this.size;
    for (let k = 0; k < size; k += 1) {
      for (let i = 0; i < size; i += 1) {
        for (let j = 0; j < size; j += 1) {
          const d = this.#d[i][k] + this.#d[k][j];
          if (d < this.#d[i][j]) this.#d[i][j] = d;
        }
      }
    }
    return this.#d;
  }
}
