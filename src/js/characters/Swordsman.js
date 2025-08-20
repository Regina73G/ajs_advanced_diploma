import Character from "../Character";

export default class Swordsman extends Character {
  constructor (level) {
    super(level, "swordsman");
  }

  initStats() {
    this.health = 50;
    this.attack = 40;
    this.defence = 10;
  }
}