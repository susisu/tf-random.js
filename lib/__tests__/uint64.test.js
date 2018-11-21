import {
  $copy,
  add,
  $add,
  incr,
  lt,
  and,
  or,
  xor,
  $xor,
  shiftL,
  shiftR,
  rotL,
  $rotL,
  setBit,
} from "../uint64.js";

function uint64(hi, lo) {
  return [lo | 0, hi | 0];
}

function dump(x) {
  const lo = (x[0] >>> 0).toString(16).toUpperCase().padStart(8, "0");
  const hi = (x[1] >>> 0).toString(16).toUpperCase().padStart(8, "0");
  return `0x${hi} ${lo}`;
}

describe("uint64", () => {
  describe("$copy", () => {
    test("`$copy(x, y)` copies `y` to `x`", () => {
      const x = uint64(0x00000000, 0x00000000);
      const y = uint64(0x01234567, 0x89ABCDEF);
      $copy(x, y);
      expect(x).toEqual(y);
    });
  });

  describe("add", () => {
    [
      {
        x: uint64(0x00000000, 0x00000000),
        y: uint64(0x00000000, 0x00000000),
        z: uint64(0x00000000, 0x00000000),
      },
      {
        x: uint64(0x00000008, 0x00000001),
        y: uint64(0x00000008, 0x00000002),
        z: uint64(0x00000010, 0x00000003),
      },
      {
        x: uint64(0x00000000, 0x80000000),
        y: uint64(0x00000000, 0x80000000),
        z: uint64(0x00000001, 0x00000000),
      },
      {
        x: uint64(0x00000000, 0xFFFFFFFF),
        y: uint64(0x00000000, 0x00000001),
        z: uint64(0x00000001, 0x00000000),
      },
      {
        x: uint64(0x00000000, 0x00000001),
        y: uint64(0x00000000, 0xFFFFFFFF),
        z: uint64(0x00000001, 0x00000000),
      },
      {
        x: uint64(0x00000000, 0xFFFFFFFF),
        y: uint64(0x00000000, 0xFFFFFFFF),
        z: uint64(0x00000001, 0xFFFFFFFE),
      },
      {
        x: uint64(0x80000000, 0x00000000),
        y: uint64(0x80000000, 0x00000000),
        z: uint64(0x00000000, 0x00000000),
      },
      {
        x: uint64(0xFFFFFFFF, 0x00000000),
        y: uint64(0xFFFFFFFF, 0x00000000),
        z: uint64(0xFFFFFFFE, 0x00000000),
      },
      {
        x: uint64(0xFFFFFFFF, 0xFFFFFFFF),
        y: uint64(0xFFFFFFFF, 0xFFFFFFFF),
        z: uint64(0xFFFFFFFF, 0xFFFFFFFE),
      },
    ].forEach(({ x, y, z }) => {
      test(`${dump(x)} + ${dump(y)} = ${dump(z)}`, () => {
        expect(add(x, y)).toEqual(z);
      });
    });
  });

  describe("$add", () => {
    [
      {
        x: uint64(0x00000000, 0x00000000),
        y: uint64(0x00000000, 0x00000000),
        z: uint64(0x00000000, 0x00000000),
      },
      {
        x: uint64(0x00000008, 0x00000001),
        y: uint64(0x00000008, 0x00000002),
        z: uint64(0x00000010, 0x00000003),
      },
      {
        x: uint64(0x00000000, 0x80000000),
        y: uint64(0x00000000, 0x80000000),
        z: uint64(0x00000001, 0x00000000),
      },
      {
        x: uint64(0x00000000, 0xFFFFFFFF),
        y: uint64(0x00000000, 0x00000001),
        z: uint64(0x00000001, 0x00000000),
      },
      {
        x: uint64(0x00000000, 0x00000001),
        y: uint64(0x00000000, 0xFFFFFFFF),
        z: uint64(0x00000001, 0x00000000),
      },
      {
        x: uint64(0x00000000, 0xFFFFFFFF),
        y: uint64(0x00000000, 0xFFFFFFFF),
        z: uint64(0x00000001, 0xFFFFFFFE),
      },
      {
        x: uint64(0x80000000, 0x00000000),
        y: uint64(0x80000000, 0x00000000),
        z: uint64(0x00000000, 0x00000000),
      },
      {
        x: uint64(0xFFFFFFFF, 0x00000000),
        y: uint64(0xFFFFFFFF, 0x00000000),
        z: uint64(0xFFFFFFFE, 0x00000000),
      },
      {
        x: uint64(0xFFFFFFFF, 0xFFFFFFFF),
        y: uint64(0xFFFFFFFF, 0xFFFFFFFF),
        z: uint64(0xFFFFFFFF, 0xFFFFFFFE),
      },
    ].forEach(({ x, y, z }) => {
      test(`${dump(x)} + ${dump(y)} = ${dump(z)}`, () => {
        $add(x, y);
        expect(x).toEqual(z);
      });
    });
  });

  describe("incr", () => {
    [
      {
        x: uint64(0x00000000, 0x00000000),
        y: uint64(0x00000000, 0x00000001),
      },
      {
        x: uint64(0x00000000, 0x80000000),
        y: uint64(0x00000000, 0x80000001),
      },
      {
        x: uint64(0x00000000, 0xFFFFFFFF),
        y: uint64(0x00000001, 0x00000000),
      },
      {
        x: uint64(0xFFFFFFFF, 0xFFFFFFFF),
        y: uint64(0x00000000, 0x00000000),
      },
    ].forEach(({ x, y }) => {
      test(`${dump(x)} + 1 = ${dump(y)}`, () => {
        expect(incr(x)).toEqual(y);
      });
    });
  });

  describe("lt", () => {
    [
      {
        x: uint64(0x00000000, 0x00000000),
        y: uint64(0x00000000, 0x00000000),
        z: false,
      },
      {
        x: uint64(0x00000000, 0x00000001),
        y: uint64(0x00000000, 0x00000002),
        z: true,
      },
      {
        x: uint64(0x00000001, 0x00000000),
        y: uint64(0x00000002, 0x00000000),
        z: true,
      },
      {
        x: uint64(0x00000002, 0x00000000),
        y: uint64(0x00000001, 0x00000000),
        z: false,
      },
      {
        x: uint64(0x00000001, 0x00000002),
        y: uint64(0x00000002, 0x00000001),
        z: true,
      },
    ].forEach(({ x, y, z }) => {
      test(`${dump(x)} < ${dump(y)} = ${z}`, () => {
        expect(lt(x, y)).toBe(z);
      });
    });
  });

  describe("and", () => {
    [
      {
        x: uint64(0x00000000, 0x00000000),
        y: uint64(0x00000000, 0x00000000),
        z: uint64(0x00000000, 0x00000000),
      },
      {
        x: uint64(0xF0F0F0F0, 0xF0F0F0F0),
        y: uint64(0x0F0F0F0F, 0x0F0F0F0F),
        z: uint64(0x00000000, 0x00000000),
      },
      {
        x: uint64(0xFFFFFFFF, 0xFFFFFFFF),
        y: uint64(0xFFFFFFFF, 0xFFFFFFFF),
        z: uint64(0xFFFFFFFF, 0xFFFFFFFF),
      },
    ].forEach(({ x, y, z }) => {
      test(`${dump(x)} & ${dump(y)} = ${dump(z)}`, () => {
        expect(and(x, y)).toEqual(z);
      });
    });
  });

  describe("or", () => {
    [
      {
        x: uint64(0x00000000, 0x00000000),
        y: uint64(0x00000000, 0x00000000),
        z: uint64(0x00000000, 0x00000000),
      },
      {
        x: uint64(0xF0F0F0F0, 0xF0F0F0F0),
        y: uint64(0x0F0F0F0F, 0x0F0F0F0F),
        z: uint64(0xFFFFFFFF, 0xFFFFFFFF),
      },
      {
        x: uint64(0xFFFFFFFF, 0xFFFFFFFF),
        y: uint64(0xFFFFFFFF, 0xFFFFFFFF),
        z: uint64(0xFFFFFFFF, 0xFFFFFFFF),
      },
    ].forEach(({ x, y, z }) => {
      test(`${dump(x)} | ${dump(y)} = ${dump(z)}`, () => {
        expect(or(x, y)).toEqual(z);
      });
    });
  });

  describe("xor", () => {
    [
      {
        x: uint64(0x00000000, 0x00000000),
        y: uint64(0x00000000, 0x00000000),
        z: uint64(0x00000000, 0x00000000),
      },
      {
        x: uint64(0xF0F0F0F0, 0xF0F0F0F0),
        y: uint64(0x0F0F0F0F, 0x0F0F0F0F),
        z: uint64(0xFFFFFFFF, 0xFFFFFFFF),
      },
      {
        x: uint64(0xFFFFFFFF, 0xFFFFFFFF),
        y: uint64(0xFFFFFFFF, 0xFFFFFFFF),
        z: uint64(0x00000000, 0x00000000),
      },
    ].forEach(({ x, y, z }) => {
      test(`${dump(x)} ^ ${dump(y)} = ${dump(z)}`, () => {
        expect(xor(x, y)).toEqual(z);
      });
    });
  });

  describe("$xor", () => {
    [
      {
        x: uint64(0x00000000, 0x00000000),
        y: uint64(0x00000000, 0x00000000),
        z: uint64(0x00000000, 0x00000000),
      },
      {
        x: uint64(0xF0F0F0F0, 0xF0F0F0F0),
        y: uint64(0x0F0F0F0F, 0x0F0F0F0F),
        z: uint64(0xFFFFFFFF, 0xFFFFFFFF),
      },
      {
        x: uint64(0xFFFFFFFF, 0xFFFFFFFF),
        y: uint64(0xFFFFFFFF, 0xFFFFFFFF),
        z: uint64(0x00000000, 0x00000000),
      },
    ].forEach(({ x, y, z }) => {
      test(`${dump(x)} ^ ${dump(y)} = ${dump(z)}`, () => {
        $xor(x, y);
        expect(x).toEqual(z);
      });
    });
  });

  describe("shiftL", () => {
    [
      {
        x: uint64(0x01234567, 0x89ABCDEF),
        n: 0,
        y: uint64(0x01234567, 0x89ABCDEF),
      },
      {
        x: uint64(0x01234567, 0x89ABCDEF),
        n: 4,
        y: uint64(0x12345678, 0x9ABCDEF0),
      },
      {
        x: uint64(0x01234567, 0x89ABCDEF),
        n: 32,
        y: uint64(0x89ABCDEF, 0x00000000),
      },
      {
        x: uint64(0x01234567, 0x89ABCDEF),
        n: 36,
        y: uint64(0x9ABCDEF0, 0x00000000),
      },
      {
        x: uint64(0x01234567, 0x89ABCDEF),
        n: 64,
        y: uint64(0x00000000, 0x00000000),
      },
    ].forEach(({ x, n, y }) => {
      test(`${dump(x)} << ${n} = ${dump(y)}`, () => {
        expect(shiftL(x, n)).toEqual(y);
      });
    });
  });

  describe("shiftR", () => {
    [
      {
        x: uint64(0x01234567, 0x89ABCDEF),
        n: 0,
        y: uint64(0x01234567, 0x89ABCDEF),
      },
      {
        x: uint64(0x12345678, 0x9ABCDEF0),
        n: 4,
        y: uint64(0x01234567, 0x89ABCDEF),
      },
      {
        x: uint64(0x12345678, 0x9ABCDEF0),
        n: 32,
        y: uint64(0x00000000, 0x12345678),
      },
      {
        x: uint64(0x12345678, 0x9ABCDEF0),
        n: 36,
        y: uint64(0x00000000, 0x01234567),
      },
      {
        x: uint64(0x12345678, 0x9ABCDEF0),
        n: 64,
        y: uint64(0x00000000, 0x00000000),
      },
    ].forEach(({ x, n, y }) => {
      test(`${dump(x)} >> ${n} = ${dump(y)}`, () => {
        expect(shiftR(x, n)).toEqual(y);
      });
    });
  });

  describe("rotL", () => {
    [
      {
        x: uint64(0x01234567, 0x89ABCDEF),
        n: 0,
        y: uint64(0x01234567, 0x89ABCDEF),
      },
      {
        x: uint64(0x01234567, 0x89ABCDEF),
        n: 4,
        y: uint64(0x12345678, 0x9ABCDEF0),
      },
      {
        x: uint64(0x01234567, 0x89ABCDEF),
        n: 8,
        y: uint64(0x23456789, 0xABCDEF01),
      },
      {
        x: uint64(0x01234567, 0x89ABCDEF),
        n: 32,
        y: uint64(0x89ABCDEF, 0x01234567),
      },
      {
        x: uint64(0x01234567, 0x89ABCDEF),
        n: 36,
        y: uint64(0x9ABCDEF0, 0x12345678),
      },
      {
        x: uint64(0x01234567, 0x89ABCDEF),
        n: 64,
        y: uint64(0x01234567, 0x89ABCDEF),
      },
      {
        x: uint64(0x01234567, 0x89ABCDEF),
        n: 68,
        y: uint64(0x12345678, 0x9ABCDEF0),
      },
    ].forEach(({ x, n, y }) => {
      test(`${dump(x)} \`rotL\` ${n} = ${dump(y)}`, () => {
        expect(rotL(x, n)).toEqual(y);
      });
    });
  });

  describe("$rotL", () => {
    [
      {
        x: uint64(0x01234567, 0x89ABCDEF),
        n: 0,
        y: uint64(0x01234567, 0x89ABCDEF),
      },
      {
        x: uint64(0x01234567, 0x89ABCDEF),
        n: 4,
        y: uint64(0x12345678, 0x9ABCDEF0),
      },
      {
        x: uint64(0x01234567, 0x89ABCDEF),
        n: 8,
        y: uint64(0x23456789, 0xABCDEF01),
      },
      {
        x: uint64(0x01234567, 0x89ABCDEF),
        n: 32,
        y: uint64(0x89ABCDEF, 0x01234567),
      },
      {
        x: uint64(0x01234567, 0x89ABCDEF),
        n: 36,
        y: uint64(0x9ABCDEF0, 0x12345678),
      },
      {
        x: uint64(0x01234567, 0x89ABCDEF),
        n: 64,
        y: uint64(0x01234567, 0x89ABCDEF),
      },
      {
        x: uint64(0x01234567, 0x89ABCDEF),
        n: 68,
        y: uint64(0x12345678, 0x9ABCDEF0),
      },
    ].forEach(({ x, n, y }) => {
      test(`${dump(x)} \`rotL\` ${n} = ${dump(y)}`, () => {
        $rotL(x, n);
        expect(x).toEqual(y);
      });
    });
  });

  describe("setBit", () => {
    [
      {
        x: uint64(0x00000000, 0x00000000),
        i: 0,
        y: uint64(0x00000000, 0x00000001),
      },
      {
        x: uint64(0x00000000, 0x00000000),
        i: 4,
        y: uint64(0x00000000, 0x00000010),
      },
      {
        x: uint64(0x00000000, 0x00000000),
        i: 32,
        y: uint64(0x00000001, 0x00000000),
      },
      {
        x: uint64(0x00000000, 0x00000000),
        i: 36,
        y: uint64(0x00000010, 0x00000000),
      },
      {
        x: uint64(0x00000000, 0x00000000),
        i: 64,
        y: uint64(0x00000000, 0x00000000),
      },
    ].forEach(({ x, i, y }) => {
      test(`${dump(x)} \`setBit\` ${i} = ${dump(y)}`, () => {
        expect(setBit(x, i)).toEqual(y);
      });
    });
  });
});
