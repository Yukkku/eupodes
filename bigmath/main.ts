export const BigMath = {
  abs (x: bigint): bigint {
    if (x < 0n) return -x;
    return x;
  },

  cbrt (x: bigint): bigint {
    let min = x < 0 ? x : 0n;
    let max = x < 0 ? 0n : x + 1n;
    while (max - min > 1) {
      const mid = (max + min) >> 1n;
      if (mid ** 3n > x) {
        max = mid;
      } else {
        min = mid;
      }
    }
    return min;
  },

  max (...values: bigint[]): bigint {
    if (values.length === 0) {
      throw new Error();
    }
    let ans = values[0];
    for (const val of values) {
      if (val > ans) ans = val;
    }
    return ans;
  },

  min (...values: bigint[]): bigint {
    if (values.length === 0) {
      throw new Error();
    }
    let ans = values[0];
    for (const val of values) {
      if (val < ans) ans = val;
    }
    return ans;
  },

  pow (x: bigint, y: bigint): bigint {
    return x ** y;
  },

  sign (x: bigint): bigint {
    if (x > 0n) return 1n;
    if (x < 0n) return -1n;
    return 0n;
  },

  sqrt (x: bigint): bigint {
    let t = x;
    while (1) {
      const u = (t + x/t) / 2n;
      if (t === u) break;
      t = u;
    }
    if (t ** 2n > x) t -= 1n;
    return t;
  },
};
