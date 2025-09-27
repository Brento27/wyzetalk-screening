import { Test, TestingModule } from '@nestjs/testing';
import { GameController, LeaderboardController } from './game.controller';
import { GameService } from './game.service';
import { SubmitCardsDto } from './dto/submit-cards.dto';
import { CardType } from '../types/card.types';

describe('GameController', () => {
  let controller: GameController;
  let gameService: GameService;

  const mockGameService = {
    startGame: jest.fn(),
    submitCards: jest.fn(),
    getGameState: jest.fn(),
    getLeaderboard: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GameController],
      providers: [
        {
          provide: GameService,
          useValue: mockGameService,
        },
      ],
    }).compile();

    controller = module.get<GameController>(GameController);
    gameService = module.get<GameService>(GameService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('startGame', () => {
    it('should return a new game', async () => {
      const mockGame = { gameId: 'test-game-id' };
      mockGameService.startGame.mockResolvedValue(mockGame);

      const result = await controller.startGame();

      expect(result).toEqual(mockGame);
      expect(gameService.startGame).toHaveBeenCalled();
    });
  });

  describe('submitCards', () => {
    it('should submit cards and return result', async () => {
      const gameId = 'test-game-id';
      const submitCardsDto: SubmitCardsDto = {
        card1Position: 'A1',
        card2Position: 'B1',
      };
      const mockResult = {
        isMatch: true,
        matchedPairs: [CardType.DOG],
        attempts: 1,
        isCompleted: false,
        cardsAttempted: {
          card1: { type: CardType.DOG, position: 'A1' },
          card2: { type: CardType.DOG, position: 'B1' },
        },
      };

      mockGameService.submitCards.mockResolvedValue(mockResult);

      const result = await controller.submitCards(gameId, submitCardsDto);

      expect(result).toEqual(mockResult);
      expect(gameService.submitCards).toHaveBeenCalledWith(gameId, submitCardsDto);
    });
  });

  describe('getGameState', () => {
    it('should return game state', async () => {
      const gameId = 'test-game-id';
      const mockGameState = {
        gameId,
        board: [
          { position: 'A1', isFlipped: false, isMatched: false },
          { position: 'A2', isFlipped: false, isMatched: false },
        ],
        matchedPairs: [],
        attempts: 0,
        isCompleted: false,
        startTime: new Date(),
        gridSize: '4x4',
      };

      mockGameService.getGameState.mockResolvedValue(mockGameState);

      const result = await controller.getGameState(gameId);

      expect(result).toEqual(mockGameState);
      expect(gameService.getGameState).toHaveBeenCalledWith(gameId);
    });
  });
});

describe('LeaderboardController', () => {
  let controller: LeaderboardController;
  let gameService: GameService;

  const mockGameService = {
    getLeaderboard: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LeaderboardController],
      providers: [
        {
          provide: GameService,
          useValue: mockGameService,
        },
      ],
    }).compile();

    controller = module.get<LeaderboardController>(LeaderboardController);
    gameService = module.get<GameService>(GameService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getLeaderboard', () => {
    it('should return leaderboard', async () => {
      const mockLeaderboard = {
        leaderboard: [
          { gameId: 'game1', attempts: 5, timeTaken: 300000 },
          { gameId: 'game2', attempts: 8, timeTaken: 480000 },
        ],
      };

      mockGameService.getLeaderboard.mockResolvedValue(mockLeaderboard);

      const result = await controller.getLeaderboard();

      expect(result).toEqual(mockLeaderboard);
      expect(gameService.getLeaderboard).toHaveBeenCalled();
    });
  });
});
