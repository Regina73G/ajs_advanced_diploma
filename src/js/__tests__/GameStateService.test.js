import GameStateService from "../GameStateService";

  let mockStorage;
  let service;

  beforeEach(() => {
    mockStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
    };
    service = new GameStateService(mockStorage);
  });

  test('успешная загрузка состояния', () => {
    const stateObj = { score: 100, gameLevel: 2 };
    mockStorage.getItem.mockReturnValue(JSON.stringify(stateObj));

    const result = service.load();

    expect(mockStorage.getItem).toHaveBeenCalledWith('state');
    expect(result).toEqual(stateObj);
  });

  test('ошибка при загрузке некорректного JSON', () => {
    mockStorage.getItem.mockReturnValue('невалидный JSON');
    expect(() => service.load()).toThrow('Invalid state');
  });