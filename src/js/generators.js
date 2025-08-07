import Team from "./Team";
import PositionedCharacter from "./PositionedCharacter";
/**
 * Формирует экземпляр персонажа из массива allowedTypes со
 * случайным уровнем от 1 до maxLevel
 *
 * @param allowedTypes массив классов
 * @param maxLevel максимальный возможный уровень персонажа
 * @returns генератор, который при каждом вызове
 * возвращает новый экземпляр класса персонажа
 *
 */
export function* characterGenerator(allowedTypes, maxLevel) {
  // const allowedTypes = [Bowman, Swordsman, Magician];
  while (true) {
    const CharacterType = allowedTypes[Math.floor(Math.random() * allowedTypes.length)];
    const level = Math.floor((Math.random() * maxLevel) + 1);
    yield new CharacterType(level);
  }
}

/**
 * Формирует массив персонажей на основе characterGenerator
 * @param allowedTypes массив классов
 * @param maxLevel максимальный возможный уровень персонажа
 * @param characterCount количество персонажей, которое нужно сформировать
 * @returns экземпляр Team, хранящий экземпляры персонажей. Количество персонажей в команде - characterCount
 * */
export function generateTeam(allowedTypes, maxLevel, characterCount) {
  // const heroes = characterGenerator([Bowman, Swordsman, Magician], 2, 4);
  // const villains = characterGenerator([Daemon , Undead , Vampire], 2, 4);
  const team = [];
  const newCharacter = characterGenerator(allowedTypes, maxLevel);
  for (let i = 0; i < characterCount; i++) {
    team.push(newCharacter.next().value);
  }
  return new Team(team);
}

export function generatePositionsForTeam(team, columns, boardSize) {
    const positions = [];
    const usedPositions = new Set();
    const maxAttempts = 100; // чтоб не было бесконечного цикла

    for (const character of team.characters) {
      let position = null;
      let attempts = 0;

      while (position === null && attempts < maxAttempts) {
        attempts++;
        const column = columns[Math.floor(Math.random() * columns.length)];
        const row = Math.floor(Math.random() * boardSize);
        const candidatePosition = row * boardSize + column;

        if (!usedPositions.has(candidatePosition)) {
          position = candidatePosition;
          usedPositions.add(candidatePosition);
        }
      }

      if (position !== null) {
        positions.push(new PositionedCharacter(character, position));
      } else {
        console.warn("Couldn't find a unique position for the character");
      }
    }

    return positions;
  }