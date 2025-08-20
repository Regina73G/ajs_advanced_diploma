import Character from "../Character";

export default class Daemon extends Character {
  constructor (level) {
    super(level, "daemon");
  }

  initStats() {
    this.health = 50;
    this.attack = 10;
    this.defence = 10;
  }
}