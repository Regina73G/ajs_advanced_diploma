/**
 * Базовый класс, от которого наследуются классы персонажей
 * @property level - уровень персонажа, от 1 до 4
 * @property attack - показатель атаки
 * @property defence - показатель защиты
 * @property health - здоровье персонажа
 * @property type - строка с одним из допустимых значений:
 * swordsman
 * bowman
 * magician
 * daemon
 * undead
 * vampire
 */
export default class Character {
  constructor(level, type = 'generic') {
    // TODO: выбросите исключение, если кто-то использует "new Character()"
    if(new.target === Character) {
      throw new Error("You cannot create instances of the Character base class directly");
    }
    // Уровень персонажа только от 1 до 4
    if (typeof level !== 'number' || level < 1 || level > 4) {
      throw new Error("Level must be a number between 1 and 4");
    }

    this.level = level;
    this.attack = 0;
    this.defence = 0;
    this.health = 50;
    this.type = type;
  }
}