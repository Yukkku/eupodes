/**
 * 重み付きUnionFindの実装
 */
export class PotentialUnionFind {
  /** 親の要素。根の場合は-(木の大きさ) */
  #parent: Int32Array;
  /** val[i] - val[parent[i]]の値、根の場合は矛盾があるか否か(0|1) */
  #diff: Float64Array;

  /**
   * @param n 要素数の上限
   */
  constructor(n: number) {
    this.#parent = new Int32Array(n).fill(-1);
    this.#diff = new Float64Array(n);
  }

  /**
   * 要素の根を探す
   * @param a 調べたい要素の番号
   * @returns 根の番号
   */
  root(a: number): number {
    const parent = this.#parent[a];

    if (parent < 0) {
      return a;
    }

    const root = this.root(parent);
    this.#diff[a] += this.#diff[this.#parent[a]];
    this.#parent[a] = root;
    return root;
  }

  /**
   * aとbが属するグループを1つに合体する
   * @param a
   * @param b
   * @param diff `v[a] - v[b]`の値
   * @returns 新しいグループの根
   */
  marge(a: number, b: number, diff: number): number {
    const aRoot = this.root(a);
    const bRoot = this.root(b);

    if (aRoot === bRoot) {
      if (this.#diff[a] - this.#diff[b] !== diff) {
        this.#diff[aRoot] = 1;
      }
      return aRoot;
    }

    if (this.#parent[aRoot] > this.#parent[bRoot]) {
      this.#parent[bRoot] += this.#parent[aRoot];
      this.#parent[aRoot] = bRoot;
      if (this.#diff[aRoot]) this.#diff[bRoot] = 1;
      this.#diff[aRoot] = diff - this.#diff[a] + this.#diff[b];
      return bRoot;
    } else {
      this.#parent[aRoot] += this.#parent[bRoot];
      this.#parent[bRoot] = aRoot;
      if (this.#diff[bRoot]) this.#diff[aRoot] = 1;
      this.#diff[bRoot] = this.#diff[a] - this.#diff[b] - diff;
      return aRoot;
    }
  }

  /**
   * aの所属するグループのサイズを調べる
   * @param a
   * @returns グループのサイズ
   */
  size(a: number): number {
    return 0 - this.#parent[this.root(a)];
  }

  /**
   * aとbが同じグループに属しているか調べる
   * @param a
   * @param b
   * @returns 同じグループに属しているか判定
   */
  same(a: number, b: number): boolean {
    return this.root(a) === this.root(b);
  }

  /**
   * ポテンシャルの差を返す
   * @param a
   * @param b
   * @returns `val[a] - val[b]`の値。矛盾しているときは`NaN`を返す
   */
  diff(a: number, b: number): number {
    const root = this.root(a);
    if (root !== this.root(b)) {
      return NaN;
    }
    if (this.#diff[root]) {
      return NaN;
    }
    return this.#diff[a] - this.#diff[b];
  }
}
