import { MAX_BIG_UINT32, MAX_BIG_UINT64 } from "./const.js";

/**
 * @param {bigint} bits - 64-bit uint
 * @param {number} n - `0 <= n <= 64`
 * @returns {bigint}
 */
function rotL64(bits, n) {
  return ((bits << BigInt(n)) & MAX_BIG_UINT64) | (bits >> BigInt(64 - n));
}

const SKEIN_256_STATE_WORDS = 4;
const SKEIN_256_ROUNDS_TOTAL = 72;
const SKEIN_KS_PARITY = 0xA9FC1A22n + (0x1BD11BDAn << 32n);
const R_256_0_0 = 14, R_256_0_1 = 16,
      R_256_1_0 = 52, R_256_1_1 = 57,
      R_256_2_0 = 23, R_256_2_1 = 40,
      R_256_3_0 = 5, R_256_3_1 = 37,
      R_256_4_0 = 25, R_256_4_1 = 33,
      R_256_5_0 = 46, R_256_5_1 = 12,
      R_256_6_0 = 58, R_256_6_1 = 22,
      R_256_7_0 = 32, R_256_7_1 = 32;

/**
 * @param {ArrayBuffer} key - 4 * 64-bit uint.
 * @param {ArrayBuffer} block - 4 * 64-bit uint.
 * @param {ArrayBuffer} crypt - Output, 4 * 64-bit uint.
 * @param {boolean} uint32out - If true, output is 8 * 32-bit uint.
 * @returns {undefined}
 */
export function threefish256EncryptBlock(key, block, crypt, uint32out) {
  const keyView = new BigUint64Array(key);
  const blockView = new DataView(block);
  const cryptView = uint32out ? new Uint32Array(crypt) : new BigUint64Array(crypt);

  const ts = new BigUint64Array(3);
  const ks = new BigUint64Array(SKEIN_256_STATE_WORDS + 1);
  const X = new BigUint64Array(SKEIN_256_STATE_WORDS);
  const w = new BigUint64Array(SKEIN_256_STATE_WORDS);

  ks[0] = keyView[0];
  ks[1] = keyView[1];
  ks[2] = keyView[2];
  ks[3] = keyView[3];
  ks[4] = keyView[0] ^ keyView[1] ^ keyView[2] ^ keyView[3] ^ SKEIN_KS_PARITY;

  ts[0] = 0n;
  ts[1] = 0n;
  ts[2] = 0n;

  w[0] = blockView.getBigUint64(0, true);
  w[1] = blockView.getBigUint64(8, true);
  w[2] = blockView.getBigUint64(16, true);
  w[3] = blockView.getBigUint64(24, true);

  X[0] = w[0] + ks[0];
  X[1] = w[1] + ks[1] + ts[0];
  X[2] = w[2] + ks[2] + ts[1];
  X[3] = w[3] + ks[3];

  function injectKey(r) {
    X[0] += ks[r % (SKEIN_256_STATE_WORDS + 1)];
    X[1] += ks[(r + 1) % (SKEIN_256_STATE_WORDS + 1)] + ts[r % 3];
    X[2] += ks[(r + 2) % (SKEIN_256_STATE_WORDS + 1)] + ts[(r + 1) % 3];
    X[3] += ks[(r + 3) % (SKEIN_256_STATE_WORDS + 1)] + BigInt(r);
  }

  for (let r = 1; r <= SKEIN_256_ROUNDS_TOTAL / 8; r++) {
    X[0] += X[1]; X[1] = rotL64(X[1], R_256_0_0); X[1] ^= X[0];
    X[2] += X[3]; X[3] = rotL64(X[3], R_256_0_1); X[3] ^= X[2];

    X[0] += X[3]; X[3] = rotL64(X[3], R_256_1_0); X[3] ^= X[0];
    X[2] += X[1]; X[1] = rotL64(X[1], R_256_1_1); X[1] ^= X[2];

    X[0] += X[1]; X[1] = rotL64(X[1], R_256_2_0); X[1] ^= X[0];
    X[2] += X[3]; X[3] = rotL64(X[3], R_256_2_1); X[3] ^= X[2];

    X[0] += X[3]; X[3] = rotL64(X[3], R_256_3_0); X[3] ^= X[0];
    X[2] += X[1]; X[1] = rotL64(X[1], R_256_3_1); X[1] ^= X[2];
    injectKey(2 * r - 1);

    X[0] += X[1]; X[1] = rotL64(X[1], R_256_4_0); X[1] ^= X[0];
    X[2] += X[3]; X[3] = rotL64(X[3], R_256_4_1); X[3] ^= X[2];

    X[0] += X[3]; X[3] = rotL64(X[3], R_256_5_0); X[3] ^= X[0];
    X[2] += X[1]; X[1] = rotL64(X[1], R_256_5_1); X[1] ^= X[2];

    X[0] += X[1]; X[1] = rotL64(X[1], R_256_6_0); X[1] ^= X[0];
    X[2] += X[3]; X[3] = rotL64(X[3], R_256_6_1); X[3] ^= X[2];

    X[0] += X[3]; X[3] = rotL64(X[3], R_256_7_0); X[3] ^= X[0];
    X[2] += X[1]; X[1] = rotL64(X[1], R_256_7_1); X[1] ^= X[2];
    injectKey(2 * r);
  }

  if (uint32out) {
    cryptView[0] = Number(X[0] >> 32n);
    cryptView[1] = Number(X[0] & MAX_BIG_UINT32);
    cryptView[2] = Number(X[1] >> 32n);
    cryptView[3] = Number(X[1] & MAX_BIG_UINT32);
    cryptView[4] = Number(X[2] >> 32n);
    cryptView[5] = Number(X[2] & MAX_BIG_UINT32);
    cryptView[6] = Number(X[3] >> 32n);
    cryptView[7] = Number(X[3] & MAX_BIG_UINT32);
  }
  else {
    cryptView[0] = X[0];
    cryptView[1] = X[1];
    cryptView[2] = X[2];
    cryptView[3] = X[3];
  }
}
