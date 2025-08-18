export default class GameState {
  constructor() {
    this.turn = 'player';
    this.afterTurnCallbacks = [];
  }

  changeTurn = () => {
    this.turn = (this.turn === 'player') ? 'computer' : 'player';
    this.runAfterTurnCallbacks();
  }

  isPlayerTurn() {
    return this.turn === 'player';
  }

  onAfterTurn(callback) {
    if (typeof callback === 'function') {
      this.afterTurnCallbacks.push(callback);
    }
  }

  runAfterTurnCallbacks() {
    for (const cb of this.afterTurnCallbacks) {
      try {
        cb(this.turn);
      } catch (e) {
        console.error('Error in afterTurn callback', e);
      }
    }
  }

  static from(object) {
    // TODO: create object
    return null;
  }
}