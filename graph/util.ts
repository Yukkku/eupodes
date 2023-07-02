export interface PlainGlaph {
  addEdge?(from: number, to: number, directed?: boolean): unknown;
  removeEdge?(from: number, to: number, directed?: boolean): boolean;
  readonly size: number;
}

export interface WeightedGraph {
  addEdge?(
    from: number,
    to: number,
    weight: number,
    directed?: boolean,
  ): unknown;
  removeEdge?(
    from: number,
    to: number,
    weight: number,
    directed?: boolean,
  ): boolean;
  readonly size: number;
}
