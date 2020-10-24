/*
 * Arithmetics of 64-bit unsigned integers.
 */

/**
 * A `Uint64` is represented as a pair of 32-bit integers `[lo, hi]` where `lo` represents the lower
 * bits, and `hi` represents higher.
 */
export type Uint64 = readonly [lo: number, hi: number];

/**
 * The writable version of `Uint64`.
 */
export type WUint64 = [lo: number, hi: number];

export const ZERO: Uint64 = [0x00000000 | 0, 0x00000000 | 0];
export const ONE: Uint64 = [0x00000001 | 0, 0x00000000 | 0];
export const MAX: Uint64 = [0xffffffff | 0, 0xffffffff | 0];
export const MAX_MINUS_ONE: Uint64 = [0xfffffffe | 0, 0xffffffff | 0];

/**
 * Casts a 32-bit integer to `Uint64`.
 */
export function fromUint32(a: number): Uint64 {
  return [a | 0, 0];
}

const SAFE_INT_HI_MASK = 0x1fffff; // 53 - 32 = 21 bits
const SAFE_INT_HI_MULT = 0x100000000; // 1 << 32
const SAFE_INT_HI_SIGN = 1 << 21; // positive if bit is set

/**
 * Casts a safe integer (`-(2 ** 53 - 1)` to `2 ** 53 -1`) to `Uint64`.
 * Integers are sequentially mapped in the range between `0` and `2 ** 54 - 2`.
 */
export function fromSafeInt(a: number): Uint64 {
  if (!Number.isSafeInteger(a)) {
    throw new Error(`${a} is not a safe integer`);
  }
  if (a <= 0) {
    const b = a + Number.MAX_SAFE_INTEGER; // 0 <= b <= 2 ** 53 - 1
    const lo = b % SAFE_INT_HI_MULT | 0;
    const hi = Math.floor(b / SAFE_INT_HI_MULT) & SAFE_INT_HI_MASK;
    return [lo, hi];
  } else {
    const b = a - 1; // 0 <= b <= 2 ** 53 - 2
    const lo = b % SAFE_INT_HI_MULT | 0;
    const hi = (Math.floor(b / SAFE_INT_HI_MULT) & SAFE_INT_HI_MASK) | SAFE_INT_HI_SIGN;
    return [lo, hi];
  }
}

/**
 * Casts a `Uint64` to a safe integer (`-(2 ** 53 - 1)` to `2 ** 53 -1`).
 */
export function toSafeInt(x: Uint64): number {
  const a = x[0] >>> 0;
  const b = (x[1] & SAFE_INT_HI_MASK) >>> 0;
  if (x[1] & SAFE_INT_HI_SIGN) {
    return b * SAFE_INT_HI_MULT + a + 1;
  } else {
    return b * SAFE_INT_HI_MULT + a - Number.MAX_SAFE_INTEGER;
  }
}

/**
 * Copy `y` to `x`.
 */
export function $copy(x: WUint64, y: Uint64): void {
  x[0] = y[0];
  x[1] = y[1];
}

/**
 * Computes `x + y`.
 */
export function add(x: Uint64, y: Uint64): Uint64 {
  const lo = (x[0] + y[0]) | 0;
  const overflow = (x[0] < 0 && (y[0] < 0 || lo >= 0)) || (y[0] < 0 && lo >= 0) ? 1 : 0;
  const hi = (x[1] + y[1] + overflow) | 0;
  return [lo, hi];
}

/**
 * Compiutes `x + y` and assign the result to `x`.
 */
export function $add(x: WUint64, y: Uint64): void {
  const lo = (x[0] + y[0]) | 0;
  const overflow = (x[0] < 0 && (y[0] < 0 || lo >= 0)) || (y[0] < 0 && lo >= 0) ? 1 : 0;
  const hi = (x[1] + y[1] + overflow) | 0;
  x[0] = lo;
  x[1] = hi;
}

/**
 * Computes `x + a` where `a` is a 32-bit unsigned integer, and assign the result to `x`.
 */
export function $addUint32(x: WUint64, a: number): void {
  const as = a | 0;
  const lo = (x[0] + as) | 0;
  const overflow = (x[0] < 0 && (as < 0 || lo >= 0)) || (as < 0 && lo >= 0) ? 1 : 0;
  const hi = (x[1] + overflow) | 0;
  x[0] = lo;
  x[1] = hi;
}

