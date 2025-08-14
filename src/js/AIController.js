import { isCellMovable, isCellAttackable, moveCharacter, attackCharacter, showPossibleMoves } from "./gamePlayMechanics"

export default class AIController {
  constructor(gameController) {
    this.gameController = gameController;
  }

  makeMove() {
    if (!this.gameController.gameState.isPlayerTurn()) {
      this.attack(); // Пробует атаковать
      this.move(); // Если некого атакова, то перемещается
      this.gameController.gameState.changeTurn(); // Смена хода
    }
  }

  attack() {
    const targets = this.findAttackTargets();

    if (targets.length > 0) {
      const target = this.selectTarget(targets);
      const attacker = this.selectAttacker();
      attackCharacter( attacker.character, target.position,this.gameController);
      return true
    }

    return false
  }

  move() {
    // isCellMovable()
    // moveCharacter()
  }

  // Возвращает массив целей, доступных для атаки
  findAttackTargets() {
    const targets = [];
    const aiCharacters = this.gameController.positionedCharacters.filter(character => {
      return !this.gameController.isPlayerCharacter(character.character); // Возвращает массив с персонажами AI
    });

    for (const attacker of aiCharacters) {
      // Получаем массив возможных ходов (и атак) для текущего персонажа AI (attacker)
      const possibleMoves = showPossibleMoves(attacker.position, gameController);
      for (const move of possibleMoves) {
        // Получаем объект персонажа, находящегося в ячейке, куда можно сделать ход/атаку (если там кто-то есть)
        const target = gameController.getPositionedCharacter(move);
        if (target && gameController.isPlayerCharacter(target.character)) {
          // Если в ячейке есть враг, то проверяем, разрешен ли данный тип врага для атаки
          if (!allowedEnemyTypes || allowedEnemyTypes.some(type => target.character.Class === type)) {
          targets.push(target); // Если враг разрешен для атаки, добавляем его в массив
          }
        }
      }
    }
    console.log(targets); // Убрать потом......
    return targets;
  }

   // Выбирает лучшую цель для атаки
  selectTarget(targets) {
    
  }

  // Выбирает персонажа, которым будет делать ход
  selectAttacker() {}
}