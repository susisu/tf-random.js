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
