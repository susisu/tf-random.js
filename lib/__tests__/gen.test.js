import { TFGen } from "../gen.js";

function initGen() {
  return TFGen.seed(
    0x00000000,
    0x00000000,
    0x01234567,
    0x89abcdef,
    0x89abcdef,
    0x01234567,
    0xffffffff,
    0xffffffff
  );
}

describe("gen", () => {
  describe("TFGen", () => {
    describe(".seed", () => {
      it("should initialize a generator", () => {
        const gen = TFGen.seed(
          0x00000000,
          0x00000000,
          0x01234567,
          0x89abcdef,
          0x89abcdef,
          0x01234567,
          0xffffffff,
          0xffffffff
        );
        expect(gen).toBeInstanceOf(TFGen);
      });
    });

    describe(".init", () => {
      it("should initialize a generator using randomly generated seeds", () => {
        const gen = TFGen.init();
        expect(gen).toBeInstanceOf(TFGen);
      });
    });

    describe("#next", () => {
      it("should return a pair of 32-bit integer and a new generator", () => {
        const gen = initGen();
        const p = gen.next();
        expect(p).toHaveLength(2);
        const [val, newGen] = p;
        expect(val).toBeGreaterThanOrEqual(-0x80000000);
        expect(val).toBeLessThanOrEqual(0x7fffffff);
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
        const newGen = gen.splitn(32, 0x7fffffff);
        expect(newGen).toBeInstanceOf(TFGen);
      });
    });
  });
});
