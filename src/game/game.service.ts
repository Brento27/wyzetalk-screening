import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Game, GameDocument } from '../schemas/game.schema';
import { Attempt, AttemptDocument } from '../schemas/attempt.schema';
import { createShuffledBoard, findCardByPosition, isCardMatch, validateCardPositions, getRemainingPairs } from '../utils/card.utils';
import { SubmitCardsDto } from './dto/submit-cards.dto';
import { CardType, GridPosition } from '../types/card.types';

export interface StartGameResponse {
  gameId: string;
  /*board: Array<{
    type: string;
    position: string;
    isFlipped: boolean;
    isMatched: boolean;
  }>;*/
}

export interface SubmitCardsResponse {
  isMatch: boolean;
  matchedPairs: CardType[];
  attempts: number;
  isCompleted: boolean;
  cardsAttempted: {
    card1: {
      type: CardType;
      position: GridPosition;
    };
    card2: {
      type: CardType;
      position: GridPosition;
    };
  };
}

@Injectable()
export class GameService {
  constructor(
    @InjectModel(Game.name) private gameModel: Model<GameDocument>,
    @InjectModel(Attempt.name) private attemptModel: Model<AttemptDocument>,
  ) {}

  async startGame(): Promise<StartGameResponse> {
    // Generate unique game ID
    const gameId = uuidv4();

    // Create shuffled board
    const board = createShuffledBoard();

    // Create new game document
    const newGame = new this.gameModel({
      gameId,
      board,
      matchedPairs: [],
      attempts: 0,
      isCompleted: false,
      startTime: new Date(),
      gridSize: '4x4',
    });

    // Save to MongoDB
    const savedGame = await newGame.save();

    // Return the game ID and initial board state (all cards face-down)
    return {
      gameId: savedGame.gameId,
      /*
      board: savedGame.board.map(card => ({
        type: card.type,
        position: card.position,
        isFlipped: false, // Always return face-down for initial state
        isMatched: card.isMatched,
      })),
      */
    };
  }

  async submitCards(gameId: string, submitCardsDto: SubmitCardsDto): Promise<SubmitCardsResponse> {
    const { card1Position, card2Position } = submitCardsDto;

    // Find the game by gameId
    const game = await this.gameModel.findOne({ gameId });
    if (!game) {
      throw new NotFoundException(`Game with ID ${gameId} not found`);
    }

    // Check if game is already completed
    if (game.isCompleted) {
      throw new BadRequestException('Game is already completed');
    }

    // Validate card positions using utility function
    if (!validateCardPositions(card1Position as GridPosition, card2Position as GridPosition)) {
      throw new BadRequestException('Invalid card positions - positions must be different and in A1-D4 format');
    }

    // Find cards in the board
    const card1 = findCardByPosition(game.board, card1Position as GridPosition);
    const card2 = findCardByPosition(game.board, card2Position as GridPosition);

    // Validate that cards exist in the board (should always exist if positions are valid)
    if (!card1 || !card2) {
      throw new BadRequestException('One or both card positions are invalid');
    }

    // Check if cards are already matched
    if (card1.isMatched || card2.isMatched) {
      throw new BadRequestException('One or both cards are already matched');
    }

    // Increment attempts counter
    game.attempts += 1;

    // Check if cards match
    const isMatch = isCardMatch(card1, card2);

    if (isMatch) {
      // Add card type to matched pairs
      if (!game.matchedPairs.includes(card1.type)) {
        game.matchedPairs.push(card1.type);
      }

      // Update card states
      card1.isMatched = true;
      card2.isMatched = true;

      // Check if all pairs are matched using utility function
      const remainingPairs = getRemainingPairs(game.board);
      if (remainingPairs === 0) {
        game.isCompleted = true;
        game.endTime = new Date();
      }
    }

    // Create and save attempt document
    const attempt = new this.attemptModel({
      gameId,
      cardsChosen: [card1Position as GridPosition, card2Position as GridPosition],
      isMatch,
      timestamp: new Date(),
    });
    await attempt.save();

    // Update and save the game document
    await game.save();

    // Return the result
    return {
      isMatch,
      matchedPairs: game.matchedPairs,
      attempts: game.attempts,
      isCompleted: game.isCompleted,
      cardsAttempted: {
        card1: {
          type: card1.type,
          position: card1.position,
        },
        card2: {
          type: card2.type,
          position: card2.position,
        },
      },
    };
  }
}
