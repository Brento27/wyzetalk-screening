import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { GameService } from '../src/game/game.service';
import { getModelToken } from '@nestjs/mongoose';
import { Game } from '../src/schemas/game.schema';
import { Attempt } from '../src/schemas/attempt.schema';

describe('Game API (e2e)', () => {
  let app: INestApplication;
  let gameService: GameService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Apply the same global pipes as in main.ts
    app.useGlobalPipes(new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }));

    await app.init();
    
    gameService = moduleFixture.get<GameService>(GameService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /games/start', () => {
    it('should start a new game', async () => {
      const response = await request(app.getHttpServer())
        .post('/games/start')
        .expect(201);

      expect(response.body).toHaveProperty('gameId');
      expect(response.body.gameId).toBeDefined();
      expect(typeof response.body.gameId).toBe('string');
    });

    it('should generate unique game IDs for multiple games', async () => {
      const response1 = await request(app.getHttpServer())
        .post('/games/start')
        .expect(201);

      const response2 = await request(app.getHttpServer())
        .post('/games/start')
        .expect(201);

      expect(response1.body.gameId).not.toBe(response2.body.gameId);
    });
  });

  describe('POST /games/:gameId/submit-cards', () => {
    let gameId: string;

    beforeEach(async () => {
      // Create a game for each test
      const startResponse = await request(app.getHttpServer())
        .post('/games/start')
        .expect(201);
      
      gameId = startResponse.body.gameId;
    });

    it('should successfully submit valid card positions', async () => {
      const response = await request(app.getHttpServer())
        .post(`/games/${gameId}/submit-cards`)
        .send({
          card1Position: 'A1',
          card2Position: 'B1',
        })
        .expect(201);

      expect(response.body).toHaveProperty('isMatch');
      expect(response.body).toHaveProperty('attempts');
      expect(response.body).toHaveProperty('isCompleted');
      expect(response.body).toHaveProperty('matchedPairs');
      expect(response.body).toHaveProperty('cardsAttempted');
      expect(response.body.attempts).toBe(1);
      expect(typeof response.body.isMatch).toBe('boolean');
    });

    it('should return 400 for invalid card positions', async () => {
      const response = await request(app.getHttpServer())
        .post(`/games/${gameId}/submit-cards`)
        .send({
          card1Position: 'Z9',
          card2Position: 'X1',
        })
        .expect(400);

      expect(response.body).toHaveProperty('statusCode', 400);
      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 for same card position', async () => {
      const response = await request(app.getHttpServer())
        .post(`/games/${gameId}/submit-cards`)
        .send({
          card1Position: 'A1',
          card2Position: 'A1',
        })
        .expect(400);

      expect(response.body).toHaveProperty('statusCode', 400);
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app.getHttpServer())
        .post(`/games/${gameId}/submit-cards`)
        .send({
          card1Position: 'A1',
          // missing card2Position
        })
        .expect(400);

      expect(response.body).toHaveProperty('statusCode', 400);
    });

    it('should return 404 for non-existent game', async () => {
      const response = await request(app.getHttpServer())
        .post('/games/non-existent-id/submit-cards')
        .send({
          card1Position: 'A1',
          card2Position: 'B1',
        })
        .expect(404);

      expect(response.body).toHaveProperty('statusCode', 404);
    });
  });

  describe('GET /games/:gameId', () => {
    let gameId: string;

    beforeEach(async () => {
      // Create a game for each test
      const startResponse = await request(app.getHttpServer())
        .post('/games/start')
        .expect(201);
      
      gameId = startResponse.body.gameId;
    });

    it('should return game state', async () => {
      const response = await request(app.getHttpServer())
        .get(`/games/${gameId}`)
        .expect(200);

      expect(response.body).toHaveProperty('gameId', gameId);
      expect(response.body).toHaveProperty('board');
      expect(response.body).toHaveProperty('matchedPairs');
      expect(response.body).toHaveProperty('attempts');
      expect(response.body).toHaveProperty('isCompleted');
      expect(response.body).toHaveProperty('startTime');
      expect(response.body).toHaveProperty('gridSize');

      // Board should be an array of 16 cards
      expect(Array.isArray(response.body.board)).toBe(true);
      expect(response.body.board).toHaveLength(16);

      // Each card should have position, isFlipped, isMatched
      response.body.board.forEach((card: any) => {
        expect(card).toHaveProperty('position');
        expect(card).toHaveProperty('isFlipped');
        expect(card).toHaveProperty('isMatched');
        // Type should only be present for matched cards
        if (card.isMatched) {
          expect(card).toHaveProperty('type');
        }
      });
    });

    it('should return 404 for non-existent game', async () => {
      const response = await request(app.getHttpServer())
        .get('/games/non-existent-id')
        .expect(404);

      expect(response.body).toHaveProperty('statusCode', 404);
    });
  });

  describe('GET /leaderboard', () => {
    it('should return leaderboard', async () => {
      const response = await request(app.getHttpServer())
        .get('/leaderboard')
        .expect(200);

      expect(response.body).toHaveProperty('leaderboard');
      expect(Array.isArray(response.body.leaderboard)).toBe(true);
      
      // Leaderboard should have at most 5 entries
      expect(response.body.leaderboard.length).toBeLessThanOrEqual(5);

      // Each entry should have the required properties
      response.body.leaderboard.forEach((entry: any) => {
        expect(entry).toHaveProperty('gameId');
        expect(entry).toHaveProperty('attempts');
        expect(entry).toHaveProperty('timeTaken');
        expect(typeof entry.attempts).toBe('number');
        expect(typeof entry.timeTaken).toBe('number');
      });
    });
  });

  describe('Full Game Flow', () => {
    it('should complete a full game flow', async () => {
      // 1. Start a new game
      const startResponse = await request(app.getHttpServer())
        .post('/games/start')
        .expect(201);
      
      const gameId = startResponse.body.gameId;

      // 2. Get initial game state
      const initialStateResponse = await request(app.getHttpServer())
        .get(`/games/${gameId}`)
        .expect(200);

      expect(initialStateResponse.body.attempts).toBe(0);
      expect(initialStateResponse.body.isCompleted).toBe(false);
      expect(initialStateResponse.body.matchedPairs).toHaveLength(0);

      // 3. Submit some card attempts
      const submitResponse = await request(app.getHttpServer())
        .post(`/games/${gameId}/submit-cards`)
        .send({
          card1Position: 'A1',
          card2Position: 'B1',
        })
        .expect(201);

      expect(submitResponse.body.attempts).toBe(1);
      expect(submitResponse.body).toHaveProperty('cardsAttempted');
      expect(submitResponse.body.cardsAttempted.card1).toHaveProperty('position', 'A1');
      expect(submitResponse.body.cardsAttempted.card2).toHaveProperty('position', 'B1');

      // 4. Check game state after attempt
      const stateAfterAttempt = await request(app.getHttpServer())
        .get(`/games/${gameId}`)
        .expect(200);

      expect(stateAfterAttempt.body.attempts).toBe(1);

      // 5. Check leaderboard (should be empty or contain other games)
      const leaderboardResponse = await request(app.getHttpServer())
        .get('/leaderboard')
        .expect(200);

      expect(leaderboardResponse.body).toHaveProperty('leaderboard');
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON', async () => {
      const response = await request(app.getHttpServer())
        .post('/games/start')
        .send('invalid json')
        .expect(201); // The start endpoint doesn't require body validation

      expect(response.body).toHaveProperty('gameId');
    });

    it('should handle invalid route parameters', async () => {
      const response = await request(app.getHttpServer())
        .get('/games/invalid-uuid')
        .expect(404);

      expect(response.body).toHaveProperty('statusCode', 404);
    });
  });
});
