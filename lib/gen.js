import { zero, one, incr, lt, or, shiftL, shiftR, setBit } from "./uint64.js";
import { threefish256EncryptBlock } from "./tf.js";

/**
 * @param {uint64[]} key - Hash key (4 * 64-bit uint)
 * @param {uint64} count - Counter of `next` operations (64-bit uint).
 * @param {uint64} bits - History of `split` operations (64-bit uint).
 * @param {boolean} uint32out - If true, output is 8 * 32-bit uint.
 * @returns {(uint64|number)[]} 4 * 64-bit uint, or 8 * 32-bit uint if `uint32out` is true.
 */
function mash(key, count, bits, uint32out) {
  const block = [bits, count, zero, zero];
  return threefish256EncryptBlock(key, block, uint32out);
}

/**
 * Do the `mash` operation using the state of a generator.
 * @param {TFGen} gen - A generator.
 * @param {boolean} uint32out - If true, output is 8 * 32-bit uint.
 * @returns {(uint64|number)[]} 4 * 64-bit uint, or 8 * 32-bit uint if `uint32out` is true.
 */
function mashTFGen(gen, uint32out) {
  return mash(gen.key, gen.count, gen.bits, uint32out);
}

/**
 * Creates a new generator with the block is properly initialized.
 * @param {uint64[]} key - Hash key (4 * 64-bit uint).
 * @param {uint64} count - Counter of `next` operations (64-bit uint).
 * @param {uint64} bits - History of `split` operations (64-bit uint).
 * @param {number} bitsIndex - Index that new bit will be added to `bits` at next `split`.
 * @returns {TFGen}
 */
function makeTFGen(key, count, bits, bitsIndex) {
  const block = mash(key, count, bits, true);
  return new TFGen(key, count, bits, bitsIndex, block, 0);
}

export class TFGen {
  /**
   * Creates a new generator.
   * @param {uint64[]} key - Hash key (4 * 64-bit uint).
   * @param {uint64} count - Counter of `next` operations (64-bit uint).
   * @param {uint64} bits - History of `split` operations (64-bit uint).
   * @param {number} bitsIndex - Index that new bit will be added to `bits` at next `split`.
   * @param {number[]} block - Computed random values (8 * 32-bit uint).
   * @param {number} blockIndex - Index that next random value will be read from `block`.
   */
  constructor(key, count, bits, bitsIndex, block, blockIndex) {
    this.key        = key;
    this.count      = count;
    this.bits       = bits;
    this.bitsIndex  = bitsIndex;
    this.block      = block;
    this.blockIndex = blockIndex;
  }

  /**
   * Seeds a generator using four random 64-bit uints.
   * @param {uint64} a
   * @param {uint64} b
   * @param {uint64} c
   * @param {uint64} d
   * @returns {TFGen} A new generator.
   */
  static seed(a, b, c, d) {
    return makeTFGen([a, b, c, d], zero, zero, 0);
  }

  /**
   * Yields a random number (32-bit uint) and a next generator.
   * @returns {[number, TFGen]} A pair of a random value and a next generator.
   */
  next() {
    const val = this.block[this.blockIndex];
    let nextGen;
    if (lt(this.count, [0xFFFFFFFE, 0xFFFFFFFF])) {
      if (this.blockIndex === 8 - 1) { // cannot read more fron `block`
        nextGen = makeTFGen(this.key, incr(this.count), this.bits, this.bitsIndex);
      }
      else {
        nextGen = new TFGen(
          this.key,
          incr(this.count),
          this.bits,
          this.bitsIndex,
          this.block,
          this.blockIndex + 1
        );
      }
    }
    else if (this.bitsIndex < 64) {
      nextGen = makeTFGen(this.key, zero, setBit(this.bits, this.bitsIndex), this.bitsIndex + 1);
    }
    else {
      const newKey = mash(this.key, [0xFFFFFFFF, 0xFFFFFFFF], this.bits, false);
      nextGen = makeTFGen(newKey, zero, zero, 0);
    }
    return [val, nextGen];
  }

  /**
   * Creates a pair of new generators which are effectively independent to each other.
   * @returns {[TFGen, TFGen]} A pair of new generators.
   */
  split() {
    if (this.bitsIndex === 64) {
      const newKey = mashTFGen(this, false);
      return [
        makeTFGen(newKey, zero, zero, 1),
        makeTFGen(newKey, zero, one, 1),
      ];
    }
    else {
      return [
        makeTFGen(this.key, this.count, this.bits, this.bitsIndex + 1),
        makeTFGen(this.key, this.count, setBit(this.bits, this.bitsIndex), this.bitsIndex + 1),
      ];
    }
  }

  /**
   * Flushes the current state (`count` and `bits`).
   * Calling this before multiple `splitn` operations may reduce total computations.
   * @returns {TFGen} A new generator.
   */
  level() {
    if (this.bitsIndex + 40 > 64) {
      const newKey = mashTFGen(this, false);
      return makeTFGen(newKey, zero, zero, 0);
    }
    else {
      return this;
    }
  }

  /**
   * Splits the generator into new `2 ** nbits` generators.
   * @param {number} nbits - Number of bits. Must be between `0` and `32`.
   * @param {number} i - Index of the new generator.
   * @returns {TFGen} A new generator.
   */
  splitn(nbits, i) {
    if (nbits < 0 || 32 < nbits) {
      throw new Error("nbits out of range");
    }
    const b = [(0xFFFFFFFF >> (32 - nbits)) & i, 0];
    if (this.bitsIndex + nbits > 64) {
      const newKey = mash(
        this.key,
        this.count,
        or(this.bits, shiftL(b, this.bitsIndex)),
        false
      );
      return makeTFGen(
        newKey,
        zero,
        shiftR(b, 64 - this.bitsIndex),
        nbits - (64 - this.bitsIndex)
      );
    }
    else {
      return makeTFGen(
        this.key,
        this.count,
        or(this.bits, shiftL(b, this.bitsIndex)),
        this.bitsIndex + nbits
      );
    }
  }
}
