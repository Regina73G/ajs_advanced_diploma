import Character from "../Character";

export default class Vampire extends Character {
  constructor (level) {
    super(level, "vampire");
  }

  initStats() {
    this.health = 50;
    this.attack = 25;
    this.defence = 25;
  }
}