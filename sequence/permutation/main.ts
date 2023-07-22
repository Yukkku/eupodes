export const Permutation = {
  new(n: number) {
    const retVal = [];
    for (let i = 0; i < n; i += 1) {
      retVal.push(i);
    }
    return retVal;
  },

  next(p: number[]) {
    if (p.length < 1) return false;
    let i = p.length - 2;
    while (p[i] > p[i + 1]) {
      if (i === 0) return false;
      i -= 1;
    }
    let j = p.length - 1;
    while (p[j] < p[i]) {
      j -= 1;
    }
    const tmp = p[i];
    p[i++] = p[j];
    p[j] = tmp;
    j = p.length - 1;
    while (i < j) {
      const tmp = p[i];
      p[i++] = p[j];
      p[j--] = tmp;
    }
    return true;
  },

  prev(p: number[]) {
    if (p.length < 1) return false;
    let i = p.length - 2;
    while (p[i] < p[i + 1]) {
      if (i === 0) return false;
      i -= 1;
    }
    let j = p.length - 1;
    while (p[j] > p[i]) {
      j -= 1;
    }
    const tmp = p[i];
    p[i++] = p[j];
    p[j] = tmp;
    j = p.length - 1;
    while (i < j) {
      const tmp = p[i];
      p[i++] = p[j];
      p[j--] = tmp;
    }
    return true;
  },
};
