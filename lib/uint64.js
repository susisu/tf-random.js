/*
 * 64-bit uint (uint64) arithmetics.
 *
 * A uint64 is represented as a pair of int32s `[lo, hi]` where `lo` represents the lower bits,
 * and `hi` represents higher.
 */

export const ZERO          = [0x00000000 | 0, 0x00000000 | 0];
export const ONE           = [0x00000001 | 0, 0x00000000 | 0];
export const MAX           = [0xFFFFFFFF | 0, 0xFFFFFFFF | 0];
export const MAX_MINUS_ONE = [0xFFFFFFFE | 0, 0xFFFFFFFF | 0];

/**
 * Casts a uint32 to uint64.
 * @param {number} a - A 32-bit uint.
 * @returns {uint64}
 */
export function fromUint32(a) {
  return [a | 0, 0];
}

const SAFE_INT_HI_MASK = 0x1FFFFF;    // 53 - 32 = 21 bits
const SAFE_INT_HI_MULT = 0x100000000; // 1 << 32
const SAFE_INT_HI_SIGN = 1 << 21;     // positive if bit is set

/**
 * Casts a safe integer (`-(2 ** 53 - 1)` to `2 ** 53 -1`) to uint64.
 * Integers are sequentially mapped in the range between `0` and `2 ** 54 - 2`.
 * @param {number} a - A safe integer.
 * @returns {uint64}
 */
export function fromSafeInt(a) {
  if (!Number.isSafeInteger(a)) {
    throw new Error(`${a} is not a safe integer`);
  }
  if (a <= 0) {
    const b = a + Number.MAX_SAFE_INTEGER; // 0 <= b <= 2 ** 53 - 1
    const lo = (b % SAFE_INT_HI_MULT) | 0;
    const hi = Math.floor(b / SAFE_INT_HI_MULT) & SAFE_INT_HI_MASK;
    return [lo, hi];
  }
  else {
    const b = a - 1; // 0 <= b <= 2 ** 53 - 2
    const lo = (b % SAFE_INT_HI_MULT) | 0;
    const hi = (Math.floor(b / SAFE_INT_HI_MULT) & SAFE_INT_HI_MASK) | SAFE_INT_HI_SIGN;
    return [lo, hi];
  }
}

/**
 * Casts a uint64 to a safe integer (`-(2 ** 53 - 1)` to `2 ** 53 -1`).
 * @param {uint64} x
 * @returns {number}
 */
export function toSafeInt(x) {
  const a = x[0] >>> 0;
  const b = (x[1] & SAFE_INT_HI_MASK) >>> 0;
  if (x[1] & SAFE_INT_HI_SIGN) {
    return b * SAFE_INT_HI_MULT + a + 1;
  }
  else {
    return b * SAFE_INT_HI_MULT + a - Number.MAX_SAFE_INTEGER;
  }
}

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
  const lo = (x[0] + y[0]) | 0;
  const overflow = (x[0] < 0 && (y[0] < 0 || lo >= 0)) || (y[0] < 0 && lo >= 0) ? 1 : 0;
  const hi = (x[1] + y[1] + overflow) | 0;
  return [lo, hi];
}

/**
 * Compiutes `x + y` and assign it to `x`.
 * @param {uint64_ptr} x
 * @param {uint64} y
 * @returns {undefined}
 */
export function $add(x, y) {
  const lo = (x[0] + y[0]) | 0;
  const overflow = (x[0] < 0 && (y[0] < 0 || lo >= 0)) || (y[0] < 0 && lo >= 0) ? 1 : 0;
  const hi = (x[1] + y[1] + overflow) | 0;
  x[0] = lo;
  x[1] = hi;
}

/**
 * Computes `x + a` where `a` is a 32-bit uint, and assign it to `x`.
 * @param {uint64_ptr} x
 * @param {uint32} a
 * @returns {undefined}
 */
export function $addUint32(x, a) {
  const as = a | 0;
  const lo = (x[0] + as) | 0;
  const overflow = (x[0] < 0 && (as < 0 || lo >= 0)) || (as < 0 && lo >= 0) ? 1 : 0;
  const hi = (x[1] + overflow) | 0;
  x[0] = lo;
  x[1] = hi;
}

/**
 * Computes `x + 1`.
 * @param {uint64} x
 * @returns {uint64}
 */
export function incr(x) {
  const lo = (x[0] + 1) | 0;
  const hi = (x[1] + (lo === 0 ? 1 : 0)) | 0;
  return [lo, hi];
}

/**
 * Computes `x - y`.
 * @param {uint64} x
 * @param {uint64} y
 * @returns {uint64}
 */
export function sub(x, y) {
  const z0 = (~y[0] + 1) | 0;
  const z1 = (~y[1] + (z0 === 0 ? 1 : 0)) | 0;
  const lo = (x[0] + z0) | 0;
  const overflow = (x[0] < 0 && (z0 < 0 || lo >= 0)) || (z0 < 0 && lo >= 0) ? 1 : 0;
  const hi = (x[1] + z1 + overflow) | 0;
  return [lo, hi];
}

/**
 * Computes `x == y`.
 * @param {uint64} x
 * @param {uint64} y
 * @returns {boolean}
 */
export function eq(x, y) {
  return x[0] === y[0] && x[1] === y[1];
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
    return ZERO;
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
    return ZERO;
  }
}

/**
 * Computes `rotateL(x, y)` and assign it to `x`.
 * @param {uint64_ptr} x
 * @param {number} n
 * @returns {undefined}
 */
export function $rotateL(x, n) {
  const n64 = n % 64;
  // l = shiftL(x, n64)
  // r = shiftR(x, 64 - n64)
  let l0, l1, r0, r1;
  if (n64 === 0) {
    l0 = x[0];
    l1 = x[1];
    r0 = 0;
    r1 = 0;
  }
  else if (n64 < 32) {
    l0 = x[0] << n64;
    l1 = (x[0] >>> (32 - n64)) | (x[1] << n64);
    r0 = (x[1] >>> (32 - n64)) | 0;
    r1 = 0;
  }
  else if (n64 === 32) {
    l0 = 0;
    l1 = x[0];
    r0 = x[1];
    r1 = 0;
  }
  else {
    l0 = 0;
    l1 = x[0] << (n64 - 32);
    r0 = (x[0] >>> (64 - n64)) | (x[1] << (n64 - 32));
    r1 = (x[1] >>> (64 - n64)) | 0;
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

/**
 * Counts leading zeros.
 * @param {uint64} x
 * @returns {number}
 */
export function clz(x) {
  const clzHi = Math.clz32(x[1]);
  if (clzHi === 32) {
    return clzHi + Math.clz32(x[0]);
  }
  else {
    return clzHi;
  }
}
