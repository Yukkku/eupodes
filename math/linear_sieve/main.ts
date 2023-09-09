export class LinearSieve {
  #data: Uint32Array;
  #primes: number[] = [];

  constructor(n: number) {
    this.#data = new Uint32Array(n);

    for (let i = 2; i < n; i += 1) {
      if (this.#data[i] === 0) {
        this.#primes.push(i);
        this.#data[i] = i;
      }
      for (let j = 0; j < this.#primes.length; j += 1) {
        const p = this.#primes[j];
        if (p > this.#data[i] || p * i >= n) {
          break;
        }
        this.#data[p * i] = p;
      }
    }
  }

  /**
   * mが素数か判定する
   * @param m `0 <= m < n`を満たす整数
   */
  isPrime(m: number): boolean {
    return this.#data[m] === m;
  }

  /**
   * mを素因数分解する
   * @param m `0 <= m < n`を満たす整数
   * @return 昇順に並んだ素因数の配列。同じ素因数が2つ以上あるなら複数個配列に含まれる (`m === 90`の場合`[2, 3, 3, 5]`)
   */
  factorize(m: number): number[] {
    const retVal: number[] = [];

    while (m > 1) {
      retVal.push(this.#data[m]);
      m /= this.#data[m];
    }

    return retVal;
  }

  /**
   * mの最小の素因数を返す
   * @param m `2 <= m < n`を満たす整数
   * @return mの最小の素因数
   */
  minFactor(m: number): number {
    return this.#data[m];
  }

  /**
   * n未満の素数を小さい順に吐くイテレータを返す
   */
  *primes() {
    yield* this.#primes;
  }
}
