import themes from "./themes";
import { generateTeam, generatePositionsForTeam } from "./generators";
import Bowman from "./characters/Bowman";
import Swordsman from "./characters/Swordsman";
import Magician from "./characters/Magician";
import Daemon from "./characters/Daemon";
import Undead from "./characters/Undead";
import Vampire from "./characters/Vampire";

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.maxLevel = 2;
    this.characterCount = 2;
    this.allowedTypesOfThePlayer = [Bowman, Swordsman, Magician];
    this.allowedTypesOfTheEnemy = [Daemon, Undead, Vampire];
    this.positionedCharacter = [];
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

  onCellClick(index) {
    // TODO: react to click
  }

  onCellEnter(index) {
    this.positionedCharacters.forEach(item => {
      if (item.position === index) {
        this.gamePlay.showCellTooltip(this.gamePlay.showCharacterInfo(item.character), index);
      }
    })
  }

  onCellLeave(index) {
    this.gamePlay.hideCellTooltip(index);
  }
}