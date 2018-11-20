import { add, xor, rotL } from "./uint64.js";

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
    xor(xor(xor(xor(key[0], key[1]), key[2]), key[3]), SKEIN_KS_PARITY),
  ];
  let x0 = add(block[0], ks[0]),
      x1 = add(block[1], ks[1]),
      x2 = add(block[2], ks[2]),
      x3 = add(block[3], ks[3]);

  function injectKey(r) {
    x0 = add(x0, ks[r       % (SKEIN_256_STATE_WORDS + 1)]);
    x1 = add(x1, ks[(r + 1) % (SKEIN_256_STATE_WORDS + 1)]);
    x2 = add(x2, ks[(r + 2) % (SKEIN_256_STATE_WORDS + 1)]);
    x3 = add(x3, ks[(r + 3) % (SKEIN_256_STATE_WORDS + 1)]);
    x3 = add(x3, [r, 0]);
  }

  for (let r = 1; r <= SKEIN_256_ROUNDS_TOTAL / 8; r++) {
    x0 = add(x0, x1); x1 = rotL(x1, R_256_0_0); x1 = xor(x1, x0);
    x2 = add(x2, x3); x3 = rotL(x3, R_256_0_1); x3 = xor(x3, x2);

    x0 = add(x0, x3); x3 = rotL(x3, R_256_1_0); x3 = xor(x3, x0);
    x2 = add(x2, x1); x1 = rotL(x1, R_256_1_1); x1 = xor(x1, x2);

    x0 = add(x0, x1); x1 = rotL(x1, R_256_2_0); x1 = xor(x1, x0);
    x2 = add(x2, x3); x3 = rotL(x3, R_256_2_1); x3 = xor(x3, x2);

    x0 = add(x0, x3); x3 = rotL(x3, R_256_3_0); x3 = xor(x3, x0);
    x2 = add(x2, x1); x1 = rotL(x1, R_256_3_1); x1 = xor(x1, x2);

    injectKey(2 * r - 1);

    x0 = add(x0, x1); x1 = rotL(x1, R_256_4_0); x1 = xor(x1, x0);
    x2 = add(x2, x3); x3 = rotL(x3, R_256_4_1); x3 = xor(x3, x2);

    x0 = add(x0, x3); x3 = rotL(x3, R_256_5_0); x3 = xor(x3, x0);
    x2 = add(x2, x1); x1 = rotL(x1, R_256_5_1); x1 = xor(x1, x2);

    x0 = add(x0, x1); x1 = rotL(x1, R_256_6_0); x1 = xor(x1, x0);
    x2 = add(x2, x3); x3 = rotL(x3, R_256_6_1); x3 = xor(x3, x2);

    x0 = add(x0, x3); x3 = rotL(x3, R_256_7_0); x3 = xor(x3, x0);
    x2 = add(x2, x1); x1 = rotL(x1, R_256_7_1); x1 = xor(x1, x2);

    injectKey(2 * r);
  }

  if (uint32out) {
    return [
      x0[1] >>> 0,
      x0[0] >>> 0,
      x1[1] >>> 0,
      x1[0] >>> 0,
      x2[1] >>> 0,
      x2[0] >>> 0,
      x3[1] >>> 0,
      x3[0] >>> 0,
    ];
  }
  else {
    return [x0, x1, x2, x3];
  }
}
