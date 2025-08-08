export default class GameState {
  constructor() {
    this.turn = 'player';
  }

  changeTurn() {
    this.turn = (this.turn === 'player') ? 'computer' : 'player';
  }

  isPlayerTurn() {
    return this.turn === 'player';
  }

  static from(object) {
    // TODO: create object
    return null;
  }
}