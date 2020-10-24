import { Uint64x4, threefish256EncryptBlock } from "./tf";

describe("threefish256EncryptBlock", () => {
  const key: Uint64x4 = [
    [0x00000000 | 0, 0x00000000 | 0],
    [0x01234567 | 0, 0x89abcdef | 0],
    [0x89abcdef | 0, 0x01234567 | 0],
    [0xffffffff | 0, 0xffffffff | 0],
  ];
  const block: Uint64x4 = [
    [0x00000000 | 0, 0x00000000 | 0],
    [0x01234567 | 0, 0x89abcdef | 0],
    [0x89abcdef | 0, 0x01234567 | 0],
    [0xffffffff | 0, 0xffffffff | 0],
  ];

  test("encryption (int32out = false)", () => {
    const out = threefish256EncryptBlock(key, block, false);
    for (const n of out) {
      const [lo, hi] = n;
      expect(lo).toBeGreaterThanOrEqual(0x80000000 | 0);
      expect(lo).toBeLessThanOrEqual(0x7fffffff | 0);
      expect(hi).toBeGreaterThanOrEqual(0x80000000 | 0);
      expect(hi).toBeLessThanOrEqual(0x7fffffff | 0);
    }
  });

  test("encryption (int32out = true)", () => {
    const out = threefish256EncryptBlock(key, block, true);
    for (const n of out) {
      expect(n).toBeGreaterThanOrEqual(0x80000000 | 0);
      expect(n).toBeLessThanOrEqual(0x7fffffff | 0);
    }
  });
});
