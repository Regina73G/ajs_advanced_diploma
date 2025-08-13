import { calcTileDistance  } from "./utils";

export function isCellMovable(fromIndex, toIndex, characterType, boardSize) {
  const maxDistance = getMaxMoveDistance(characterType);
  const distance = calcTileDistance(fromIndex, toIndex, boardSize);

  return distance <= maxDistance;
}

export function isCellAttackable(attackerIndex, targetIndex, characterType, boardSize) {
  const maxAttackDistance = getMaxAttackDistance(characterType);
  const distance = calcTileDistance(attackerIndex, targetIndex, boardSize);

  return distance <= maxAttackDistance;
}

export function getMaxMoveDistance(characterType) {
  switch (characterType) {
    case "swordsman":
    case "undead":
      return 4;
    case "bowman":
    case "vampire":
      return 2;
    case "magician":
    case "daemon":
      return 1;
    default:
      throw new Error(`Unknown character type: ${characterType}`); 
  }
}

export function getMaxAttackDistance(characterType) {
  switch (characterType) {
    case "swordsman":
    case "undead":
      return 1;
    case "bowman":
    case "vampire":
      return 2;
    case "magician":
    case "daemon":
      return 4;
    default:
      throw new Error(`Unknown character type: ${characterType}`);
  }
}

export function moveCharacter(positionedCharacter, newPosition, gameController) {
  if (!positionedCharacter) {
    return;
  }

  // Удаляем персонажа со старой позиции
  gameController.positionedCharacters = gameController.positionedCharacters.filter(item => item.position !== positionedCharacter.position);
  // Меняем позицию персонажа
  positionedCharacter.position = newPosition;
  // Добавляем персонажа на новую позицию
  gameController.positionedCharacters.push(positionedCharacter);
  // Обновляем selectedCell
  gameController.selectedCell = newPosition;
  // Обновляем игровое поле и переключаем ход
  gameController.gamePlay.redrawPositions(gameController.positionedCharacters);
  gameController.gameState.changeTurn();
}

export async function attackCharacter(attacker, targetIndex, gameController) {
  const target = gameController.getPositionedCharacter(targetIndex);

  const targetCharacter = target.character;
  const damage = Math.max(attacker.attack - targetCharacter.defence, attacker.attack * 0.1);
  targetCharacter.health -= damage;

  await gameController.gamePlay.showDamage(targetIndex, damage);
  // Удаляем убитого персонажа
  if (target.character.health <= 0) {
    gameController.positionedCharacters = gameController.positionedCharacters.filter(item => item.position !== targetIndex);
  }
  // Обновляем игровое поле и переключаем ход
  gameController.gamePlay.redrawPositions(gameController.positionedCharacters);
  gameController.gameState.changeTurn();
}

export function showPossibleMoves(index, gameController) {
  const boardSize = gameController.gamePlay.boardSize;
  const positionedCharacter = gameController.getPositionedCharacter(index);
  const character = positionedCharacter.character;
  const possibleMoves = [];

  for (let i = 0; i < boardSize * boardSize; i++) {
    if (isCellMovable(index, i, character.type, boardSize)) {
      possibleMoves.push(i);
    } else if (isCellAttackable(index, i, character.type, boardSize)) {
      const target = gameController.getPositionedCharacter(i);
      if (target && !gameController.isPlayerCharacter(target.character)) {
        possibleMoves.push(i);
      }
    }
  }

  return possibleMoves;
}