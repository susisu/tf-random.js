import { MAX_BIG_UINT32, MAX_BIG_UINT64 } from "./const.js";

/**
 * @param {bigint} bits - 64-bit uint
 * @param {bigint} n - `0 <= n <= 64`
 * @returns {bigint}
 */
function rotL64(bits, n) {
  return ((bits << n) & MAX_BIG_UINT64) | (bits >> (64n - n));
}

const SKEIN_256_STATE_WORDS = 4;
const SKEIN_256_ROUNDS_TOTAL = 72;
const SKEIN_KS_PARITY = 0xA9FC1A22n + (0x1BD11BDAn << 32n);
const R_256_0_0 = 14n, R_256_0_1 = 16n,
      R_256_1_0 = 52n, R_256_1_1 = 57n,
      R_256_2_0 = 23n, R_256_2_1 = 40n,
      R_256_3_0 =  5n, R_256_3_1 = 37n,
      R_256_4_0 = 25n, R_256_4_1 = 33n,
      R_256_5_0 = 46n, R_256_5_1 = 12n,
      R_256_6_0 = 58n, R_256_6_1 = 22n,
      R_256_7_0 = 32n, R_256_7_1 = 32n;

/**
 * @param {bigint[]} key - 4 * 64-bit uint.
 * @param {bigint[]} block - 4 * 64-bit uint.
 * @param {boolean} uint32out - If true, output is 8 * 32-bit uint.
 * @returns {(bigint|number)[]} 4 * 64-bit uint, or 8 * 32-bit uint if `uint32out` is true.
 */
export function threefish256EncryptBlock(key, block, uint32out) {
  const ks = [
    key[0],
    key[1],
    key[2],
    key[3],
    key[0] ^ key[1] ^ key[2] ^ key[3] ^ SKEIN_KS_PARITY,
  ];
  let x0 = (block[0] + ks[0]) & MAX_BIG_UINT64,
      x1 = (block[1] + ks[1]) & MAX_BIG_UINT64,
      x2 = (block[2] + ks[2]) & MAX_BIG_UINT64,
      x3 = (block[3] + ks[3]) & MAX_BIG_UINT64;

  function injectKey(r) {
    x0 += ks[r       % (SKEIN_256_STATE_WORDS + 1)];
    x1 += ks[(r + 1) % (SKEIN_256_STATE_WORDS + 1)];
    x2 += ks[(r + 2) % (SKEIN_256_STATE_WORDS + 1)];
    x3 += ks[(r + 3) % (SKEIN_256_STATE_WORDS + 1)] + BigInt(r);
  }

  for (let r = 1; r <= SKEIN_256_ROUNDS_TOTAL / 8; r++) {
    x0 = (x0 + x1) & MAX_BIG_UINT64; x1 = rotL64(x1, R_256_0_0); x1 ^= x0;
    x2 = (x2 + x3) & MAX_BIG_UINT64; x3 = rotL64(x3, R_256_0_1); x3 ^= x2;

    x0 = (x0 + x3) & MAX_BIG_UINT64; x3 = rotL64(x3, R_256_1_0); x3 ^= x0;
    x2 = (x2 + x1) & MAX_BIG_UINT64; x1 = rotL64(x1, R_256_1_1); x1 ^= x2;

    x0 = (x0 + x1) & MAX_BIG_UINT64; x1 = rotL64(x1, R_256_2_0); x1 ^= x0;
    x2 = (x2 + x3) & MAX_BIG_UINT64; x3 = rotL64(x3, R_256_2_1); x3 ^= x2;

    x0 = (x0 + x3) & MAX_BIG_UINT64; x3 = rotL64(x3, R_256_3_0); x3 ^= x0;
    x2 = (x2 + x1) & MAX_BIG_UINT64; x1 = rotL64(x1, R_256_3_1); x1 ^= x2;

    injectKey(2 * r - 1);

    x0 = (x0 + x1) & MAX_BIG_UINT64; x1 = rotL64(x1, R_256_4_0); x1 ^= x0;
    x2 = (x2 + x3) & MAX_BIG_UINT64; x3 = rotL64(x3, R_256_4_1); x3 ^= x2;

    x0 = (x0 + x3) & MAX_BIG_UINT64; x3 = rotL64(x3, R_256_5_0); x3 ^= x0;
    x2 = (x2 + x1) & MAX_BIG_UINT64; x1 = rotL64(x1, R_256_5_1); x1 ^= x2;

    x0 = (x0 + x1) & MAX_BIG_UINT64; x1 = rotL64(x1, R_256_6_0); x1 ^= x0;
    x2 = (x2 + x3) & MAX_BIG_UINT64; x3 = rotL64(x3, R_256_6_1); x3 ^= x2;

    x0 = (x0 + x3) & MAX_BIG_UINT64; x3 = rotL64(x3, R_256_7_0); x3 ^= x0;
    x2 = (x2 + x1) & MAX_BIG_UINT64; x1 = rotL64(x1, R_256_7_1); x1 ^= x2;

    injectKey(2 * r);
  }

  if (uint32out) {
    return [
      Number(x0 >> 32n),
      Number(x0 & MAX_BIG_UINT32),
      Number(x1 >> 32n),
      Number(x1 & MAX_BIG_UINT32),
      Number(x2 >> 32n),
      Number(x2 & MAX_BIG_UINT32),
      Number(x3 >> 32n),
      Number(x3 & MAX_BIG_UINT32),
    ];
  }
  else {
    return [x0, x1, x2, x3];
  }
}
