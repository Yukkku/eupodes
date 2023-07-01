/**
 * Z algorithmの実装。ACLをTypeScriptに書き換えただけです。
 * @param arr 対象の配列
 * @returns `arr`に対するZ array
 */
export function zAlgo(arr: ArrayLike<unknown>): number[] {
  const len = arr.length;
  const z = [0];
  let j = 0;
  for (let i = 1; i < len; i += 1) {
    let k = (j + z[j] <= i) ? 0 : Math.min(j + z[j] - i, z[i - j]);
    while (i + k < len && arr[k] === arr[i + k]) {
      k += 1;
    }
    z.push(k);
    if (j + z[j] < i + z[i]) j = i;
  }

  z[0] = len;
  return z;
}
