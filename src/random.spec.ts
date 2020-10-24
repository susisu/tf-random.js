import { TFGen } from "./gen";
import {
  randomInt32,
  randomInt32R,
  randomUint32,
  randomUint32R,
  randomBoolean,
  randomInt,
  randomIntR,
  random,
} from "./random";

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

describe("randomInt32", () => {
  it("should generate a random 32-bit signed integer and a next generator", () => {
    const [val, nextGen] = randomInt32(defaultGen);
    expect(val).toMatchInlineSnapshot(`78121409`);
    expect(val).toBeGreaterThanOrEqual(-0x80000000);
    expect(val).toBeLessThanOrEqual(0x7fffffff);
    expect(nextGen).not.toBe(defaultGen);
  });
});

describe("randomInt32R", () => {
  it("should generate a random 32-bit signed integer within a bounds and a next generator", () => {
    const [val, nextGen] = randomInt32R(defaultGen, [-0x8000, 0x7fff]);
    expect(val).toMatchInlineSnapshot(`-30271`);
    expect(val).toBeGreaterThanOrEqual(-0x8000);
    expect(val).toBeLessThanOrEqual(0x7fff);
    expect(nextGen).not.toBe(defaultGen);
  });

  it("should work if bounds are flipped", () => {
    const [val, nextGen] = randomInt32R(defaultGen, [0x7fff, -0x8000]);
    expect(val).toMatchInlineSnapshot(`-30271`);
    expect(val).toBeGreaterThanOrEqual(-0x8000);
    expect(val).toBeLessThanOrEqual(0x7fff);
    expect(nextGen).not.toBe(defaultGen);
  });

  it("should work if bounds are equal", () => {
    const [val, nextGen] = randomInt32R(defaultGen, [0x7fff, 0x7fff]);
    expect(val).toBe(0x7fff);
    expect(nextGen).toBe(defaultGen);
  });
});

describe("randomUint32", () => {
  it("should generate a random 32-bit unsigned integer and a next generator", () => {
    const [val, nextGen] = randomUint32(defaultGen);
    expect(val).toMatchInlineSnapshot(`78121409`);
    expect(val).toBeGreaterThanOrEqual(0x00000000);
    expect(val).toBeLessThanOrEqual(0xffffffff);
    expect(nextGen).not.toBe(defaultGen);
  });
});

describe("randomUint32R", () => {
  it("should generate a random 32-bit unsigned integer within a bounds and a next generator", () => {
    const [val, nextGen] = randomUint32R(defaultGen, [0xffff0000, 0xffffffff]);
    expect(val).toMatchInlineSnapshot(`4294904257`);
    expect(val).toBeGreaterThanOrEqual(0xffff0000);
    expect(val).toBeLessThanOrEqual(0xffffffff);
    expect(nextGen).not.toBe(defaultGen);
  });

  it("should work if bounds are flipped", () => {
    const [val, nextGen] = randomUint32R(defaultGen, [0xffffffff, 0xffff0000]);
    expect(val).toMatchInlineSnapshot(`4294904257`);
    expect(val).toBeGreaterThanOrEqual(0xffff0000);
    expect(val).toBeLessThanOrEqual(0xffffffff);
    expect(nextGen).not.toBe(defaultGen);
  });

  it("should work if bounds are equal", () => {
    const [val, nextGen] = randomUint32R(defaultGen, [0xffff0000, 0xffff0000]);
    expect(val).toBe(0xffff0000);
    expect(nextGen).toBe(defaultGen);
  });
});

describe("randomBoolean", () => {
  it("should generate a random boolean value and a next generator", () => {
    const [val, nextGen] = randomBoolean(defaultGen);
    expect(val).toMatchInlineSnapshot(`false`);
    expect(nextGen).not.toBe(defaultGen);
  });
});

describe("randomInt", () => {
  it("should generate a random safe integer and a next generator", () => {
    const [val, nextGen] = randomInt(defaultGen);
    expect(val).toMatchInlineSnapshot(`-4543985126733374`);
    expect(Number.isSafeInteger(val)).toBe(true);
    expect(nextGen).not.toBe(defaultGen);
  });
});

describe("randomIntR", () => {
  it("should generate a random safe integer within a bounds and a next generator", () => {
    const [val, nextGen] = randomIntR(defaultGen, [-100, 100]);
    expect(val).toMatchInlineSnapshot(`93`);
    expect(val).toBeGreaterThanOrEqual(-100);
    expect(val).toBeLessThanOrEqual(100);
    expect(nextGen).not.toBe(defaultGen);
  });

  it("should work if bounds are flipped", () => {
    const [val, nextGen] = randomIntR(defaultGen, [100, -100]);
    expect(val).toMatchInlineSnapshot(`93`);
    expect(val).toBeGreaterThanOrEqual(-100);
    expect(val).toBeLessThanOrEqual(100);
    expect(nextGen).not.toBe(defaultGen);
  });

  it("should work if bounds are equal", () => {
    const [val, nextGen] = randomIntR(defaultGen, [42, 42]);
    expect(val).toBe(42);
    expect(nextGen).toBe(defaultGen);
  });
});

describe("random", () => {
  it("should generate a random number within [0, 1) and a next generator", () => {
    const [val, nextGen] = random(defaultGen);
    expect(val).toMatchInlineSnapshot(`0.49551630887463477`);
    expect(val).toBeGreaterThanOrEqual(0);
    expect(val).toBeLessThan(1);
    expect(nextGen).not.toBe(defaultGen);
  });
});
