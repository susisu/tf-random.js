import {
  fromUint32,
  fromSafeInt,
  toSafeInt,
  $copy,
  add,
  $add,
  $addUint32,
  incr,
  sub,
  eq,
  lt,
  and,
  or,
  xor,
  $xor,
  shiftL,
  shiftR,
  $rotateL,
  setBit,
  clz,
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
  describe("fromUint32", () => {
    it("should casts a 32-bit uint to uint64", () => {
      expect(fromUint32(0x00000001)).toEqual(uint64(0x00000000, 0x00000001));
      expect(fromUint32(0xffffffff)).toEqual(uint64(0x00000000, 0xffffffff));
    });
  });

  describe("fromSafeInt", () => {
    it("should casts a safe integer to uint64", () => {
      expect(fromSafeInt(Number.MIN_SAFE_INTEGER)).toEqual(uint64(0x00000000, 0x00000000));
      expect(fromSafeInt(0)).toEqual(uint64(0x001fffff, 0xffffffff));
      expect(fromSafeInt(1)).toEqual(uint64(0x00200000, 0x00000000));
      expect(fromSafeInt(Number.MAX_SAFE_INTEGER)).toEqual(uint64(0x003fffff, 0xfffffffe));
    });

    it("should throw an error if given number is not a safe integer", () => {
      expect(() => {
        fromSafeInt(0xffffffffffffffff); // eslint-disable-line no-loss-of-precision
      }).toThrow(Error);
    });
  });

  describe("toSafeInt", () => {
    it("should casts a uint64 to safe integer", () => {
      expect(toSafeInt(uint64(0x00000000, 0x00000000))).toEqual(Number.MIN_SAFE_INTEGER);
      expect(toSafeInt(uint64(0x001fffff, 0xffffffff))).toEqual(0);
      expect(toSafeInt(uint64(0x00200000, 0x00000000))).toEqual(1);
      expect(toSafeInt(uint64(0x003fffff, 0xfffffffe))).toEqual(Number.MAX_SAFE_INTEGER);
    });
  });

  describe("$copy", () => {
    it("should copy the value of second argument to the first", () => {
      const x = uint64(0x00000000, 0x00000000);
      const y = uint64(0x01234567, 0x89abcdef);
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
        x: uint64(0x00000000, 0xffffffff),
        y: uint64(0x00000000, 0x00000001),
        z: uint64(0x00000001, 0x00000000),
      },
      {
        x: uint64(0x00000000, 0x00000001),
        y: uint64(0x00000000, 0xffffffff),
        z: uint64(0x00000001, 0x00000000),
      },
      {
        x: uint64(0x00000000, 0xffffffff),
        y: uint64(0x00000000, 0xffffffff),
        z: uint64(0x00000001, 0xfffffffe),
      },
      {
        x: uint64(0x80000000, 0x00000000),
        y: uint64(0x80000000, 0x00000000),
        z: uint64(0x00000000, 0x00000000),
      },
      {
        x: uint64(0xffffffff, 0x00000000),
        y: uint64(0xffffffff, 0x00000000),
        z: uint64(0xfffffffe, 0x00000000),
      },
      {
        x: uint64(0xffffffff, 0xffffffff),
        y: uint64(0xffffffff, 0xffffffff),
        z: uint64(0xffffffff, 0xfffffffe),
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
        x: uint64(0x00000000, 0xffffffff),
        y: uint64(0x00000000, 0x00000001),
        z: uint64(0x00000001, 0x00000000),
      },
      {
        x: uint64(0x00000000, 0x00000001),
        y: uint64(0x00000000, 0xffffffff),
        z: uint64(0x00000001, 0x00000000),
      },
      {
        x: uint64(0x00000000, 0xffffffff),
        y: uint64(0x00000000, 0xffffffff),
        z: uint64(0x00000001, 0xfffffffe),
      },
      {
        x: uint64(0x80000000, 0x00000000),
        y: uint64(0x80000000, 0x00000000),
        z: uint64(0x00000000, 0x00000000),
      },
      {
        x: uint64(0xffffffff, 0x00000000),
        y: uint64(0xffffffff, 0x00000000),
        z: uint64(0xfffffffe, 0x00000000),
      },
      {
        x: uint64(0xffffffff, 0xffffffff),
        y: uint64(0xffffffff, 0xffffffff),
        z: uint64(0xffffffff, 0xfffffffe),
      },
    ].forEach(({ x, y, z }) => {
      test(`${dump(x)} + ${dump(y)} = ${dump(z)}`, () => {
        $add(x, y);
        expect(x).toEqual(z);
      });
    });
  });

  describe("$addUint32", () => {
    [
      {
        x: uint64(0x00000000, 0x00000000),
        a: 1,
        y: uint64(0x00000000, 0x00000001),
      },
      {
        x: uint64(0x01234567, 0x80000000),
        a: 0xffffffff,
        y: uint64(0x01234568, 0x7fffffff),
      },
      {
        x: uint64(0x01234567, 0xffffffff),
        a: 1,
        y: uint64(0x01234568, 0x00000000),
      },
      {
        x: uint64(0x01234567, 0x00000001),
        a: 0xffffffff,
        y: uint64(0x01234568, 0x00000000),
      },
    ].forEach(({ x, a, y }) => {
      test(`${dump(x)} + ${a} = ${dump(y)}`, () => {
        $addUint32(x, a);
        expect(x).toEqual(y);
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
        x: uint64(0x00000000, 0xffffffff),
        y: uint64(0x00000001, 0x00000000),
      },
      {
        x: uint64(0xffffffff, 0xffffffff),
        y: uint64(0x00000000, 0x00000000),
      },
    ].forEach(({ x, y }) => {
      test(`${dump(x)} + 1 = ${dump(y)}`, () => {
        expect(incr(x)).toEqual(y);
      });
    });
  });

  describe("sub", () => {
    [
      {
        x: uint64(0x00000000, 0x00000000),
        y: uint64(0x00000000, 0x00000000),
        z: uint64(0x00000000, 0x00000000),
      },
      {
        x: uint64(0x00000010, 0x00000003),
        y: uint64(0x00000008, 0x00000001),
        z: uint64(0x00000008, 0x00000002),
      },
      {
        x: uint64(0x00000001, 0x00000000),
        y: uint64(0x00000000, 0x80000000),
        z: uint64(0x00000000, 0x80000000),
      },
      {
        x: uint64(0x00000001, 0x00000000),
        y: uint64(0x00000000, 0xffffffff),
        z: uint64(0x00000000, 0x00000001),
      },
      {
        x: uint64(0x00000001, 0x00000000),
        y: uint64(0x00000000, 0x00000001),
        z: uint64(0x00000000, 0xffffffff),
      },
      {
        x: uint64(0x00000001, 0xfffffffe),
        y: uint64(0x00000000, 0xffffffff),
        z: uint64(0x00000000, 0xffffffff),
      },
      {
        x: uint64(0x00000000, 0x00000000),
        y: uint64(0x80000000, 0x00000000),
        z: uint64(0x80000000, 0x00000000),
      },
      {
        x: uint64(0xfffffffe, 0x00000000),
        y: uint64(0xffffffff, 0x00000000),
        z: uint64(0xffffffff, 0x00000000),
      },
      {
        x: uint64(0xffffffff, 0xfffffffe),
        y: uint64(0xffffffff, 0xffffffff),
        z: uint64(0xffffffff, 0xffffffff),
      },
    ].forEach(({ x, y, z }) => {
      test(`${dump(x)} - ${dump(y)} = ${dump(z)}`, () => {
        expect(sub(x, y)).toEqual(z);
      });
    });
  });

  describe("eq", () => {
    [
      {
        x: uint64(0x00000000, 0x00000000),
        y: uint64(0x00000000, 0x00000000),
        z: true,
      },
      {
        x: uint64(0x01234567, 0x89abcdef),
        y: uint64(0x01234567, 0x89abcdef),
        z: true,
      },
      {
        x: uint64(0x01234567, 0x89abcdef),
        y: uint64(0x01234567, 0xffffffff),
        z: false,
      },
      {
        x: uint64(0x01234567, 0x89abcdef),
        y: uint64(0x00000000, 0x89abcdef),
        z: false,
      },
      {
        x: uint64(0x01234567, 0x89abcdef),
        y: uint64(0x00000000, 0xffffffff),
        z: false,
      },
    ].forEach(({ x, y, z }) => {
      test(`${dump(x)} == ${dump(y)} = ${z}`, () => {
        expect(eq(x, y)).toBe(z);
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
        x: uint64(0xf0f0f0f0, 0xf0f0f0f0),
        y: uint64(0x0f0f0f0f, 0x0f0f0f0f),
        z: uint64(0x00000000, 0x00000000),
      },
      {
        x: uint64(0xffffffff, 0xffffffff),
        y: uint64(0xffffffff, 0xffffffff),
        z: uint64(0xffffffff, 0xffffffff),
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
        x: uint64(0xf0f0f0f0, 0xf0f0f0f0),
        y: uint64(0x0f0f0f0f, 0x0f0f0f0f),
        z: uint64(0xffffffff, 0xffffffff),
      },
      {
        x: uint64(0xffffffff, 0xffffffff),
        y: uint64(0xffffffff, 0xffffffff),
        z: uint64(0xffffffff, 0xffffffff),
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
        x: uint64(0xf0f0f0f0, 0xf0f0f0f0),
        y: uint64(0x0f0f0f0f, 0x0f0f0f0f),
        z: uint64(0xffffffff, 0xffffffff),
      },
      {
        x: uint64(0xffffffff, 0xffffffff),
        y: uint64(0xffffffff, 0xffffffff),
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
        x: uint64(0xf0f0f0f0, 0xf0f0f0f0),
        y: uint64(0x0f0f0f0f, 0x0f0f0f0f),
        z: uint64(0xffffffff, 0xffffffff),
      },
      {
        x: uint64(0xffffffff, 0xffffffff),
        y: uint64(0xffffffff, 0xffffffff),
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
        x: uint64(0x01234567, 0x89abcdef),
        n: 0,
        y: uint64(0x01234567, 0x89abcdef),
      },
      {
        x: uint64(0x01234567, 0x89abcdef),
        n: 4,
        y: uint64(0x12345678, 0x9abcdef0),
      },
      {
        x: uint64(0x01234567, 0x89abcdef),
        n: 32,
        y: uint64(0x89abcdef, 0x00000000),
      },
      {
        x: uint64(0x01234567, 0x89abcdef),
        n: 36,
        y: uint64(0x9abcdef0, 0x00000000),
      },
      {
        x: uint64(0x01234567, 0x89abcdef),
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
        x: uint64(0x01234567, 0x89abcdef),
        n: 0,
        y: uint64(0x01234567, 0x89abcdef),
      },
      {
        x: uint64(0x12345678, 0x9abcdef0),
        n: 4,
        y: uint64(0x01234567, 0x89abcdef),
      },
      {
        x: uint64(0x12345678, 0x9abcdef0),
        n: 32,
        y: uint64(0x00000000, 0x12345678),
      },
      {
        x: uint64(0x12345678, 0x9abcdef0),
        n: 36,
        y: uint64(0x00000000, 0x01234567),
      },
      {
        x: uint64(0x12345678, 0x9abcdef0),
        n: 64,
        y: uint64(0x00000000, 0x00000000),
      },
    ].forEach(({ x, n, y }) => {
      test(`${dump(x)} >> ${n} = ${dump(y)}`, () => {
        expect(shiftR(x, n)).toEqual(y);
      });
    });
  });

  describe("$rotateL", () => {
    [
      {
        x: uint64(0x01234567, 0x89abcdef),
        n: 0,
        y: uint64(0x01234567, 0x89abcdef),
      },
      {
        x: uint64(0x01234567, 0x89abcdef),
        n: 4,
        y: uint64(0x12345678, 0x9abcdef0),
      },
      {
        x: uint64(0x01234567, 0x89abcdef),
        n: 8,
        y: uint64(0x23456789, 0xabcdef01),
      },
      {
        x: uint64(0x01234567, 0x89abcdef),
        n: 32,
        y: uint64(0x89abcdef, 0x01234567),
      },
      {
        x: uint64(0x01234567, 0x89abcdef),
        n: 36,
        y: uint64(0x9abcdef0, 0x12345678),
      },
      {
        x: uint64(0x01234567, 0x89abcdef),
        n: 64,
        y: uint64(0x01234567, 0x89abcdef),
      },
      {
        x: uint64(0x01234567, 0x89abcdef),
        n: 68,
        y: uint64(0x12345678, 0x9abcdef0),
      },
    ].forEach(({ x, n, y }) => {
      test(`${dump(x)} \`rotateL\` ${n} = ${dump(y)}`, () => {
        $rotateL(x, n);
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

  describe("clz", () => {
    [
      {
        x: uint64(0x00000000, 0x00000000),
        n: 64,
      },
      {
        x: uint64(0x00000000, 0x00000001),
        n: 63,
      },
      {
        x: uint64(0x00000000, 0x00800000),
        n: 40,
      },
      {
        x: uint64(0x00000000, 0x80000000),
        n: 32,
      },
      {
        x: uint64(0x00000080, 0x00000000),
        n: 24,
      },
      {
        x: uint64(0x80000000, 0x00000000),
        n: 0,
      },
      {
        x: uint64(0xffffffff, 0xffffffff),
        n: 0,
      },
    ].forEach(({ x, n }) => {
      test(`clz(${dump(x)}) = ${n}`, () => {
        expect(clz(x)).toBe(n);
      });
    });
  });
});
