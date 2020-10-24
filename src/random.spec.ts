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

function initGen(): TFGen {
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

describe("randomInt32", () => {
  it("should generate a random 32-bit signed integer and a new generator", () => {
    const gen = initGen();
    const [val, nextGen] = randomInt32(gen);
    expect(val).toMatchInlineSnapshot(`78121409`);
    expect(val).toBeGreaterThanOrEqual(-0x80000000);
    expect(val).toBeLessThanOrEqual(0x7fffffff);
    expect(nextGen).toBeInstanceOf(TFGen);
  });
});

describe("randomInt32R", () => {
  it("should generate a random 32-bit signed integer within a bounds and a new generator", () => {
    const gen = initGen();
    const [val, nextGen] = randomInt32R(gen, [-0x8000, 0x7fff]);
    expect(val).toMatchInlineSnapshot(`-30271`);
    expect(val).toBeGreaterThanOrEqual(-0x8000);
    expect(val).toBeLessThanOrEqual(0x7fff);
    expect(nextGen).toBeInstanceOf(TFGen);
  });

  it("should work if bounds are flipped", () => {
    const gen = initGen();
    const [val, nextGen] = randomInt32R(gen, [0x7fff, -0x8000]);
    expect(val).toMatchInlineSnapshot(`-30271`);
    expect(val).toBeGreaterThanOrEqual(-0x8000);
    expect(val).toBeLessThanOrEqual(0x7fff);
    expect(nextGen).toBeInstanceOf(TFGen);
  });

  it("should work if bounds are equal", () => {
    const gen = initGen();
    const [val, nextGen] = randomInt32R(gen, [0x7fff, 0x7fff]);
    expect(val).toBe(0x7fff);
    expect(nextGen).toBeInstanceOf(TFGen);
  });
});

describe("randomUint32", () => {
  it("should generate a random 32-bit unsigned integer and a new generator", () => {
    const gen = initGen();
    const [val, nextGen] = randomUint32(gen);
    expect(val).toMatchInlineSnapshot(`78121409`);
    expect(val).toBeGreaterThanOrEqual(0x00000000);
    expect(val).toBeLessThanOrEqual(0xffffffff);
    expect(nextGen).toBeInstanceOf(TFGen);
  });
});

describe("randomUint32R", () => {
  it("should generate a random 32-bit unsigned integer within a bounds and a new generator", () => {
    const gen = initGen();
    const [val, nextGen] = randomUint32R(gen, [0xffff0000, 0xffffffff]);
    expect(val).toMatchInlineSnapshot(`4294904257`);
    expect(val).toBeGreaterThanOrEqual(0xffff0000);
    expect(val).toBeLessThanOrEqual(0xffffffff);
    expect(nextGen).toBeInstanceOf(TFGen);
  });

  it("should work if bounds are flipped", () => {
    const gen = initGen();
    const [val, nextGen] = randomUint32R(gen, [0xffffffff, 0xffff0000]);
    expect(val).toMatchInlineSnapshot(`4294904257`);
    expect(val).toBeGreaterThanOrEqual(0xffff0000);
    expect(val).toBeLessThanOrEqual(0xffffffff);
    expect(nextGen).toBeInstanceOf(TFGen);
  });

  it("should work if bounds are equal", () => {
    const gen = initGen();
    const [val, nextGen] = randomUint32R(gen, [0xffff0000, 0xffff0000]);
    expect(val).toBe(0xffff0000);
    expect(nextGen).toBeInstanceOf(TFGen);
  });
});

describe("randomBoolean", () => {
  it("should generate a random boolean value and a new generator", () => {
    const gen = initGen();
    const [val, nextGen] = randomBoolean(gen);
    expect(val).toMatchInlineSnapshot(`false`);
    expect(typeof val).toBe("boolean");
    expect(nextGen).toBeInstanceOf(TFGen);
  });
});

describe("randomInt", () => {
  it("should generate a random safe integer and a new generator", () => {
    const gen = initGen();
    const [val, nextGen] = randomInt(gen);
    expect(val).toMatchInlineSnapshot(`-4543985126733374`);
    expect(Number.isSafeInteger(val)).toBe(true);
    expect(nextGen).toBeInstanceOf(TFGen);
  });
});

describe("randomIntR", () => {
  it("should generate a random safe integer within a bounds and a new generator", () => {
    const gen = initGen();
    const [val, nextGen] = randomIntR(gen, [-100, 100]);
    expect(val).toMatchInlineSnapshot(`93`);
    expect(val).toBeGreaterThanOrEqual(-100);
    expect(val).toBeLessThanOrEqual(100);
    expect(nextGen).toBeInstanceOf(TFGen);
  });

  it("should be OK if bounds are flipped", () => {
    const gen = initGen();
    const [val, nextGen] = randomIntR(gen, [100, -100]);
    expect(val).toMatchInlineSnapshot(`93`);
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
  it("should generate a random number within [0, 1) and a new generator", () => {
    const gen = initGen();
    const [val, nextGen] = random(gen);
    expect(val).toMatchInlineSnapshot(`0.49551630887463477`);
    expect(val).toBeGreaterThanOrEqual(0);
    expect(val).toBeLessThan(1);
    expect(nextGen).toBeInstanceOf(TFGen);
  });
});
