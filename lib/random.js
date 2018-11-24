import {
  ZERO, MAX,
  fromSafeInt, toSafeInt, add, incr, sub, eq, lt, and, shiftR, clz,
} from "./uint64.js";

/**
 * @param {TFGen} gen
 * @param {number} max - 32-bit uint.
 * @returns {[number, TFGen]} A pair of a random 32-bit uint and a new generator.
 */
function randomUint32M(gen, max) {
  if (max === 0xFFFFFFFF) {
    const [val, nextGen] = gen.next();
    return [val >>> 0, nextGen];
  }
  else if ((max + 1) & max === 0) {
    const [val, nextGen] = gen.next();
    return [(val & max) >>> 0, nextGen];
  }
  else {
    const mask = 0xFFFFFFFF >> Math.clz32(max);
    let currentGen = gen;
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

// int32

/**
 * Generates a random 32-bit signed integer.
 * @param {TFGen} gen
 * @returns {[number, TFGen]} A pair of a random 32-bit int and a new generator.
 */
export function randomInt32(gen) {
  return gen.next();
}

/**
 * Generates a random 32-bit signed integer in the given bounds.
 * @param {TFGen} gen
 * @param {[number, number]} bounds
 * @returns {[number, TFGen]} A pair of a random 32-bit int and a new generator.
 */
export function randomInt32R(gen, bounds) {
  const lower = bounds[0] | 0;
  const upper = bounds[1] | 0;
  if (lower === upper) {
    return [lower, gen];
  }
  else if (lower < upper) {
    const [val, nextGen] = randomUint32M(gen, upper - lower);
    return [val + lower, nextGen];
  }
  else {
    const [val, nextGen] = randomUint32M(gen, lower - upper);
    return [val + upper, nextGen];
  }
}

// uint32

/**
 * Generates a random 32-bit unsigned integer.
 * @param {TFGen} gen
 * @returns {[number, TFGen]} A pair of a random 32-bit uint and a new generator.
 */
export function randomUint32(gen) {
  const [val, nextGen] = gen.next();
  return [val >>> 0, nextGen];
}

/**
 * Generates a random 32-bit unsigned integer in the given bounds.
 * @param {TFGen} gen
 * @param {[number, number]} bounds
 * @returns {[number, TFGen]} A pair of a random 32-bit uint and a new generator.
 */
export function randomUint32R(gen, bounds) {
  const lower = bounds[0] >>> 0;
  const upper = bounds[1] >>> 0;
  if (lower === upper) {
    return [lower, gen];
  }
  else if (lower < upper) {
    const [val, nextGen] = randomUint32M(gen, upper - lower);
    return [val + lower, nextGen];
  }
  else {
    const [val, nextGen] = randomUint32M(gen, lower - upper);
    return [val + upper, nextGen];
  }
}

// boolean

/**
 * Generates a random boolean.
 * @param {TFGen} gen
 * @returns {[number, TFGen]} A pair of a random boolean and a new generator.
 */
export function randomBoolean(gen) {
  const [val, nextGen] = gen.next();
  return [!(val & 0x1), nextGen];
}

// uint64

/**
 * @param {TFGen} gen
 * @param {uint64} max - 64-bit uint.
 * @returns {[uint64, TFGen]} A pair of a random 64-bit uint and a new generator.
 */
function randomUint64M(gen, max) {
  if (eq(max, MAX)) {
    const [lo, gen1] = gen.next();
    const [hi, gen2] = gen1.next();
    return [[lo, hi], gen2];
  }
  else if (eq(and(incr(max), max), ZERO)) {
    const [lo, gen1] = gen.next();
    const [hi, gen2] = gen1.next();
    const val = [lo, hi];
    return [and(val, max), gen2];
  }
  else {
    const mask = shiftR(MAX, clz(max));
    let currentGen = gen;
    while (true) {
      const [lo, gen1] = currentGen.next();
      const [hi, gen2] = gen1.next();
      const val = [lo, hi];
      const maskedVal = and(val, mask);
      if (lt(maskedVal, max) || eq(maskedVal, max)) {
        return [maskedVal, gen2];
      }
      currentGen = gen2;
    }
  }
}

/**
 * Generates a random 64-bit unsigned integer in the given bounds.
 * @param {TFGen} gen
 * @param {[uint64, uint64]} bounds
 * @returns {[uint64, TFGen]} A pair of a random 64-bit uint and a new generator.
 */
function randomUint64R(gen, bounds) {
  const [lower, upper] = bounds;
  if (eq(lower, upper)) {
    return [lower, gen];
  }
  else if (lt(lower, upper)) {
    const [val, nextGen] = randomUint64M(gen, sub(upper, lower));
    return [add(val, lower), nextGen];
  }
  else {
    const [val, nextGen] = randomUint64M(gen, sub(lower, upper));
    return [add(val, upper), nextGen];
  }
}

// safe integer

const MIN_SAFE_INT = fromSafeInt(Number.MIN_SAFE_INTEGER);
const MAX_SAFE_INT = fromSafeInt(Number.MAX_SAFE_INTEGER);

/**
 * Generates a random safe integer (`-(2 ** 53 - 1)` to `2 ** 53 - 1`).
 * @param {TFGen} gen
 * @returns {[number, TFGen]} A pair of a random safe integer and a new generator.
 */
export function randomInt(gen) {
  const [val, nextGen] = randomUint64R(gen, [MIN_SAFE_INT, MAX_SAFE_INT]);
  return [toSafeInt(val), nextGen];
}

/**
 * Generates a random safe integer in the given bounds.
 * @param {TFGen} gen
 * @param {[number, number]} bounds
 * @returns {[number, TFGen]} A pair of a random integer and a new generator.
 */
export function randomIntR(gen, bounds) {
  const lower = fromSafeInt(bounds[0]);
  const upper = fromSafeInt(bounds[1]);
  const [val, nextGen] = randomUint64R(gen, [lower, upper]);
  return [toSafeInt(val), nextGen];
}

// number

const MAX_SAFE_INT_MINUS_ONE = fromSafeInt(Number.MAX_SAFE_INTEGER - 1);

/**
 * Generates a random number in the interval `[0, 1)`.
 * @param {TFGen} gen
 * @returns {[number, TFGen]} A pair of a random number and a new generator.
 */
export function random(gen) {
  const [val, nextGen] = randomUint64R(gen, [MIN_SAFE_INT, MAX_SAFE_INT_MINUS_ONE]);
  const a = toSafeInt(val);
  if (a >= 0) {
    return [a / Number.MAX_SAFE_INTEGER, nextGen];
  }
  else {
    return [-(a + 1) / Number.MAX_SAFE_INTEGER, nextGen];
  }
}
