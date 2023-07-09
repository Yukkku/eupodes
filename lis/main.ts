/**
 * LIS関連の実装の詰め合わせ
 */
export class LIS {
  /**
   * LISの長さを返す
   * @param arr 対象の配列
   * @param strictly (狭義/広義)短調増加の設定。デフォルトでtrue
   * @returns LISの長さ
   */
  static len<T>(arr: T[], strictly = true) {
    const dp: T[] = [];
    for (let i = 0; i < arr.length; i += 1) {
      const v = arr[i];
      let min = -1;
      let max = dp.length;
      while (max - min > 1) {
        const mid = (min + max) >> 1;
        if (strictly ? dp[mid] < v : dp[mid] <= v) {
          min = mid;
        } else {
          max = mid;
        }
      }
      dp[min + 1] = v;
    }

    return dp.length;
  }

  /**
   * LISを返す
   * @param arr 対象の配列
   * @param strictly (狭義/広義)短調増加の設定。デフォルトでtrue
   * @returns LIS
   */
  static lis<T>(arr: T[], strictly = true) {
    const dp: number[] = [];
    const prev: number[] = [];
    for (let i = 0; i < arr.length; i += 1) {
      const v = arr[i];
      let min = -1;
      let max = dp.length;
      while (max - min > 1) {
        const mid = (min + max) >> 1;
        if (strictly ? arr[dp[mid]] < v : arr[dp[mid]] <= v) {
          min = mid;
        } else {
          max = mid;
        }
      }
      dp[min + 1] = i;
      prev.push(dp[min] ?? -1);
    }

    const retVal: T[] = [];
    let idx = dp.pop() ?? -1;
    while (idx >= 0) {
      retVal.push(arr[idx]);
      idx = prev[idx];
    }
    return retVal.reverse();
  }

  /**
   * LISの各要素の基の配列でのindexの配列を返す
   * @param arr 対象の配列
   * @param strictly (狭義/広義)短調増加の設定。デフォルトでtrue
   * @returns LISの各要素のarrでのindexの配列
   */
  static lisIdx<T>(arr: T[], strictly = true) {
    const dp: number[] = [];
    const prev: number[] = [];
    for (let i = 0; i < arr.length; i += 1) {
      const v = arr[i];
      let min = -1;
      let max = dp.length;
      while (max - min > 1) {
        const mid = (min + max) >> 1;
        if (strictly ? arr[dp[mid]] < v : arr[dp[mid]] <= v) {
          min = mid;
        } else {
          max = mid;
        }
      }
      dp[min + 1] = i;
      prev.push(dp[min] ?? -1);
    }

    const retVal: number[] = [];
    let idx = dp.pop() ?? -1;
    while (idx >= 0) {
      retVal.push(idx);
      idx = prev[idx];
    }
    return retVal.reverse();
  }
}
