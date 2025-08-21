import { calcTileDistance } from "./utils";

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
  if (!positionedCharacter) return;

  const target = gameController.getPositionedCharacter(newPosition);
  if (target) {
    console.warn("Попытка переместиться в занятую клетку!");
    return;
  }

  console.log(`${positionedCharacter.character.type} был в ${positionedCharacter.position}`); // Вывод в консоль
  
  gameController.positionedCharacters = gameController.positionedCharacters.filter(item => item.position !== positionedCharacter.position);
  positionedCharacter.position = newPosition;
  gameController.positionedCharacters.push(positionedCharacter);
  // Устанавливаем selectedCell только если сейчас ход игрока
  if (gameController.gameState.isPlayerTurn()) {
    gameController.selectedCell = newPosition;
  }

  gameController.gamePlay.redrawPositions(gameController.positionedCharacters);
  console.log(`${positionedCharacter.character.type} сделал перемещение в ${newPosition}`); // Вывод в консоль
  
  gameController.gameState.changeTurn();
  gameController.checkGameStatus();
}

export async function attackCharacter(attacker, targetIndex, gameController) {
  const target = gameController.getPositionedCharacter(targetIndex);
  if (!target) return;

  const targetCharacter = target.character;
  const damage = Math.floor(Math.max(attacker.attack - targetCharacter.defence, attacker.attack * 0.1));
  targetCharacter.health -= damage;

  await gameController.gamePlay.showDamage(targetIndex, damage);

  if (target.character.health <= 0) {
    gameController.positionedCharacters = gameController.positionedCharacters.filter(item => item !== target);
    
    if (gameController.isPlayerCharacter(attacker)) {
    gameController.gameState.addScore(100); // 100 очков за убийство
    }
  }

  gameController.gamePlay.redrawPositions(gameController.positionedCharacters);
  console.log(`${attacker.type} атаковал ${target.character.type}`); // Вывод в консоль
  gameController.gameState.changeTurn();
  gameController.checkGameStatus();
}

// Показывает возможные ходы для выбранного персонажа (пустые клетки) и клетки с врагами для атаки
export function showPossibleMoves(index, gameController) {
  const boardSize = gameController.gamePlay.boardSize;
  const positionedCharacter = gameController.getPositionedCharacter(index);
  if (!positionedCharacter) return [];
  const character = positionedCharacter.character;
  const possibleMoves = [];

  for (let i = 0; i < boardSize * boardSize; i++) {
    if (i === index) continue; // не включаем свою клетку
    const target = gameController.getPositionedCharacter(i);

    // 1) СНАЧАЛА проверяем возможность АТАКИ.
    if (isCellAttackable(index, i, character.type, boardSize) && target) {
      const sameSide = gameController.isPlayerCharacter(character) === gameController.isPlayerCharacter(target.character);
      if (!sameSide) {
        possibleMoves.push(i);
        continue;
      }
    }

    // 2) ХОД только в пустую клетку
    if (!target && isCellMovable(index, i, character.type, boardSize)) {
      possibleMoves.push(i);
    }
  }

  return possibleMoves;
}