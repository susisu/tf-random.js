/*
 * Implementation of a pseudorandom number generator.
 */

import {
  Uint64,
  ZERO,
  ONE,
  MAX,
  MAX_MINUS_ONE,
  fromUint32,
  incr,
  lt,
  or,
  shiftL,
  shiftR,
  setBit,
} from "./uint64";
import { Uint64x4, Int32x8, threefish256EncryptBlock } from "./tf";

export class TFGen {
  /**
   * Creates a new generator.
   * @param key Hash key.
   * @param count Counter of `next` operations.
   * @param bits History of `split` operations.
   * @param bitsIndex Index that new bit will be added to `bits` at next `split`.
   * @param block Computed random values.
   * @param blockIndex Index that next random value will be read from `block`.
   */
  private constructor(
    private key: Uint64x4,
    private count: Uint64,
    private bits: Uint64,
    private bitsIndex: number,
    private block: Int32x8,
    private blockIndex: number
  ) {}

  /**
   * Creates a new generator with a properly initialized block.
   * @param key Hash key.
   * @param count Counter of `next` operations.
   * @param bits History of `split` operations.
   * @param bitsIndex Index that new bit will be added to `bits` at next `split`.
   * @returns A new generator.
   */
  private static make(key: Uint64x4, count: Uint64, bits: Uint64, bitsIndex: number): TFGen {
    const block = mash(key, count, bits, true);
    return new TFGen(key, count, bits, bitsIndex, block, 0);
  }

  /**
   * Seeds a generator using eight 32-bit integers.
   * @returns A new generator.
   */
  static seed(
    a0: number,
    a1: number,
    b0: number,
    b1: number,
    c0: number,
    c1: number,
    d0: number,
    d1: number
  ): TFGen {
    const initKey: Uint64x4 = [
      [a0 | 0, a1 | 0],
      [b0 | 0, b1 | 0],
      [c0 | 0, c1 | 0],
      [d0 | 0, d1 | 0],
    ];
    return TFGen.make(initKey, ZERO, ZERO, 0);
  }

  /**
   * Initializes a generator using random seeds.
   * @returns A new generator.
   */
  static init(): TFGen {
    return TFGen.seed(
      nativeRandomInt32(),
      nativeRandomInt32(),
      nativeRandomInt32(),
      nativeRandomInt32(),
      nativeRandomInt32(),
      nativeRandomInt32(),
      nativeRandomInt32(),
      nativeRandomInt32()
    );
  }

  /**
   * Do the `mash` operation using the state of a generator.
   * @param int32out If true, outputs 8 * 32-bit integers.
   */
  private mash(int32out: false): Uint64x4;
  private mash(int32out: true): Int32x8;
  private mash(int32out: boolean): Uint64x4 | Int32x8;
  private mash(int32out: boolean): Uint64x4 | Int32x8 {
    return mash(this.key, this.count, this.bits, int32out);
  }

  /**
   * Yields a random number (32-bit integer) and a next generator.
   * @returns A pair of a random number and a next generator.
   */
  next(): [number, TFGen] {
    const val = this.block[this.blockIndex];
    let nextGen: TFGen;
    if (lt(this.count, MAX_MINUS_ONE)) {
      if (this.blockIndex === 8 - 1) {
        // cannot read more from `block`
        nextGen = TFGen.make(this.key, incr(this.count), this.bits, this.bitsIndex);
      } else {
        nextGen = new TFGen(
          this.key,
          incr(this.count),
          this.bits,
          this.bitsIndex,
          this.block,
          this.blockIndex + 1
        );
      }
    } else if (this.bitsIndex < 64) {
      nextGen = TFGen.make(this.key, ZERO, setBit(this.bits, this.bitsIndex), this.bitsIndex + 1);
    } else {
      const newKey = mash(this.key, MAX, this.bits, false);
      nextGen = TFGen.make(newKey, ZERO, ZERO, 0);
    }
    return [val, nextGen];
  }

  /**
   * Creates a pair of new generators which are effectively independent to each other.
   * @returns A pair of new generators.
   */
  split(): [TFGen, TFGen] {
    if (this.bitsIndex === 64) {
      const newKey = this.mash(false);
      return [TFGen.make(newKey, ZERO, ZERO, 1), TFGen.make(newKey, ZERO, ONE, 1)];
    } else {
      return [
        TFGen.make(this.key, this.count, this.bits, this.bitsIndex + 1),
        TFGen.make(this.key, this.count, setBit(this.bits, this.bitsIndex), this.bitsIndex + 1),
      ];
    }
  }

  /**
   * Flushes the current state (`count` and `bits`).
   * Calling this before multiple `splitn` operations may reduce total computations.
   * @returns A new generator.
   */
  level(): TFGen {
    if (this.bitsIndex + 40 > 64) {
      const newKey = this.mash(false);
      return TFGen.make(newKey, ZERO, ZERO, 0);
    } else {
      return this;
    }
  }

  /**
   * Splits the generator into new `2 ** nbits` generators.
   * @param nbits Number of bits. Must be between `0` and `32`.
   * @param i Index of the new generator.
   * @returns A new generator.
   */
  splitn(nbits: number, i: number): TFGen {
    if (nbits < 0 || 32 < nbits) {
      throw new Error("nbits out of range");
    }
    const b = fromUint32((0xffffffff >> (32 - nbits)) & i);
    if (this.bitsIndex + nbits > 64) {
      const newKey = mash(this.key, this.count, or(this.bits, shiftL(b, this.bitsIndex)), false);
      return TFGen.make(
        newKey,
        ZERO,
        shiftR(b, 64 - this.bitsIndex),
        nbits - (64 - this.bitsIndex)
      );
    } else {
      return TFGen.make(
        this.key,
        this.count,
        or(this.bits, shiftL(b, this.bitsIndex)),
        this.bitsIndex + nbits
      );
    }
  }
}

const SUP_UINT32 = 0x100000000;

/**
 * Generates a random 32-bit signed integer.
 * @returns A random 32-bit integer.
 */
function nativeRandomInt32(): number {
  return Math.floor(Math.random() * SUP_UINT32) | 0;
}

/**
 * @param key Hash key.
 * @param count Counter of `next` operations.
 * @param bits History of `split` operations.
 * @param int32out If true, outputs 8 * 32-bit integers.
 */
function mash(key: Uint64x4, count: Uint64, bits: Uint64, int32out: false): Uint64x4;
function mash(key: Uint64x4, count: Uint64, bits: Uint64, int32out: true): Int32x8;
function mash(key: Uint64x4, count: Uint64, bits: Uint64, int32out: boolean): Uint64x4 | Int32x8;
function mash(key: Uint64x4, count: Uint64, bits: Uint64, int32out: boolean): Uint64x4 | Int32x8 {
  const block: Uint64x4 = [bits, count, ZERO, ZERO];
  return threefish256EncryptBlock(key, block, int32out);
}
