import { TFGen } from "./gen";
import { Int32x8 } from "./tf";

const defaultGen = TFGen.seed(
  0x00000000,
  0x00000000,
  0x01234567,
  0x89abcdef,
  0x89abcdef,
  0x01234567,
  0xffffffff,
  0xffffffff
);

describe("TFGen", () => {
  describe(".seed", () => {
    it("should initialize a generator", () => {
      const seed: Int32x8 =
        /* prettier-ignore */ [
        0x00000000,
        0x00000000,
        0x01234567,
        0x89abcdef,
        0x89abcdef,
        0x01234567,
        0xffffffff,
        0xffffffff,
      ];
      const gen1 = TFGen.seed(...seed);
      const gen2 = TFGen.seed(...seed);
      const [val1] = gen1.next();
      const [val2] = gen2.next();
      expect(val1).toBe(val2);
    });
  });

  describe(".init", () => {
    it("should initialize a generator using randomly generated seeds", () => {
      const gen1 = TFGen.init();
      const gen2 = TFGen.init();
      const [val1] = gen1.next();
      const [val2] = gen2.next();
      expect(val1).not.toBe(val2);
    });
  });

  describe("#next", () => {
    it("should return a pair of random 32-bit integer and a new generator", () => {
      const [val, nextGen] = defaultGen.next();
      expect(val).toMatchInlineSnapshot(`78121409`);
      expect(val).toBeGreaterThanOrEqual(-0x80000000);
      expect(val).toBeLessThanOrEqual(0x7fffffff);
      expect(nextGen).not.toBe(defaultGen);
    });
  });

  describe("#split", () => {
    it("should return a pair of new generators", () => {
      const [left, right] = defaultGen.split();
      expect(left).not.toBe(defaultGen);
      expect(right).not.toBe(defaultGen);
      expect(left).not.toBe(right);
    });
  });

  describe("#level", () => {
    it("should return a new generator if needed", () => {
      const newGen1 = defaultGen.level();
      expect(newGen1).toBe(defaultGen);

      const gen = defaultGen.splitn(32, 0);
      const newGen2 = gen.level();
      expect(newGen2).not.toBe(gen);
    });
  });

  describe("#splitn", () => {
    it("should return a new generator", () => {
      const newGen = defaultGen.splitn(32, 0x7fffffff);
      expect(newGen).not.toBe(defaultGen);
    });

    it("should throw error if `nbits` is out of [0, 32]", () => {
      expect(() => {
        defaultGen.splitn(48, 0);
      }).toThrow(Error);
    });
  });
});
