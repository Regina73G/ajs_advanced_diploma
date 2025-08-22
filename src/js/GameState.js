export default class GameState {
  constructor() {
    this.turn = 'player';
    this.afterTurnCallbacks = [];
    this.score = 0;
    this.maxScore = 0;
    this.gameOver = false;
    this.gameLevel = 1;
    this.maxLevel = 1;
    this.positionedCharacters = [];
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

  addScore(points) {
    this.score += points;
    if (this.score > this.maxScore) {
      this.maxScore = this.score;
    }
  }

  setGameOver() {
    this.gameOver = true;
  }

    /**
   * Сохраняем только "чистые данные" (plain objects),
   * чтобы они корректно сериализовались в JSON
   */
  serialize() {
    return {
      turn: this.turn,
      score: this.score,
      maxScore: this.maxScore,
      gameOver: this.gameOver,
      gameLevel: this.gameLevel,
      maxLevel: this.maxLevel,
      positionedCharacters: this.positionedCharacters.map(pc => ({
        position: pc.position,
        character: {
          type: pc.character.type,
          level: pc.character.level,
          attack: pc.character.attack,
          defence: pc.character.defence,
          health: pc.character.health,
        },
      })),
    };
  }

  /**
   * Восстанавливаем из plain-object
   */
  static from(object) {
    if (!object) {
      return new GameState();
    }

    const state = new GameState();
    state.turn = object.turn ?? 'player';
    state.score = object.score ?? 0;
    state.maxScore = object.maxScore ?? 0;
    state.gameOver = object.gameOver ?? false;
    state.gameLevel = object.gameLevel ?? 1;
    state.maxLevel = object.maxLevel ?? 1; 
    state.positionedCharacters = object.positionedCharacters ?? [];

    return state;
  }
}