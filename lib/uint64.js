/*
 * 64-bit uint (uint64) arithmetics.
 *
 * A uint64 is represented as a pair of int32s `[lo, hi]` where `lo` represents the lower bits,
 * and `hi` represents higher.
 */

export const zero = [0x00000000, 0x00000000];
export const one  = [0x00000001, 0x00000000];

/**
 * Copy `y` to `x`.
 * @param {uint64_ptr} x
 * @param {uint64} y
 * @returns {undefined}
 */
export function $copy(x, y) {
  x[0] = y[0];
  x[1] = y[1];
}

/**
 * Computes `x + y`.
 * @param {uint64} x
 * @param {uint64} y
 * @returns {uint64}
 */
export function add(x, y) {
  const lo = x[0] + y[0];
  const overflow = (x[0] < 0 && (y[0] < 0 || lo >= 0)) || (y[0] < 0 && lo >= 0) ? 1 : 0;
  const hi = x[1] + y[1] + overflow;
  return [lo | 0, hi | 0];
}

/**
 * Compiutes `x + y` and assign it to `x`.
 * @param {uint64_ptr} x
 * @param {uint64} y
 * @returns {undefined}
 */
export function $add(x, y) {
  const lo = x[0] + y[0];
  const overflow = (x[0] < 0 && (y[0] < 0 || lo >= 0)) || (y[0] < 0 && lo >= 0) ? 1 : 0;
  const hi = x[1] + y[1] + overflow;
  x[0] = lo | 0;
  x[1] = hi | 0;
}

/**
 * Computes `x + a` where `a` is a 32-bit uint, and assign it to `x`.
 * @param {uint64_ptr} x
 * @param {uint32} a
 * @returns {undefined}
 */
export function $addUint32(x, a) {
  const as = a | 0;
  const lo = x[0] + as;
  const overflow = (x[0] < 0 && (as < 0 || lo >= 0)) || (as < 0 && lo >= 0) ? 1 : 0;
  const hi = x[1] + overflow;
  x[0] = lo | 0;
  x[1] = hi | 0;
}

/**
 * Computes `x + 1`.
 * @param {uint64} x
 * @returns {uint64}
 */
export function incr(x) {
  const lo = x[0] + 1;
  const overflow = x[0] < 0 && lo >= 0 ? 1 : 0;
  const hi = x[1] + overflow;
  return [lo | 0, hi | 0];
}

/**
 * Computes `x < y`.
 * @param {uint64} x
 * @param {uint64} y
 * @returns {boolean}
 */
export function lt(x, y) {
  const x1u = x[1] >>> 0;
  const h1u = y[1] >>> 0;
  if (x1u < h1u) {
    return true;
  }
  else if (x1u > h1u) {
    return false;
  }
  else {
    return (x[0] >>> 0) < (y[0] >>> 0);
  }
}

/**
 * Computes `x & y`.
 * @param {uint64} x
 * @param {uint64} y
 * @returns {uint64}
 */
export function and(x, y) {
  return [x[0] & y[0], x[1] & y[1]];
}

/**
 * Computes `x | y`.
 * @param {uint64} x
 * @param {uint64} y
 * @returns {uint64}
 */
export function or(x, y) {
  return [x[0] | y[0], x[1] | y[1]];
}

/**
 * Computes `x ^ y`.
 * @param {uint64} x
 * @param {uint64} y
 * @returns {uint64}
 */
export function xor(x, y) {
  return [x[0] ^ y[0], x[1] ^ y[1]];
}

/**
 * Computes `x ^ y` and assing it to `x`.
 * @param {uint64_ptr} x
 * @param {uint64} y
 * @returns {undefined}
 */
export function $xor(x, y) {
  x[0] = x[0] ^ y[0];
  x[1] = x[1] ^ y[1];
}

/**
 * Computes `x << n`.
 * @param {uint64} x
 * @param {number} n
 * @returns {uint64}
 */
export function shiftL(x, n) {
  if (n === 0) {
    return x;
  }
  else if (n < 32) {
    return [
      x[0] << n,
      (x[0] >>> (32 - n)) | (x[1] << n),
    ];
  }
  else if (n < 64) {
    return [
      0,
      x[0] << (n - 32),
    ];
  }
  else {
    return zero;
  }
}

/**
 * Computes `x >> n`.
 * @param {uint64} x
 * @param {number} n
 * @returns {uint64}
 */
export function shiftR(x, n) {
  if (n === 0) {
    return x;
  }
  else if (n < 32) {
    return [
      (x[0] >>> n) | (x[1] << (32 - n)),
      (x[1] >>> n) | 0,
    ];
  }
  else if (n < 64) {
    return [
      (x[1] >>> (n - 32)) | 0,
      0,
    ];
  }
  else {
    return zero;
  }
}

/**
 * Computes bit rotation to left.
 * @param {uint64} x
 * @param {number} n
 * @returns {uint64}
 */
export function rotL(x, n) {
  const n64 = n % 64;
  return or(shiftL(x, n64), shiftR(x, 64 - n64));
}

/**
 * Computes `rotL(x, y)` and assign it to `x`.
 * @param {uint64_ptr} x
 * @param {number} n
 * @returns {undefined}
 */
export function $rotL(x, n) {
  const n64 = n % 64;
  let l0, l1;
  if (n64 === 0) {
    l0 = x[0];
    l1 = x[1];
  }
  else if (n64 < 32) {
    l0 = x[0] << n64;
    l1 = (x[0] >>> (32 - n64)) | (x[1] << n64);
  }
  else if (n64 < 64) {
    l0 = 0;
    l1 = x[0] << (n64 - 32);
  }
  else {
    l0 = 0;
    l1 = 0;
  }
  let r0, r1;
  if (n64 === 64) {
    r0 = x[0];
    r1 = x[1];
  }
  else if (n64 > 32) {
    r0 = (x[0] >>> (64 - n64)) | (x[1] << (n64 - 32));
    r1 = (x[1] >>> (64 - n64)) | 0;
  }
  else if (n64 > 0) {
    r0 = (x[1] >>> (32 - n64)) | 0;
    r1 = 0;
  }
  else {
    r0 = 0;
    r1 = 0;
  }
  x[0] = l0 | r0;
  x[1] = l1 | r1;
}

/**
 * Sets i-th bit of `x` to `1`.
 * @param {bigint} x
 * @param {bigint} i
 * @returns {bigint}
 */
export function setBit(x, i) {
  if (i < 32) {
    return [
      x[0] | (1 << i),
      x[1],
    ];
  }
  else if (i < 64) {
    return [
      x[0],
      x[1] | (1 << (i - 32)),
    ];
  }
  else {
    return x;
  }
}
