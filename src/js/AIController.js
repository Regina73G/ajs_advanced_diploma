import { isCellMovable, isCellAttackable, moveCharacter, attackCharacter, showPossibleMoves } from "./gamePlayMechanics"
import { calcTileDistance } from "./utils";

export default class AiController {
  constructor(gameController) {
    this.gameController = gameController;
  }

  async makeMove() {
    if (!this.gameController.gameState.isPlayerTurn()) {
      const attacked = await this.attack();
      if (!attacked) {
        await this.move();
      }
    }
  }

  async attack() {
    const attackOptions = [];
    const aiCharacters = this.gameController.positionedCharacters.filter(character => !this.gameController.isPlayerCharacter(character.character));

    for (const attacker of aiCharacters) {
      for (const target of this.gameController.positionedCharacters) {
        if (this.gameController.isPlayerCharacter(target.character)) {
          if (isCellAttackable(attacker.position, target.position, attacker.character.type, this.gameController.gamePlay.boardSize)) {
            attackOptions.push({ attacker, target });
          }
        }
      }
    }

    if (attackOptions.length > 0) {
      // Выбираем атаку по цели с минимальным здоровьем
      let bestOption = attackOptions[0];
      for (const option of attackOptions) {
        if (option.target.character.health < bestOption.target.character.health) {
          bestOption = option;
        }
      }

      await attackCharacter(bestOption.attacker.character, bestOption.target.position, this.gameController);
      console.log(`${bestOption.attacker.character.type} атаковал ${bestOption.target.character.type}`); // Убрать потом...
      return true;
    }

    return false;
  }

  async move() {
    const aiCharacters = this.gameController.positionedCharacters
      .filter(pc => !this.gameController.isPlayerCharacter(pc.character));

    const candidates = [];

    for (const attacker of aiCharacters) {
      const closestEnemy = this.findClosestEnemy(attacker.position);
      if (!closestEnemy) continue;

      // Берём только пустые клетки и не текущую позицию
      const available = showPossibleMoves(attacker.position, this.gameController)
        .filter(i => i !== attacker.position)
        .filter(i => !this.gameController.getPositionedCharacter(i));

      if (available.length === 0) continue;

      let bestMove = available[0];
      let minDistance = Infinity;

      for (const move of available) {
        const d = calcTileDistance(
          move,
          closestEnemy.position,
          this.gameController.gamePlay.boardSize
        );
        if (d < minDistance) {
          minDistance = d;
          bestMove = move;
        }
      }

      candidates.push({ attacker, bestMove });
    }

    if (candidates.length > 0) {
      const pick = candidates[Math.floor(Math.random() * candidates.length)];
      const positioned = this.gameController.getPositionedCharacter(pick.attacker.position);
      console.log(`${positioned.character.type} был в ${pick.attacker.position}`); // Убрать потом...
      await moveCharacter(positioned, pick.bestMove, this.gameController);
      console.log(`${positioned.character.type} переместился в ${pick.bestMove}`); // Убрать потом...
    }
  }

  findClosestEnemy(fromIndex) {
    let closestEnemy = null;
    let minDistance = Infinity;

    for (const positionedCharacter of this.gameController.positionedCharacters) {
      if (this.gameController.isPlayerCharacter(positionedCharacter.character)) {
        const distance = calcTileDistance(fromIndex, positionedCharacter.position, this.gameController.gamePlay.boardSize);
        if (distance < minDistance) {
          minDistance = distance;
          closestEnemy = positionedCharacter;
        }
      }
    }
    return closestEnemy;
  }
}