import themes from "./themes";
import PositionedCharacter from "./PositionedCharacter";
import { generateTeam } from "./generators";
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
  }

  init() {
    this.gamePlay.drawUi(themes.prairie);
    this.playerTeam = generateTeam(this.allowedTypesOfThePlayer, this.maxLevel, this.characterCount);
    this.enemyTeam = generateTeam(this.allowedTypesOfTheEnemy, this.maxLevel, this.characterCount);

    const boardSize = this.gamePlay.boardSize;

    const playerPositions = this.generatePositionsForTeam(this.playerTeam, [0, 1], boardSize);
    const enemyPositions = this.generatePositionsForTeam(this.enemyTeam, [boardSize - 2, boardSize - 1], boardSize);
    this.gamePlay.redrawPositions([...playerPositions, ...enemyPositions]);
  }

  generatePositionsForTeam(team, columns, boardSize) {
    const positions = [];
    const usedPositions = new Set();
    const maxAttempts = 100; // чтоб не было бесконечного цикла

    for (const character of team.characters) {
      let position = null;
      let attempts = 0;

      while (position === null && attempts < maxAttempts) {
        attempts++;
        const column = columns[Math.floor(Math.random() * columns.length)];
        const row = Math.floor(Math.random() * boardSize);
        const candidatePosition = row * boardSize + column;

        if (!usedPositions.has(candidatePosition)) {
          position = candidatePosition;
          usedPositions.add(candidatePosition);
        }
      }

      if (position !== null) {
        positions.push(new PositionedCharacter(character, position));
      } else {
        console.warn(`Не удалось найти уникальную позицию для персонажа ${character.type} после ${maxAttempts} попыток.`);
      }
    }

    return positions;
  }

  onCellClick(index) {
    // TODO: react to click
  }

  onCellEnter(index) {
    // TODO: react to mouse enter
  }

  onCellLeave(index) {
    // TODO: react to mouse leave
  }
}