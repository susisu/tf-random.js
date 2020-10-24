/*
 * Utility functions to generate random numbers.
 */

import { TFGen } from "./gen";
import {
  Uint64,
  ZERO,
  MAX,
  fromSafeInt,
  toSafeInt,
  add,
  incr,
  sub,
  eq,
  lt,
  and,
  shiftR,
  clz,
} from "./uint64";

/**
 * Generates a random 32-bit unsigned integer up to `max`.
 * @returns A pair of a random 32-bit unsigned integer and a new generator.
 */
function randomUint32M(gen: TFGen, max: number): [number, TFGen] {
  if (max === 0xffffffff) {
    const [val, nextGen] = gen.next();
    return [val >>> 0, nextGen];
  } else if (((max + 1) & max) === 0 /* max == 0b11...1 */) {
    const [val, nextGen] = gen.next();
    return [(val & max) >>> 0, nextGen];
  } else {
    const mask = 0xffffffff >> Math.clz32(max);
    let currentGen: TFGen = gen;
    while (true) {
      const [val, nextGen] = currentGen.next();
      const maskedVal = (val & mask) >>> 0;
      if (maskedVal <= max) {
        return [maskedVal, nextGen];
      }
      currentGen = nextGen;
    }
  }
}

/**
 * Generates a random 32-bit signed integer.
 * @returns A pair of a random 32-bit integer and a new generator.
 */
export function randomInt32(gen: TFGen): [number, TFGen] {
  return gen.next();
}

/**
 * Generates a random 32-bit signed integer within a bounds.
 * @returns A pair of a random 32-bit integer and a new generator.
 */
export function randomInt32R(gen: TFGen, bounds: readonly [number, number]): [number, TFGen] {
  const lower = bounds[0] | 0;
  const upper = bounds[1] | 0;
  if (lower === upper) {
    return [lower, gen];
  } else if (lower < upper) {
    const [val, nextGen] = randomUint32M(gen, upper - lower);
    return [val + lower, nextGen];
  } else {
    const [val, nextGen] = randomUint32M(gen, lower - upper);
    return [val + upper, nextGen];
  }
}

/**
 * Generates a random 32-bit unsigned integer.
 * @returns A pair of a random 32-bit unsigned integer and a new generator.
 */
export function randomUint32(gen: TFGen): [number, TFGen] {
  const [val, nextGen] = gen.next();
  return [val >>> 0, nextGen];
}

/**
 * Generates a random 32-bit unsigned integer within a bounds.
 * @returns A pair of a random 32-bit unsigned integer and a new generator.
 */
export function randomUint32R(gen: TFGen, bounds: readonly [number, number]): [number, TFGen] {
  const lower = bounds[0] >>> 0;
  const upper = bounds[1] >>> 0;
  if (lower === upper) {
    return [lower, gen];
  } else if (lower < upper) {
    const [val, nextGen] = randomUint32M(gen, upper - lower);
    return [val + lower, nextGen];
  } else {
    const [val, nextGen] = randomUint32M(gen, lower - upper);
    return [val + upper, nextGen];
  }
}

/**
 * Generates a random boolean value.
 * @returns A pair of a random boolean value and a new generator.
 */
export function randomBoolean(gen: TFGen): [boolean, TFGen] {
  const [val, nextGen] = gen.next();
  return [!(val & 0x1), nextGen];
}

/**
 * Generates a random 64-bit unsigned integer up to `max`.
 * @returns A pair of a random 64-bit unsigned integer and a new generator.
 */
function randomUint64M(gen: TFGen, max: Uint64): [Uint64, TFGen] {
  if (eq(max, MAX)) {
    const [lo, gen1] = gen.next();
    const [hi, gen2] = gen1.next();
    return [[lo, hi], gen2];
  } else if (eq(and(incr(max), max), ZERO)) {
    const [lo, gen1] = gen.next();
    const [hi, gen2] = gen1.next();
    const val: Uint64 = [lo, hi];
    return [and(val, max), gen2];
  } else {
    const mask = shiftR(MAX, clz(max));
    let currentGen = gen;
    while (true) {
      const [lo, gen1] = currentGen.next();
      const [hi, gen2] = gen1.next();
      const val: Uint64 = [lo, hi];
      const maskedVal = and(val, mask);
      if (lt(maskedVal, max) || eq(maskedVal, max)) {
        return [maskedVal, gen2];
      }
      currentGen = gen2;
    }
  }
}

/**
 * Generates a random 64-bit unsigned integer within a bounds.
 * @returns A pair of a random 64-bit unsigned integer and a new generator.
 */
function randomUint64R(gen: TFGen, bounds: readonly [Uint64, Uint64]): [Uint64, TFGen] {
  const [lower, upper] = bounds;
  if (eq(lower, upper)) {
    return [lower, gen];
  } else if (lt(lower, upper)) {
    const [val, nextGen] = randomUint64M(gen, sub(upper, lower));
    return [add(val, lower), nextGen];
  } else {
    const [val, nextGen] = randomUint64M(gen, sub(lower, upper));
    return [add(val, upper), nextGen];
  }
}

const MIN_SAFE_INT = fromSafeInt(Number.MIN_SAFE_INTEGER);
const MAX_SAFE_INT = fromSafeInt(Number.MAX_SAFE_INTEGER);

/**
 * Generates a random safe integer (`-(2 ** 53 - 1)` to `2 ** 53 - 1`).
 * @returns A pair of a random safe integer and a new generator.
 */
export function randomInt(gen: TFGen): [number, TFGen] {
  const [val, nextGen] = randomUint64R(gen, [MIN_SAFE_INT, MAX_SAFE_INT]);
  return [toSafeInt(val), nextGen];
}

/**
 * Generates a random safe integer within a bounds.
 * @returns A pair of a random integer and a new generator.
 */
export function randomIntR(gen: TFGen, bounds: readonly [number, number]): [number, TFGen] {
  const lower = fromSafeInt(bounds[0]);
  const upper = fromSafeInt(bounds[1]);
  const [val, nextGen] = randomUint64R(gen, [lower, upper]);
  return [toSafeInt(val), nextGen];
}

const ZERO_SAFE_INT = fromSafeInt(0);
const MAX_SAFE_INT_MINUS_ONE = fromSafeInt(Number.MAX_SAFE_INTEGER - 1);

/**
 * Generates a random number within `[0, 1)`.
 * @returns A pair of a random number and a new generator.
 */
export function random(gen: TFGen): [number, TFGen] {
  const [val, nextGen] = randomUint64R(gen, [ZERO_SAFE_INT, MAX_SAFE_INT_MINUS_ONE]);
  return [toSafeInt(val) / Number.MAX_SAFE_INTEGER, nextGen];
}
