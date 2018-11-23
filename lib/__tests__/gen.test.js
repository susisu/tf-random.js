import { TFGen } from "../gen.js";

describe("gen", () => {
  describe("TFGen", () => {
    describe(".seed", () => {
      it("should initialize a generator", () => {
        const gen = TFGen.seed(
          0x00000000, 0x00000000,
          0x01234567, 0x89ABCDEF,
          0x89ABCDEF, 0x01234567,
          0xFFFFFFFF, 0xFFFFFFFF
        );
        expect(gen).toBeInstanceOf(TFGen);
      });
    });

    function initGen() {
      return TFGen.seed(
        0x00000000, 0x00000000,
        0x01234567, 0x89ABCDEF,
        0x89ABCDEF, 0x01234567,
        0xFFFFFFFF, 0xFFFFFFFF
      );
    }

    describe("#next", () => {
      it("should return a pair of 32-bit integer and a new generator", () => {
        const gen = initGen();
        const p = gen.next();
        expect(p).toHaveLength(2);
        const [val, newGen] = p;
        expect(val).toBeGreaterThanOrEqual(0x80000000 | 0);
        expect(val).toBeLessThanOrEqual(0x7FFFFFFF | 0);
        expect(newGen).toBeInstanceOf(TFGen);
      });
    });

    describe("#split", () => {
      it("should return a pair of new generators", () => {
        const gen = initGen();
        const p = gen.split();
        expect(p).toHaveLength(2);
        const [left, right] = p;
        expect(left).toBeInstanceOf(TFGen);
        expect(right).toBeInstanceOf(TFGen);
      });
    });

    describe("#level", () => {
      it("should return a new generator", () => {
        const gen = initGen();
        const newGen = gen.level();
        expect(newGen).toBeInstanceOf(TFGen);
      });
    });

    describe("#splitn", () => {
      it("should return a new generator", () => {
        const gen = initGen();
        const newGen = gen.splitn(32, 0x7FFFFFFF);
        expect(newGen).toBeInstanceOf(TFGen);
      });
    });
  });
});
