import { isCellMovable, isCellAttackable, getMaxMoveDistance, getMaxAttackDistance, moveCharacter, attackCharacter, showPossibleMoves } from "../gamePlayMechanics";
import Bowman from "../characters/Bowman";
import Swordsman from "../characters/Swordsman";
import Magician from "../characters/Magician";
import Daemon from "../characters/Daemon";
import Undead from "../characters/Undead";
import Vampire from "../characters/Vampire";

const boardSize = 8;

const moveData = [
  // [CharacterClass, expectedMaxDistance]
  [Bowman, 2],
  [Swordsman, 4],
  [Magician, 1],
  [Daemon, 1],
  [Undead, 4],
  [Vampire, 2],
];

test.each(moveData)(
  'для %s: может переместиться на максимальное расстояние %i',
  (CharacterClass, expectedMaxDistance) => {
    const characterInstance = new CharacterClass(1);
    const fromIndex = 0;

    // Проверяем, что может переместиться на МАКСИМАЛЬНОЕ расстояние
    const toIndex = expectedMaxDistance;
    expect(isCellMovable(fromIndex, toIndex, characterInstance.type, boardSize)).toBe(true);

    // Проверяем, что getMaxMoveDistance возвращает ожидаемое значение
    expect(getMaxMoveDistance(characterInstance.type)).toBe(expectedMaxDistance);
  }
);

test.each(moveData)(
  'для %s: не может переместиться за максимальное расстояние %i + 1',
  (CharacterClass, expectedMaxDistance) => {
    const characterInstance = new CharacterClass(1);
    const fromIndex = 0;

    // Проверяем, что НЕ может переместиться на расстояние, превышающее максимальное
    const toIndex = expectedMaxDistance + 1;
    expect(isCellMovable(fromIndex, toIndex, characterInstance.type, boardSize)).toBe(false);
  }
);

const attackData = [
  // [CharacterClass, expectedMaxDistance]
  [Bowman, 2],
  [Swordsman, 1],
  [Magician, 4],
  [Daemon, 4],
  [Undead, 1],
  [Vampire, 2],
];

test.each(attackData)(
  'для %s: может атаковать на максимальное расстояние %i',
  (CharacterClass, expectedMaxDistance,) => {
    const characterInstance = new CharacterClass(1);
    const fromIndex = 0;

    // Проверяем, что может атаковать на МАКСИМАЛЬНОЕ расстояние
    const toIndex = expectedMaxDistance;
    expect(isCellAttackable(fromIndex, toIndex, characterInstance.type, boardSize)).toBe(true);

    // Проверяем, что getMaxAttackDistance возвращает ожидаемое значение
    expect(getMaxAttackDistance(characterInstance.type)).toBe(expectedMaxDistance);
  }
);

test.each(attackData)(
  'для %s: не может атаковать за максимальное расстояние %i + 1',
  (CharacterClass, expectedMaxDistance,) => {
    const characterInstance = new CharacterClass(1);
    const fromIndex = 0;

    // Проверяем, что НЕ может атаковать на расстояние, превышающее максимальное
    const toIndex = expectedMaxDistance + 1;
    expect(isCellAttackable(fromIndex, toIndex, characterInstance.type, boardSize)).toBe(false);
  }
);

test("Проверка получения ошибки в функции getMaxMoveDistance", () => {
  expect(() => {
    getMaxMoveDistance("roga");
  }).toThrow("Unknown character type: roga");
});

test("Проверка получения ошибки в функции getMaxMoveDistance", () => {
  expect(() => {
    getMaxAttackDistance("roga");
  }).toThrow("Unknown character type: roga");
});