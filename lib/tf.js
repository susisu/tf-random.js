import { $copy, add, $add, $addUint32, $xor, $rotL } from "./uint64.js";

const SKEIN_256_STATE_WORDS = 4;
const SKEIN_256_ROUNDS_TOTAL = 72;
const SKEIN_KS_PARITY = [0xA9FC1A22, 0x1BD11BDA];
const R_256_0_0 = 14, R_256_0_1 = 16,
      R_256_1_0 = 52, R_256_1_1 = 57,
      R_256_2_0 = 23, R_256_2_1 = 40,
      R_256_3_0 =  5, R_256_3_1 = 37,
      R_256_4_0 = 25, R_256_4_1 = 33,
      R_256_5_0 = 46, R_256_5_1 = 12,
      R_256_6_0 = 58, R_256_6_1 = 22,
      R_256_7_0 = 32, R_256_7_1 = 32;

/**
 * @param {uitn64[]} key - 4 * 64-bit uint.
 * @param {uitn64[]} block - 4 * 64-bit uint.
 * @param {boolean} uint32out - If true, output is 8 * 32-bit uint.
 * @returns {(uint64|number)[]} 4 * 64-bit uint, or 8 * 32-bit uint if `uint32out` is true.
 */
export function threefish256EncryptBlock(key, block, uint32out) {
  const ks = [
    key[0],
    key[1],
    key[2],
    key[3],
    [
      key[0][0] ^ key[1][0] ^ key[2][0] ^ key[3][0] ^ SKEIN_KS_PARITY[0],
      key[0][1] ^ key[1][1] ^ key[2][1] ^ key[3][1] ^ SKEIN_KS_PARITY[1],
    ],
  ];
  // To avoid memory allocation, `x0` through `x3` are treated as if they are "pointers" to uint64s.
  const x0 = [0, 0],
        x1 = [0, 0],
        x2 = [0, 0],
        x3 = [0, 0];
  $copy(x0, add(block[0], ks[0]));
  $copy(x1, add(block[1], ks[1]));
  $copy(x2, add(block[2], ks[2]));
  $copy(x3, add(block[3], ks[3]));

  function injectKey(r) {
    $add(x0, ks[r       % (SKEIN_256_STATE_WORDS + 1)]);
    $add(x1, ks[(r + 1) % (SKEIN_256_STATE_WORDS + 1)]);
    $add(x2, ks[(r + 2) % (SKEIN_256_STATE_WORDS + 1)]);
    $add(x3, ks[(r + 3) % (SKEIN_256_STATE_WORDS + 1)]);
    $addUint32(x3, r);
  }

  for (let r = 1; r <= SKEIN_256_ROUNDS_TOTAL / 8; r++) {
    $add(x0, x1); $rotL(x1, R_256_0_0); $xor(x1, x0);
    $add(x2, x3); $rotL(x3, R_256_0_1); $xor(x3, x2);

    $add(x0, x3); $rotL(x3, R_256_1_0); $xor(x3, x0);
    $add(x2, x1); $rotL(x1, R_256_1_1); $xor(x1, x2);

    $add(x0, x1); $rotL(x1, R_256_2_0); $xor(x1, x0);
    $add(x2, x3); $rotL(x3, R_256_2_1); $xor(x3, x2);

    $add(x0, x3); $rotL(x3, R_256_3_0); $xor(x3, x0);
    $add(x2, x1); $rotL(x1, R_256_3_1); $xor(x1, x2);

    injectKey(2 * r - 1);

    $add(x0, x1); $rotL(x1, R_256_4_0); $xor(x1, x0);
    $add(x2, x3); $rotL(x3, R_256_4_1); $xor(x3, x2);

    $add(x0, x3); $rotL(x3, R_256_5_0); $xor(x3, x0);
    $add(x2, x1); $rotL(x1, R_256_5_1); $xor(x1, x2);

    $add(x0, x1); $rotL(x1, R_256_6_0); $xor(x1, x0);
    $add(x2, x3); $rotL(x3, R_256_6_1); $xor(x3, x2);

    $add(x0, x3); $rotL(x3, R_256_7_0); $xor(x3, x0);
    $add(x2, x1); $rotL(x1, R_256_7_1); $xor(x1, x2);

    injectKey(2 * r);
  }

  if (uint32out) {
    return [
      x0[1],
      x0[0],
      x1[1],
      x1[0],
      x2[1],
      x2[0],
      x3[1],
      x3[0],
    ];
  }
  else {
    return [x0, x1, x2, x3];
  }
}
