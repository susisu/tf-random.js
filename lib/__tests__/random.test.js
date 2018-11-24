import { TFGen } from "../gen.js";
import {
  randomInt32,
  randomInt32R,
  randomUint32,
  randomUint32R,
  randomBoolean,
  randomInt,
  randomIntR,
  random,
} from "../random.js";

function initGen() {
  return TFGen.seed(
    0x00000000, 0x00000000,
    0x01234567, 0x89ABCDEF,
    0x89ABCDEF, 0x01234567,
    0xFFFFFFFF, 0xFFFFFFFF
  );
}

describe("random", () => {
  describe("randomInt32", () => {
    it("should generate a random 32-bit int and a new generator", () => {
      const gen = initGen();
      const [val, nextGen] = randomInt32(gen);
      expect(val).toBeGreaterThanOrEqual(-0x80000000);
      expect(val).toBeLessThanOrEqual(0x7FFFFFFF);
      expect(nextGen).toBeInstanceOf(TFGen);
    });
  });

  describe("randomInt32R", () => {
    it("should generate a random 32-bit int in the given bounds and a new generator", () => {
      const gen = initGen();
      const [val, nextGen] = randomInt32R(gen, [-0x8000, 0x7FFF]);
      expect(val).toBeGreaterThanOrEqual(-0x8000);
      expect(val).toBeLessThanOrEqual(0x7FFF);
      expect(nextGen).toBeInstanceOf(TFGen);
    });

    it("should be OK if bounds are flipped", () => {
      const gen = initGen();
      const [val, nextGen] = randomInt32R(gen, [0x7FFF, -0x8000]);
      expect(val).toBeGreaterThanOrEqual(-0x8000);
      expect(val).toBeLessThanOrEqual(0x7FFF);
      expect(nextGen).toBeInstanceOf(TFGen);
    });

    it("should be OK if bounds are equal", () => {
      const gen = initGen();
      const [val, nextGen] = randomInt32R(gen, [0x7FFF, 0x7FFF]);
      expect(val).toBe(0x7FFF);
      expect(nextGen).toBeInstanceOf(TFGen);
    });
  });

  describe("randomUint32", () => {
    it("should generate a random 32-bit uint and a new generator", () => {
      const gen = initGen();
      const [val, nextGen] = randomUint32(gen);
      expect(val).toBeGreaterThanOrEqual(0x00000000);
      expect(val).toBeLessThanOrEqual(0xFFFFFFFF);
      expect(nextGen).toBeInstanceOf(TFGen);
    });
  });

  describe("randomUint32R", () => {
    it("should generate a random 32-bit uint in the given bounds and a new generator", () => {
      const gen = initGen();
      const [val, nextGen] = randomUint32R(gen, [0xFFFF0000, 0xFFFFFFFF]);
      expect(val).toBeGreaterThanOrEqual(0xFFFF0000);
      expect(val).toBeLessThanOrEqual(0xFFFFFFFF);
      expect(nextGen).toBeInstanceOf(TFGen);
    });

    it("should be OK if bounds are flipped", () => {
      const gen = initGen();
      const [val, nextGen] = randomUint32R(gen, [0xFFFFFFFF, 0xFFFF0000]);
      expect(val).toBeGreaterThanOrEqual(0xFFFF0000);
      expect(val).toBeLessThanOrEqual(0xFFFFFFFF);
      expect(nextGen).toBeInstanceOf(TFGen);
    });

    it("should be OK if bounds are equal", () => {
      const gen = initGen();
      const [val, nextGen] = randomUint32R(gen, [0xFFFF0000, 0xFFFF0000]);
      expect(val).toBe(0xFFFF0000);
      expect(nextGen).toBeInstanceOf(TFGen);
    });
  });

  describe("randomBoolean", () => {
    it("should generate a random boolean and a new generator", () => {
      const gen = initGen();
      const [val, nextGen] = randomBoolean(gen);
      expect(typeof val).toBe("boolean");
      expect(nextGen).toBeInstanceOf(TFGen);
    });
  });

  describe("randomInt", () => {
    it("should generate a random safe integer and a new generator", () => {
      const gen = initGen();
      const [val, nextGen] = randomInt(gen);
      expect(Number.isSafeInteger(val)).toBe(true);
      expect(nextGen).toBeInstanceOf(TFGen);
    });
  });

  describe("randomIntR", () => {
    it("should generate a random safe integer in the given bounds and a new generator", () => {
      const gen = initGen();
      const [val, nextGen] = randomIntR(gen, [-100, 100]);
      expect(val).toBeGreaterThanOrEqual(-100);
      expect(val).toBeLessThanOrEqual(100);
      expect(nextGen).toBeInstanceOf(TFGen);
    });

    it("should be OK if bounds are flipped", () => {
      const gen = initGen();
      const [val, nextGen] = randomIntR(gen, [100, -100]);
      expect(val).toBeGreaterThanOrEqual(-100);
      expect(val).toBeLessThanOrEqual(100);
      expect(nextGen).toBeInstanceOf(TFGen);
    });

    it("should be OK if bounds are equal", () => {
      const gen = initGen();
      const [val, nextGen] = randomIntR(gen, [42, 42]);
      expect(val).toBe(42);
      expect(nextGen).toBeInstanceOf(TFGen);
    });
  });

  describe("random", () => {
    it("should generate a random number in [0, 1) and a new generator", () => {
      const gen = initGen();
      const [val, nextGen] = random(gen);
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(1);
      expect(nextGen).toBeInstanceOf(TFGen);
    });
  });
});
