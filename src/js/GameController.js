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
import Team from "./Team";

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
    this.gameLevel = 1;

    // Подписываем AI на смену хода
    this.gameState.onAfterTurn((turn) => {
      if (turn === 'computer') {
        setTimeout(() => {
          this.aiController.makeMove();
          this.gamePlay.setCursor(cursors.auto);
        }, 200);
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
    this.gamePlay.addNewGameListener(() => this.startNewGame());
  }

  getPositionedCharacter(index) {
    return this.positionedCharacters.find(item => item.position === index) || null;
  }

  isPlayerCharacter(character) {
    return this.allowedTypesOfThePlayer.some(type => character instanceof type);
  }

  blockBoard() {
    this.gamePlay.cellClickListeners = [];
    this.gamePlay.cellEnterListeners = [];
    this.gamePlay.cellLeaveListeners = [];
    this.gamePlay.setCursor('auto');
  }

  checkGameStatus() {
    const players = this.positionedCharacters.filter(char => this.isPlayerCharacter(char.character));
    const enemies = this.positionedCharacters.filter(char => !this.isPlayerCharacter(char.character));

    if ((players.length === 0) || (this.gameLevel === 4 && enemies.length === 0)) { // Если персонажей нет, то Game Over или если ур 4 и врагов нет
      this.gameState.setGameOver();
      this.blockBoard();
      GamePlay.showMessage(`Game Over! Ваш счёт: ${this.gameState.score}, рекорд: ${this.gameState.maxScore}`);
      if(this.gameState.score === (this.characterCount * 4) * 100) {
        GamePlay.showMessage(`You won! Ваш счёт: ${this.gameState.score}, рекорд: ${this.gameState.maxScore}`);
        return;
      }
      return;
    }

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
    this.gameState.changeTurn();

    switch (this.gameLevel) {
      case 2:
        this.gamePlay.drawUi(themes.desert);
        console.log(`---Level 2---`);
        break;
      case 3:
        this.gamePlay.drawUi(themes.arctic);
        console.log(`---Level 3---`);
        break;
      case 4:
        this.gamePlay.drawUi(themes.mountain);
        console.log(`---Level 4---`);
        break;
    }    

    const boardSize = this.gamePlay.boardSize;

    // 1. Живые игроки
    let playerChars = this.positionedCharacters
      .filter(pc => this.isPlayerCharacter(pc.character))
      .map(pc => pc.character);

    // 2. Если все умерли → Game Over
    if (playerChars.length === 0) {
      this.gameOver();
      return;
    }

    // 3. Добираем недостающих
    if (playerChars.length < this.characterCount) {
      const needMore = this.characterCount - playerChars.length;
      const newPlayersTeam = generateTeam(this.allowedTypesOfThePlayer, this.maxLevel, needMore);
      playerChars = [...playerChars, ...newPlayersTeam.characters]; // берём characters
    }

    // 4. Враги
    this.enemyTeam = generateTeam(this.allowedTypesOfTheEnemy, this.maxLevel, this.characterCount);

    // 5. Позиции
    const playerPositions = generatePositionsForTeam(
      new Team(playerChars),   // оборачиваем в Team
      [0, 1],
      boardSize
    );

    const enemyPositions = generatePositionsForTeam(
      this.enemyTeam,
      [boardSize - 2, boardSize - 1],
      boardSize
    );

    this.positionedCharacters = [...playerPositions, ...enemyPositions];
    this.gamePlay.redrawPositions(this.positionedCharacters);
  }

  startNewGame() {
    this.gameState.score = 0;
    this.gameState.gameOver = false;
    this.gameLevel = 1;
    this.maxLevel = 1;

    this.init(); // перезапускаем игру
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
          // console.log(`player атаковал`);
          return;
        }
      }

      else if (isCellMovable(this.selectedCell, index, selectedCharacter.type, boardSize)) {
        await moveCharacter(selectedPositionedCharacter, index, this);
        this.selectedCell = null;
        this.gamePlay.setCursor(cursors.auto);
        // console.log(`player переместился`);
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