/**
 * Computes `x + 1`.
 */
export function incr(x: Uint64): Uint64 {
  const lo = (x[0] + 1) | 0;
  const hi = (x[1] + (lo === 0 ? 1 : 0)) | 0;
  return [lo, hi];
}

/**
 * Computes `x - y`.
 */
export function sub(x: Uint64, y: Uint64): Uint64 {
  const z0 = (~y[0] + 1) | 0;
  const z1 = (~y[1] + (z0 === 0 ? 1 : 0)) | 0;
  const lo = (x[0] + z0) | 0;
  const overflow = (x[0] < 0 && (z0 < 0 || lo >= 0)) || (z0 < 0 && lo >= 0) ? 1 : 0;
  const hi = (x[1] + z1 + overflow) | 0;
  return [lo, hi];
}

/**
 * Computes `x == y`.
 */
export function eq(x: Uint64, y: Uint64): boolean {
  return x[0] === y[0] && x[1] === y[1];
}

/**
 * Computes `x < y`.
 */
export function lt(x: Uint64, y: Uint64): boolean {
  const x1u = x[1] >>> 0;
  const h1u = y[1] >>> 0;
  if (x1u < h1u) {
    return true;
  } else if (x1u > h1u) {
    return false;
  } else {
    return x[0] >>> 0 < y[0] >>> 0;
  }
}

/**
 * Computes `x & y`.
 */
export function and(x: Uint64, y: Uint64): Uint64 {
  return [x[0] & y[0], x[1] & y[1]];
}

/**
 * Computes `x | y`.
 */
export function or(x: Uint64, y: Uint64): Uint64 {
  return [x[0] | y[0], x[1] | y[1]];
}

/**
 * Computes `x ^ y`.
 */
export function xor(x: Uint64, y: Uint64): Uint64 {
  return [x[0] ^ y[0], x[1] ^ y[1]];
}

/**
 * Computes `x ^ y` and assing the result to `x`.
 */
export function $xor(x: WUint64, y: Uint64): void {
  x[0] = x[0] ^ y[0];
  x[1] = x[1] ^ y[1];
}

/**
 * Computes `x << n`.
 */
export function shiftL(x: Uint64, n: number): Uint64 {
  if (n === 0) {
    return x;
  } else if (n < 32) {
    return [x[0] << n, (x[0] >>> (32 - n)) | (x[1] << n)];
  } else if (n < 64) {
    return [0, x[0] << (n - 32)];
  } else {
    return ZERO;
  }
}

/**
 * Computes `x >> n`.
 */
export function shiftR(x: Uint64, n: number): Uint64 {
  if (n === 0) {
    return x;
  } else if (n < 32) {
    return [(x[0] >>> n) | (x[1] << (32 - n)), (x[1] >>> n) | 0];
  } else if (n < 64) {
    return [(x[1] >>> (n - 32)) | 0, 0];
  } else {
    return ZERO;
  }
}

/**
 * Computes `rotateL(x, y)` and assign the result to `x`.
 */
export function $rotateL(x: WUint64, n: number): void {
  const n64 = n % 64;
  // l = shiftL(x, n64)
  // r = shiftR(x, 64 - n64)
  let l0: number;
  let l1: number;
  let r0: number;
  let r1: number;
  if (n64 === 0) {
    l0 = x[0];
    l1 = x[1];
    r0 = 0;
    r1 = 0;
  } else if (n64 < 32) {
    l0 = x[0] << n64;
    l1 = (x[0] >>> (32 - n64)) | (x[1] << n64);
    r0 = (x[1] >>> (32 - n64)) | 0;
    r1 = 0;
  } else if (n64 === 32) {
    l0 = 0;
    l1 = x[0];
    r0 = x[1];
    r1 = 0;
  } else {
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
 */
export function setBit(x: Uint64, i: number): Uint64 {
  if (i < 32) {
    return [x[0] | (1 << i), x[1]];
  } else if (i < 64) {
    return [x[0], x[1] | (1 << (i - 32))];
  } else {
    return x;
  }
}

/**
 * Counts leading zeros.
 */
export function clz(x: Uint64): number {
  const clzHi = Math.clz32(x[1]);
  if (clzHi === 32) {
    return clzHi + Math.clz32(x[0]);
  } else {
    return clzHi;
  }
}
