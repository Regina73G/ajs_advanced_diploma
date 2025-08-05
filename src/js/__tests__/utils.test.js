import { calcHealthLevel, calcTileType } from '../utils';

test("testing the calcTileType function", () => {
  expect(calcTileType(0,8)).toBe("top-left");
  expect(calcTileType(1,8)).toBe("top");
  expect(calcTileType(7,8)).toBe("top-right");
  expect(calcTileType(40,8)).toBe("left");
  expect(calcTileType(47,8)).toBe("right");
  expect(calcTileType(19,8)).toBe("center");
  expect(calcTileType(7,3)).toBe("bottom");
  expect(calcTileType(20,5)).toBe("bottom-left");
  expect(calcTileType(24,5)).toBe("bottom-right");
});