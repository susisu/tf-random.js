import { hello } from "../index.js";

describe("index", () => {
  test("hello", () => {
    expect(hello()).toEqual("hello");
  });
});
