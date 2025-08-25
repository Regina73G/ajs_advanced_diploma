import GamePlay from "../GamePlay";
import Bowman from "../characters/Bowman";

test("тест на показ правильных характеристик персонажа", () => {
  const gameplay = new GamePlay();
  const character = new Bowman(1);
  const result = gameplay.showCharacterInfo(character);
  const expectedResult = `${"\u{1F396}"} 1 ${"\u2694"} 25 ${"\u{1F6E1}"} 25 ${"\u2764"} 50`
  expect(result).toEqual(expectedResult);
});