export interface Graph<T extends unknown[]> {
  addEdge(from: number, to: number, ...data: T): void;
  getEdge(
    from: number,
    to: number,
  ): T extends [] ? boolean : T extends [infer U] ? U : T;

  readonly size: number;
  readonly directed: boolean;
}

export class PlainGraph implements Graph<[]> {
  #size: number;
  #edges: Set<number>[] = [];
  #directed: boolean;

  constructor(directed: boolean, size: number) {
    this.#directed = directed;
    this.#size = size;
    this.#edges = [];

    for (let i = 0; i < size; i += 1) {
      this.#edges.push(new Set());
    }
  }

  get size() {
    return this.#size;
  }

  get directed() {
    return this.#directed;
  }

  addEdge(from: number, to: number): void {
    this.#edges[from].add(to);

    if (!this.#directed) {
      this.#edges[to].add(from);
    }
  }

  getEdge(from: number, to: number): boolean;
  getEdge(index: number): Set<number>;
  getEdge(from: number, to?: number): boolean | Set<number> {
    if (to == null) {
      return this.#edges[from];
    }

    return this.#edges[from].has(to);
  }
}

export class GraphWithCost implements Graph<[number]> {
  #size: number;
  #edges: Map<number, number>[];
  #directed: boolean;

  constructor(directed: boolean, size: number) {
    this.#directed = directed;
    this.#size = size;
    this.#edges = [];

    for (let i = 0; i < size; i += 1) {
      this.#edges.push(new Map());
    }
  }

  get size() {
    return this.#size;
  }

  get directed() {
    return this.#directed;
  }

  addEdge(from: number, to: number, cost: number): void {
    const beforeCost = this.#edges[from].get(to) ?? Infinity;

    if (cost >= beforeCost) return;

    this.#edges[from].set(to, cost);

    if (this.#directed) return;

    this.#edges[to].set(from, cost);
  }

  getEdge(from: number, to: number): number;
  getEdge(index: number): Map<number, number>;
  getEdge(from: number, to?: number): number | Map<number, number> {
    if (to == null) {
      return this.#edges[from];
    }

    return this.#edges[from].get(to) ?? Infinity;
  }
}
