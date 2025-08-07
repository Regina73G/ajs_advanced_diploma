import Bowman from "../characters/Bowman";
import PositionedCharacter from "../PositionedCharacter";

test("testing the class for an error with an incorrect character", () => {
  const character = "not character";
  const position = 1;
  expect(() => {
    new PositionedCharacter(character, position);
  }).toThrow("character must be instance of Character or its children");
});

test("testing a class for an error in the wrong position", () => {
  const character = new Bowman(2);
  const position = "abc";
  
  expect(() => {
    new PositionedCharacter(character, position);
  }).toThrow("position must be a number");
});