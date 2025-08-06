import Team from "./Team";
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