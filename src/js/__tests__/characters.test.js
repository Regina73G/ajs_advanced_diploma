import Character from "../Character";
import Bowman from "../characters/Bowman";
import Swordsman from "../characters/Swordsman";
import Magician from "../characters/Magician";
import Daemon from "../characters/Daemon";
import Undead from "../characters/Undead";
import Vampire from "../characters/Vampire";

test("testing the Character class for using new.target", () => {
  expect(() => {
    new Character(2);
  }).toThrow("You cannot create instances of the Character base class directly");
});

test("testing child classes for use with new.target", () => {
  const expectedResult = { 
    type: 'magician', level: 2, attack: 10, defence: 40, health: 50
  }

  expect(new Magician(2)).toEqual(expectedResult);
});

test("testing for creating a character with an invalid level", () => {
  expect(() => {
    new Bowman(7);
  }).toThrow("Level must be a number between 1 and 4");
});

const characters = [
    { type: 'bowman', level: 3, Class: Bowman, expectedAttack: 25, expectedDefence: 25 },
    { type: 'swordsman', level: 2, Class: Swordsman, expectedAttack: 40, expectedDefence: 10 },
    { type: 'magician', level: 4, Class: Magician, expectedAttack: 10, expectedDefence: 40 },
    { type: 'daemon', level: 1, Class: Daemon, expectedAttack: 10, expectedDefence: 10 },
    { type: 'undead', level: 3, Class: Undead, expectedAttack: 40, expectedDefence: 10 },
    { type: 'vampire', level: 2, Class: Vampire, expectedAttack: 25, expectedDefence: 25 },
  ]

test.each(characters)("testing the creation of %s with level %i", 
  ({ type, level, Class, expectedAttack, expectedDefence }) => {
  const character = new Class(level);
  const result = [character.type, character.level, character.attack, character.defence];
  const expectedResult = [type, level, expectedAttack, expectedDefence];
  expect(result).toEqual(expectedResult);
});