import themes from "./themes";
import { generateTeam, generatePositionsForTeam } from "./generators";
import Bowman from "./characters/Bowman";
import Swordsman from "./characters/Swordsman";
import Magician from "./characters/Magician";
import Daemon from "./characters/Daemon";
import Undead from "./characters/Undead";
import Vampire from "./characters/Vampire";
import GamePlay from "./GamePlay";
import cursors from "./cursors";
import { isCellMovable, isCellAttackable, moveCharacter, attackCharacter, showPossibleMoves } from "./gamePlayMechanics"
import GameState from "./GameState";

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.maxLevel = 2;
    this.characterCount = 2;
    this.allowedTypesOfThePlayer = [Bowman, Swordsman, Magician];
    this.allowedTypesOfTheEnemy = [Daemon, Undead, Vampire];
    this.positionedCharacter = []; // Массив с персонажами и их позицией
    this.selectedCell = null; // Индекс выбранной ячейки
    this.availableMoves = []; // Доступные ходы для выбранного персонажа
    this.gameState = new GameState();
  }

  init() {
    this.gamePlay.drawUi(themes.prairie);
    this.playerTeam = generateTeam(this.allowedTypesOfThePlayer, this.maxLevel, this.characterCount);
    this.enemyTeam = generateTeam(this.allowedTypesOfTheEnemy, this.maxLevel, this.characterCount);
    const boardSize = this.gamePlay.boardSize;

    const playerPositions = generatePositionsForTeam(this.playerTeam, [0, 1], boardSize);
    const enemyPositions = generatePositionsForTeam(this.enemyTeam, [boardSize - 2, boardSize - 1], boardSize);
    this.positionedCharacters = [...playerPositions, ...enemyPositions];
    this.gamePlay.redrawPositions(this.positionedCharacters);

    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
  }

  // получает позицию персонажа
  getPositionedCharacter(index) {
    return this.positionedCharacters.find(item => item.position === index) || null; // {character{...}, position:...}
  }

  // проверяет, является ли персонаж игрока
  isPlayerCharacter(character) {
    return this.allowedTypesOfThePlayer.some(type => character instanceof type);
  }

  onCellClick(index) {
  // снимает выделение с предыдущей ячейки с персонажем
  if (this.selectedCell !== null) {
    this.gamePlay.deselectCell(this.selectedCell);
    this.gamePlay.setCursor(cursors.auto);
    this.availableMoves = [];
  }

  // Если кликнули на ячейку с персонажем игрока
  const positionedCharacter = this.getPositionedCharacter(index);
  if (positionedCharacter && this.isPlayerCharacter(positionedCharacter.character)) {
    this.gamePlay.selectCell(index); // выделяет игрока
    this.selectedCell = index; // запоминает индекс выбранного игрока
    this.gamePlay.setCursor(cursors.pointer);
    this.availableMoves = showPossibleMoves(index, this);
    return;
  };

  // Если есть выбранный персонаж, и кликнули на другую ячейку
  if (this.selectedCell !== null) {
    const selectedPositionedCharacter = this.getPositionedCharacter(this.selectedCell);
    const selectedCharacter = selectedPositionedCharacter.character;
    const boardSize = this.gamePlay.boardSize;

    // Если можно атаковать
    const target = this.getPositionedCharacter(index);
    if (target && !this.isPlayerCharacter(target.character)) {
      if (isCellAttackable(this.selectedCell, index, selectedCharacter.type, boardSize, this)) {
        attackCharacter(selectedCharacter, index, this);
        this.selectedCell = null;
        this.gamePlay.setCursor(cursors.auto);
        return;
      }
    }

    // Если можно переместиться
    else if (isCellMovable(this.selectedCell, index, selectedCharacter.type, boardSize)) {
      moveCharacter(selectedPositionedCharacter, index, this);
      this.selectedCell = null;
      this.gamePlay.setCursor(cursors.auto);
      return;
    }

    // Недопустимое действие
    GamePlay.showError("Unacceptable action");
    this.selectedCell = null;
    this.gamePlay.setCursor(cursors.auto);
    return
  }

  // Кликнули на пустую ячейку или ячейку с врагом без выбранного персонажа
  GamePlay.showError("This is not a player's character");
}

  onCellEnter(index) {
    // Отображение подсказки о персонаже
    const positionedCharacter = this.getPositionedCharacter(index);
    if (positionedCharacter) {
      this.gamePlay.showCellTooltip(this.gamePlay.showCharacterInfo(positionedCharacter.character), index);
    }

    // Проверяем, есть ли выбранный персонаж и мы не на нем
    if (this.selectedCell !== null && this.selectedCell !== index) {
      const selectedPositionedCharacter = this.getPositionedCharacter(this.selectedCell);
      if (!selectedPositionedCharacter) {
        return; // Если выбранного персонажа нет, выходим
      }
      const selectedCharacter = selectedPositionedCharacter.character;
      const boardSize = this.gamePlay.boardSize;

      if (this.availableMoves.includes(index)) { // Если есть в доступных ходах
        if (positionedCharacter && this.isPlayerCharacter(positionedCharacter.character)) { // Если цель курсора - персонаж игрока
          this.gamePlay.setCursor(cursors.pointer);
        } else if (isCellMovable(this.selectedCell, index, selectedCharacter.type, boardSize) && !this.getPositionedCharacter(index)) { // Если можно переместиться
          this.gamePlay.selectCell(index, 'green');
          this.gamePlay.setCursor(cursors.pointer);
        } else if (isCellAttackable(this.selectedCell, index, selectedCharacter.type, boardSize)) { // Если можно атаковать
          this.gamePlay.selectCell(index, 'red');
          this.gamePlay.setCursor(cursors.crosshair);
        } else { // можно передвигаться, но нельзя атаковать, или наоборот.
          this.gamePlay.setCursor(cursors.notallowed);
        }
      } else {
        this.gamePlay.setCursor(cursors.notallowed) // Нельзя ни переместиться, ни атаковать
      }
    } else {
      this.gamePlay.setCursor(cursors.auto); // нет выбранного персонажа
    }
  }

  onCellLeave(index) {
    if (this.selectedCell !== index) {
      this.gamePlay.deselectCell(index);
    }

    // Устанавливаем курсор в состояние по умолчанию, если мы не на выбранной ячейке
    if (this.selectedCell === null) {
      this.gamePlay.setCursor(cursors.auto);
    } else {
      this.gamePlay.setCursor(cursors.pointer);
    }

    this.gamePlay.hideCellTooltip(index);
  }
}