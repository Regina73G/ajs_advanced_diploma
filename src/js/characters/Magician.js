import Character from "../Character";

export default class Magician extends Character {
  constructor (level) {
    super(level, "magician");
  }

  initStats() {
    this.health = 50;
    this.attack = 10;
    this.defence = 40;
  }
}