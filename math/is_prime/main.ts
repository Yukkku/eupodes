import { mulmod, powmod } from "../../util.ts";

const powmodBigInt = (a: bigint, b: number, n: bigint): bigint => {
  let ans = 1n;

  while (b) {
    if (b % 2 === 1) {
      b -= 1;
      ans = (ans * a) % n;
    }

    b /= 2;
    a = (a ** 2n) % n;
  }

  return ans;
};

const trialDivision = (n: number): boolean => {
  for (let i = 3; i ** 2 <= n; i += 2) {
    if (n % i === 0) return false;
  }

  return true;
};

/** 参考 : https://w.wiki/6TAJ */

const millerTest = (n: number): boolean => {
  let s = 1;
  let d = (n - 1) >>> 1;

  while ((d & 1) === 0) {
    s += 1;
    d >>>= 1;
  }

  const f = (p: number): boolean => {
    let v = powmod(p, d, n);

    if (v === 1 || v === n - 1) return true;

    for (let i = 1; i < s; i += 1) {
      v = mulmod(v, v, n);
      if (v === n - 1) return true;
    }

    return false;
  };

  return f(2) && (n < 2047 || f(7) && f(61));
};

/** 参考 : https://oeis.org/A014233 */

const millerTestU53 = (n: number): boolean => {
  let s = 1;
  let d = (n - 1) / 2;

  while (d % 2 === 0) {
    s += 1;
    d /= 2;
  }

  const nBigint = BigInt(n);
  const nMinus1 = nBigint - 1n;

  const f = (p: bigint): boolean => {
    let v = powmodBigInt(p, d, nBigint);

    if (v === 1n || v === nMinus1) return true;

    for (let i = 1; i < s; i += 1) {
      v = (v ** 2n) % nBigint;
      if (v === nMinus1) return true;
    }

    return false;
  };

  return f(2n) && f(3n) && f(5n) && f(7n) && f(11n) &&
    (n < 2152302898747 || f(13n) &&
        (n < 3474749660383 || f(17n) &&
            (n < 341550071728321 || f(19n) && f(23n))));
};

/**
 * 素数か判定する
 * @param n 素数か判定する数
 * @returns 素数ならtrue、非素数ならfalse
 */
export function isPrime(n: number): boolean {
  if (n < 2 || !Number.isInteger(n)) {
    return false;
  }
  if (n % 2 === 0) {
    return n === 2;
  }

  if (n < 8000) return trialDivision(n);

  if (
    (n % 3 === 0) || (n % 5 === 0) || (n % 7 === 0) || (n % 11 === 0) ||
    (n % 13 === 0) || (n % 17 === 0) || (n % 19 === 0) || (n % 23 === 0)
  ) return false;

  if (n < 4294967296) return millerTest(n);

  return millerTestU53(n);
}
