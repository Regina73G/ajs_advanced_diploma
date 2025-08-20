import Character from "../Character";

export default class Bowman extends Character {
  constructor (level) {
    super(level, "bowman");
  }

  initStats() {
    this.health = 50;
    this.attack = 25;
    this.defence = 25;
  }
}