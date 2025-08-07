import { characterGenerator,  generateTeam, generatePositionsForTeam} from "../generators";
import Bowman from "../characters/Bowman";
import Swordsman from "../characters/Swordsman";
import Magician from "../characters/Magician";

test("Test for the infinity of the characterGenerator and the correct character type", () => {
  const allowedTypes = [Bowman, Swordsman, Magician];
  const maxLevel = 1;
  const generator = characterGenerator(allowedTypes, maxLevel);
  const expectedCount = 15;
  let actualCount = 0;
  for (let i = 0; i < expectedCount; i++) {
    actualCount++;
    const character = generator.next().value;
    expect(character).toBeInstanceOf(allowedTypes.find(type => character instanceof type));
    expect(character.level).toBeGreaterThanOrEqual(1);
    expect(character.level).toBeLessThanOrEqual(maxLevel);
  }

  expect(actualCount).toBe(expectedCount);
});

test("testing the generateTeam function for the required number of characters and level", () => {
  const allowedTypes = [Bowman, Swordsman, Magician];
  const maxLevel = 2;
  const characterCount = 3;
  const generatePlayerTeam = generateTeam(allowedTypes, maxLevel, characterCount);
  for (let i = 0; i < generatePlayerTeam.length; i++) {
    let result;
    if(generatePlayerTeam[i].level === 1 || generatePlayerTeam[i].level === 2) {
      result = true;
    }
    expect(result).toBe(true);
  }
  expect(generatePlayerTeam.characters.length).toEqual(characterCount);
});

test("testing the generatePositionsForTeam function", () => {
  const team = {"characters": [new Bowman(3), new Swordsman(3)]};
  const columns = [0, 1];
  const boardSize = 5;
  const result = generatePositionsForTeam(team, columns, boardSize);

  result.forEach(positionCharacter => {
    expect(positionCharacter).toHaveProperty("position");
    expect(typeof positionCharacter.position).toBe("number");
  });

  expect(result.length).toBe(team.characters.length);
});

test("testing the generatePositionsForTeam function for an error", () => {
  const team = {"characters": [new Bowman(3), new Swordsman(3), new Magician(3), new Bowman(2)]};
  const columns = [0];
  const boardSize = 3;

  const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

  generatePositionsForTeam(team, columns, boardSize);

  expect(consoleWarnSpy).toHaveBeenCalledWith("Couldn't find a unique position for the character");

  consoleWarnSpy.mockRestore();
});