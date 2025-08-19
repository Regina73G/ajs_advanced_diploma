import themes from "./themes";
import { generateTeam, generatePositionsForTeam, characterGenerator } from "./generators";
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
import AiController from "./AIController";

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.maxLevel = 1;
    this.characterCount = 2;
    this.allowedTypesOfThePlayer = [Bowman, Swordsman, Magician];
    this.allowedTypesOfTheEnemy = [Daemon, Undead, Vampire];
    this.positionedCharacter = [];
    this.selectedCell = null;
    this.availableMoves = [];
    this.gameState = new GameState();
    this.aiController = new AiController(this);
    this.gameLevel = 0;

    // Подписываем AI на смену хода
    this.gameState.onAfterTurn((turn) => {
      if (turn === 'computer') {
        setTimeout(() => {
          this.aiController.makeMove();
          this.gamePlay.setCursor(cursors.auto);
        }, 500);
      }
    });
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

  getPositionedCharacter(index) {
    return this.positionedCharacters.find(item => item.position === index) || null;
  }

  isPlayerCharacter(character) {
    return this.allowedTypesOfThePlayer.some(type => character instanceof type);
  }

  checkGameStatus() {
    const players = this.positionedCharacters.filter(char => this.isPlayerCharacter(char.character));
    if (players.length === 0) { // Если персонажей нет, то Game Over
      // ....
    return;
    }

    const enemies = this.positionedCharacters.filter(char => !this.isPlayerCharacter(char.character));
    if (enemies.length === 0) { // Если врагов нет, то следующий уровень
      this.levelUpAll();
      this.nextLevel();
    }
  }

  levelUpAll() {
    this.maxLevel += 1;
    for (const char of this.positionedCharacters) {
      if (this.isPlayerCharacter(char.character)) {
        char.character.levelUp();
      }
    }
  }

  nextLevel() {
    this.gameLevel += 1;
    this.gamePlay.drawUi(themes[this.gameLevel]); // меняем тему
    const boardSize = this.gamePlay.boardSize;
    
    // генерируем новых игроков, если их меньше this.characterCount
    let alivePlayers = this.positionedCharacters.filter(char => this.isPlayerCharacter(char.character)).map(char => char.character)
    if (alivePlayers.length < this.characterCount) {
      const needMore = this.characterCount - alivePlayers.length;
      const newPlayers = generateTeam(this.allowedTypesOfThePlayer, this.maxLevel, needMore);
      alivePlayers = [...alivePlayers, ...newPlayers];
    }

    this.playerTeam = alivePlayers;

    // генерируем новых врагов
    this.enemyTeam = generateTeam(this.allowedTypesOfTheEnemy, this.maxLevel, this.characterCount);

    // Размещаем песронажей
    const playerPositions = generatePositionsForTeam(this.playerTeam, [0, 1], boardSize);
    const enemyPositions = generatePositionsForTeam(this.enemyTeam, [boardSize - 2, boardSize - 1], boardSize);
    this.positionedCharacters = [...playerPositions, ...enemyPositions];
    this.gamePlay.redrawPositions(this.positionedCharacters);
  }

  async onCellClick(index) {
    if (this.selectedCell !== null) {
      this.gamePlay.deselectCell(this.selectedCell);
      this.gamePlay.setCursor(cursors.auto);
      this.availableMoves = [];
    }

    const positionedCharacter = this.getPositionedCharacter(index);
    if (positionedCharacter && this.isPlayerCharacter(positionedCharacter.character)) {
      this.gamePlay.selectCell(index);
      this.selectedCell = index;
      this.gamePlay.setCursor(cursors.pointer);
      this.availableMoves = showPossibleMoves(index, this);
      return;
    }

    if (this.selectedCell !== null) {
      const selectedPositionedCharacter = this.getPositionedCharacter(this.selectedCell);
      const selectedCharacter = selectedPositionedCharacter.character;
      const boardSize = this.gamePlay.boardSize;

      const target = this.getPositionedCharacter(index);
      if (target && !this.isPlayerCharacter(target.character)) {
        if (isCellAttackable(this.selectedCell, index, selectedCharacter.type, boardSize, this)) {
          await attackCharacter(selectedCharacter, index, this);
          this.selectedCell = null;
          this.gamePlay.setCursor(cursors.auto);
          console.log(`player атаковал`);
          return;
        }
      }

      else if (isCellMovable(this.selectedCell, index, selectedCharacter.type, boardSize)) {
        await moveCharacter(selectedPositionedCharacter, index, this);
        this.selectedCell = null;
        this.gamePlay.setCursor(cursors.auto);
        console.log(`player переместился`);
        return;
      }

      GamePlay.showError("Unacceptable action");
      this.selectedCell = null;
      this.gamePlay.setCursor(cursors.auto);
      return;
    }

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

      if (this.availableMoves.includes(index)) {
        if (positionedCharacter && this.isPlayerCharacter(positionedCharacter.character)) { // Если цель курсора - персонаж игрока
          this.gamePlay.setCursor(cursors.pointer);
        } else if (isCellMovable(this.selectedCell, index, selectedCharacter.type, boardSize) && !this.getPositionedCharacter(index)) { // Если можно переместиться
          this.gamePlay.selectCell(index, 'green');
          this.gamePlay.setCursor(cursors.pointer);
        } else if (positionedCharacter && !this.isPlayerCharacter(positionedCharacter.character) && isCellAttackable(this.selectedCell, index, selectedCharacter.type, boardSize)) { // Если можно атаковать
          this.gamePlay.selectCell(index, 'red');
          this.gamePlay.setCursor(cursors.crosshair);
        } else { // можно передвигаться, но нельзя атаковать, или наоборот.
          this.gamePlay.setCursor(cursors.notallowed); 
        }
      } else { // Нельзя ни переместиться, ни атаковать
        this.gamePlay.setCursor(cursors.notallowed);
      }
    } else { // нет выбранного персонажа
      this.gamePlay.setCursor(cursors.auto);
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