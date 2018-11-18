import { MAX_BIG_UINT64 } from "./const.js";
import { threefish256EncryptBlock } from "./tf.js";

/**
 * Sets i-th bit to `1` in the given bits.
 * @param {bigint} bits
 * @param {number} i
 * @returns {bigint} - A new bits with i-th bit is set to `1`.
 */
function setBit(bits, i) {
  return bits | (1n << BigInt(i));
}

/**
 * @param {ArrayBuffer} key - Hash key (4 * 64-bit uint)
 * @param {bigint} count - Counter of `next` operations (64-bit uint).
 * @param {bigint} bits - History of `split` operations (64-bit uint).
 * @param {boolean} uint32out - If true, output is 8 * 32-bit uint.
 * @returns {ArrayBuffer} 256-bit buffer.
 */
function mash(key, count, bits, uint32out) {
  const block = new BigUint64Array([bits, count, 0n, 0n]).buffer;
  return threefish256EncryptBlock(key, block, uint32out);
}

/**
 * Do the `mash` operation using the state of a generator.
 * @param {TFGen} gen - A generator.
 * @param {boolean} uint32out - If true, output is 8 * 32-bit uint.
 * @returns {ArrayBuffer} 256-bit buffer.
 */
function mashTFGen(gen, uint32out) {
  return mash(gen.key.buffer, gen.count, gen.bits, uint32out);
}

/**
 * Creates a new generator with the block is properly initialized.
 * @param {BigUint64Array} key - Hash key (4 * 64-bit uint).
 * @param {bigint} count - Counter of `next` operations (64-bit uint).
 * @param {bigint} bits - History of `split` operations (64-bit uint).
 * @param {number} bitsIndex - Index that new bit will be added to `bits` at next `split`.
 * @returns {TFGen}
 */
function makeTFGen(key, count, bits, bitsIndex) {
  const block = new Uint32Array(mash(key.buffer, count, bits, true));
  return new TFGen(key, count, bits, bitsIndex, block, 0);
}

export class TFGen {
  /**
   * Creates a new generator.
   * @param {BigUint64Array} key - Hash key (4 * 64-bit uint).
   * @param {bigint} count - Counter of `next` operations (64-bit uint).
   * @param {bigint} bits - History of `split` operations (64-bit uint).
   * @param {number} bitsIndex - Index that new bit will be added to `bits` at next `split`.
   * @param {Uint32Array} block - Computed random values (8 * 32-bit uint).
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
   * @param {bigint} a
   * @param {bigint} b
   * @param {bigint} c
   * @param {bigint} d
   * @returns {TFGen} A new generator.
   */
  static seed(a, b, c, d) {
    return makeTFGen(new BigUint64Array([a, b, c, d]), 0n, 0n, 0);
  }

  /**
   * Yields a random number (32-bit uint) and a next generator.
   * @returns {[number, TFGen]} A pair of a random value and a next generator.
   */
  next() {
    const val = this.block[this.blockIndex];
    let nextGen;
    if (this.count < MAX_BIG_UINT64 - 1n) {
      if (this.blockIndex === 8 - 1) { // cannot read more fron `block`
        nextGen = makeTFGen(this.key, this.count + 1n, this.bits, this.bitsIndex);
      }
      else {
        nextGen = new TFGen(
          this.key,
          this.count + 1n,
          this.bits,
          this.bitsIndex,
          this.block,
          this.blockIndex + 1
        );
      }
    }
    else if (this.bitsIndex < 64) {
      nextGen = makeTFGen(this.key, 0n, setBit(this.bits, this.bitsIndex), this.bitsIndex + 1);
    }
    else {
      const newKey = mash(this.key.buffer, MAX_BIG_UINT64, this.bits, false);
      nextGen = makeTFGen(newKey, 0n, 0n, 0);
    }
    return [val, nextGen];
  }

  /**
   * Creates a pair of new generators which are effectively independent to each other.
   * @returns {[TFGen, TFGen]} A pair of new generators.
   */
  split() {
    if (this.bitsIndex === 64) {
      const newKey = new BigUint64Array(mashTFGen(this, false));
      return [
        makeTFGen(newKey, 0n, 0n, 1),
        makeTFGen(newKey, 0n, 1n, 1),
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
      const newKey = new BigUint64Array(mashTFGen(this, false));
      return makeTFGen(newKey, 0n, 0n, 0);
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
    const b = BigInt((0xFFFFFFFF >> (32 - nbits)) & i);
    if (this.bitsIndex + nbits > 64) {
      const newKey = new BigUint64Array(mash(
        this.key.buffer,
        this.count,
        this.bits | ((b << BigInt(this.bitsIndex)) & MAX_BIG_UINT64),
        false
      ));
      return makeTFGen(
        newKey,
        0n,
        b >> BigInt(64 - this.bitsIndex),
        nbits - (64 - this.bitsIndex)
      );
    }
    else {
      return makeTFGen(
        this.key,
        this.count,
        this.bits | (b << BigInt(this.bitsIndex)),
        this.bitsIndex + nbits
      );
    }
  }
}
