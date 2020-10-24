/*
 * Implementation of Threefish-256 block cipher.
 */

import { Uint64, WUint64, $copy, add, $add, $addUint32, $xor, $rotateL } from "./uint64";

const SKEIN_256_STATE_WORDS = 4;
const SKEIN_256_ROUNDS_TOTAL = 72;
const SKEIN_KS_PARITY: Uint64 = [0xa9fc1a22, 0x1bd11bda];
const R_256_0_0 = 14;
const R_256_0_1 = 16;
const R_256_1_0 = 52;
const R_256_1_1 = 57;
const R_256_2_0 = 23;
const R_256_2_1 = 40;
const R_256_3_0 = 5;
const R_256_3_1 = 37;
const R_256_4_0 = 25;
const R_256_4_1 = 33;
const R_256_5_0 = 46;
const R_256_5_1 = 12;
const R_256_6_0 = 58;
const R_256_6_1 = 22;
const R_256_7_0 = 32;
const R_256_7_1 = 32;

export type Uint64x4 = readonly [Uint64, Uint64, Uint64, Uint64];
export type Int32x8 = readonly [number, number, number, number, number, number, number, number];

/**
 * Threefish-256 block cipher.
 * This implementation is basically a translation of the reference implementation available at
 * Skein's website (http://www.skein-hash.info), but a bit simplified.
 * @param key Hash key.
 * @param block Block to be encrypted.
 * @param int32out If `true`, outputs 8 * 32-bit integers.
 * @returns Encrypted block.
 */
export function threefish256EncryptBlock(key: Uint64x4, block: Uint64x4, int32out: false): Uint64x4;
export function threefish256EncryptBlock(key: Uint64x4, block: Uint64x4, int32out: true): Int32x8;
export function threefish256EncryptBlock(
  key: Uint64x4,
  block: Uint64x4,
  int32out: boolean
): Uint64x4 | Int32x8;
export function threefish256EncryptBlock(
  key: Uint64x4,
  block: Uint64x4,
  int32out: boolean
): Uint64x4 | Int32x8 {
  const ks: readonly Uint64[] = [
    key[0],
    key[1],
    key[2],
    key[3],
    [
      key[0][0] ^ key[1][0] ^ key[2][0] ^ key[3][0] ^ SKEIN_KS_PARITY[0],
      key[0][1] ^ key[1][1] ^ key[2][1] ^ key[3][1] ^ SKEIN_KS_PARITY[1],
    ],
  ];
  // Use writable version to avoid memory allocation.
  const x0: WUint64 = [0, 0];
  const x1: WUint64 = [0, 0];
  const x2: WUint64 = [0, 0];
  const x3: WUint64 = [0, 0];
  $copy(x0, add(block[0], ks[0]));
  $copy(x1, add(block[1], ks[1]));
  $copy(x2, add(block[2], ks[2]));
  $copy(x3, add(block[3], ks[3]));

  for (let r = 1; r <= SKEIN_256_ROUNDS_TOTAL / 8; r++) {
    $add(x0, x1);
    $rotateL(x1, R_256_0_0);
    $xor(x1, x0);
    $add(x2, x3);
    $rotateL(x3, R_256_0_1);
    $xor(x3, x2);

    $add(x0, x3);
    $rotateL(x3, R_256_1_0);
    $xor(x3, x0);
    $add(x2, x1);
    $rotateL(x1, R_256_1_1);
    $xor(x1, x2);

    $add(x0, x1);
    $rotateL(x1, R_256_2_0);
    $xor(x1, x0);
    $add(x2, x3);
    $rotateL(x3, R_256_2_1);
    $xor(x3, x2);

    $add(x0, x3);
    $rotateL(x3, R_256_3_0);
    $xor(x3, x0);
    $add(x2, x1);
    $rotateL(x1, R_256_3_1);
    $xor(x1, x2);

    $add(x0, ks[(2 * r - 1) % (SKEIN_256_STATE_WORDS + 1)]);
    $add(x1, ks[(2 * r) % (SKEIN_256_STATE_WORDS + 1)]);
    $add(x2, ks[(2 * r + 1) % (SKEIN_256_STATE_WORDS + 1)]);
    $add(x3, ks[(2 * r + 2) % (SKEIN_256_STATE_WORDS + 1)]);
    $addUint32(x3, 2 * r - 1);

    $add(x0, x1);
    $rotateL(x1, R_256_4_0);
    $xor(x1, x0);
    $add(x2, x3);
    $rotateL(x3, R_256_4_1);
    $xor(x3, x2);

    $add(x0, x3);
    $rotateL(x3, R_256_5_0);
    $xor(x3, x0);
    $add(x2, x1);
    $rotateL(x1, R_256_5_1);
    $xor(x1, x2);

    $add(x0, x1);
    $rotateL(x1, R_256_6_0);
    $xor(x1, x0);
    $add(x2, x3);
    $rotateL(x3, R_256_6_1);
    $xor(x3, x2);

    $add(x0, x3);
    $rotateL(x3, R_256_7_0);
    $xor(x3, x0);
    $add(x2, x1);
    $rotateL(x1, R_256_7_1);
    $xor(x1, x2);

    $add(x0, ks[(2 * r) % (SKEIN_256_STATE_WORDS + 1)]);
    $add(x1, ks[(2 * r + 1) % (SKEIN_256_STATE_WORDS + 1)]);
    $add(x2, ks[(2 * r + 2) % (SKEIN_256_STATE_WORDS + 1)]);
    $add(x3, ks[(2 * r + 3) % (SKEIN_256_STATE_WORDS + 1)]);
    $addUint32(x3, 2 * r);
  }

  if (int32out) {
    return [x0[1], x0[0], x1[1], x1[0], x2[1], x2[0], x3[1], x3[0]];
  } else {
    return [x0, x1, x2, x3];
  }
}
