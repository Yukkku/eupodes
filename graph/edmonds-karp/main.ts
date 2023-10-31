import { WeightedGraph } from "../util.ts";

/** 最上位ビットだけ1 */
const TOP = 1<<31;

export class EdmondsKarp implements WeightedGraph {
  #edge: number[][] = [];
  #ft: number[] = [];
  #cap: number[] = [];
  #dir: boolean[] = [];

  constructor (size: number) {
    for (let i = 0; i < size; i += 1) {
      this.#edge.push([]);
    }
  }

  get size () {
    return this.#edge.length;
  }

  addEdge(from: number, to: number, cap: number, directed = true) {
    if (from === to || cap <= 0) return;
    const r = this.#ft.length;
    this.#edge[from].push(r);
    this.#edge[to].push(r | TOP);
    this.#ft.push(from ^ to);
    this.#cap.push(cap);
    this.#dir.push(directed);
    return r;
  }

  flow(from = 0, to = this.#edge.length - 1): [number, Readonly<Float64Array>] {
    const n = this.#edge.length;
    const m = this.#ft.length;
    const cap = Float64Array.from(this.#cap);
    const flow = new Float64Array(m);
    for (let i = 0; i < m; i += 1) {
      if (!this.#dir[i]) {
        flow[i] = cap[i];
        cap[i] *= 2;
      }
    }
    let ans = 0;

    for (;;) {
      const f = new Int32Array(n).fill(-1);
      f[from] = -2;
      const q = [from];

      X: for (let i = 0; i < q.length; i += 1) {
        const t = q[i];
        const es = this.#edge[t];
        for (let j = 0; j < es.length; j += 1) {
          const ei = es[j] & ~TOP;
          const w = this.#ft[ei] ^ t;
          if (f[w] !== -1) {
            continue;
          }
          if (es[j] & TOP) { // 逆辺
            if (flow[ei] === 0) {
              continue;
            }
          } else { // 正辺
            if (flow[ei] === cap[ei]) {
              continue;
            }
          }
          f[w] = es[j];
          if (w === to) {
            break X;
          }
          q.push(w);
        }
      }
      if (f[to] === -1) {
        break;
      }
      let lim = Infinity;
      {
        let v = to;
        while (f[v] !== -2) {
          if (f[v] & TOP) { // 逆辺
            const ei = f[v] ^ TOP;
            const l = flow[ei];
            if (l < lim) lim = l;
            v = this.#ft[ei] ^ v;
          } else { // 正辺
            const ei = f[v];
            const l = cap[ei] - flow[ei];
            if (l < lim) lim = l;
            v = this.#ft[ei] ^ v;
          }
        }
      }
      if (lim === 0) {
        throw new Error('Bug!!');
      }
      ans += lim;
      let v = to;
      while (f[v] !== -2) {
        if (f[v] & TOP) { // 逆辺
          const ei = f[v] ^ TOP;
          flow[ei] -= lim;
          v = this.#ft[ei] ^ v;
        } else { // 正辺
          const ei = f[v];
          flow[ei] += lim;
          v = this.#ft[ei] ^ v;
        }
      }
    }

    for (let i = 0; i < m; i += 1) {
      if (!this.#dir[i]) {
        flow[i] -= this.#cap[i];
      }
    }
    return [ans, flow];
  }
}

