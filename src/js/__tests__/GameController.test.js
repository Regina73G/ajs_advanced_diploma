import GameController from "../GameController";
import GameState from "../GameState";
import GamePlay from "../GamePlay";

jest.mock('../GamePlay'); // мок GamePlay

  let gamePlay;
  let stateService;
  let controller;

  beforeEach(() => {
    gamePlay = new GamePlay();
    gamePlay.drawUi = jest.fn();
    gamePlay.redrawPositions = jest.fn();
    GamePlay.showMessage = jest.fn();
    GamePlay.showError = jest.fn();

    stateService = {
      load: jest.fn(),
      save: jest.fn(),
    };

    controller = new GameController(gamePlay, stateService);
    controller.gameState = new GameState();
  });

  test('успешная загрузка (loadGame)', () => {
    const savedState = {
      turn: 'computer',
      score: 200,
      maxScore: 500,
      gameOver: false,
      gameLevel: 2,
      maxLevel: 2,
      positionedCharacters: [
        { position: 10, character: { type: 'bowman', level: 1 } },
      ],
    };

    stateService.load.mockReturnValue(savedState);

    controller.loadGame();

    expect(controller.gameState).toMatchObject({
      turn: 'computer',
      score: 200,
      maxScore: 500,
      gameLevel: 2,
      maxLevel: 2,
    });

    expect(GamePlay.showMessage).toHaveBeenCalledWith('Игра загружена!');
  });

  test('ошибка при загрузке вызывает GamePlay.showError (loadGame)', () => {
    stateService.load.mockImplementation(() => {
      throw new Error('Invalid state');
    });

    controller.loadGame();

    expect(GamePlay.showError).toHaveBeenCalledWith('Ошибка загрузки сохранения!');
  });

  test('saveGame сохраняет состояние и вызывает showMessage', () => {
    const gs = new GameState();
    gs.score = 123;
    gs.maxScore = 500;
    gs.gameLevel = 2;
    gs.maxLevel = 3;
    gs.turn = 'player';
    gs.positionedCharacters = [
      { position: 5, character: { type: 'swordsman', level: 1 } },
    ];

    controller.gameState = gs;
    controller.positionedCharacters = gs.positionedCharacters;

    controller.saveGame();

    expect(stateService.save).toHaveBeenCalled();

    const savedArg = stateService.save.mock.calls[0][0];
    expect(savedArg).toMatchObject({
      score: 123,
      maxScore: 500,
      gameLevel: 2,
      maxLevel: 3,
      turn: 'player',
      positionedCharacters: [
        { position: 5, character: { type: 'swordsman', level: 1 } },
      ],
    });

    expect(GamePlay.showMessage).toHaveBeenCalledWith('Игра сохранена!');
  });