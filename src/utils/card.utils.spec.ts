import { createShuffledBoard, validateCardPositions, findCardByPosition, isCardMatch, getRemainingPairs } from './card.utils';
import { CardType, GRID_POSITIONS } from '../types/card.types';

describe('Card Utils', () => {
  describe('createShuffledBoard', () => {
    it('should create a board with 16 cards', () => {
      const board = createShuffledBoard();
      expect(board).toHaveLength(16);
    });

    it('should have 8 pairs of cards', () => {
      const board = createShuffledBoard();
      const cardTypes = board.map(card => card.type);
      
      // Count occurrences of each card type
      const typeCounts = cardTypes.reduce((acc, type) => {
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<CardType, number>);

      // Each card type should appear exactly twice
      Object.values(CardType).forEach(type => {
        expect(typeCounts[type]).toBe(2);
      });
    });

    it('should assign unique positions to each card', () => {
      const board = createShuffledBoard();
      const positions = board.map(card => card.position);
      
      // All positions should be unique
      expect(new Set(positions).size).toBe(16);
      
      // All positions should be valid grid positions
      positions.forEach(position => {
        expect(GRID_POSITIONS).toContain(position);
      });
    });

    it('should have all cards initially unflipped and unmatched', () => {
      const board = createShuffledBoard();
      
      board.forEach(card => {
        expect(card.isFlipped).toBe(false);
        expect(card.isMatched).toBe(false);
      });
    });
  });

  describe('validateCardPositions', () => {
    it('should return true for valid different positions', () => {
      expect(validateCardPositions('A1', 'B2')).toBe(true);
      expect(validateCardPositions('D4', 'A1')).toBe(true);
    });

    it('should return false for same position', () => {
      expect(validateCardPositions('A1', 'A1')).toBe(false);
    });

    it('should return false for invalid positions', () => {
      expect(validateCardPositions('A1', 'E1' as any)).toBe(false);
      expect(validateCardPositions('Z9' as any, 'B2')).toBe(false);
    });
  });

  describe('findCardByPosition', () => {
    it('should find card by position', () => {
      const board = createShuffledBoard();
      const card = findCardByPosition(board, 'A1');
      
      expect(card).toBeDefined();
      expect(card?.position).toBe('A1');
    });

    it('should return undefined for non-existent position', () => {
      const board = createShuffledBoard();
      const card = findCardByPosition(board, 'A1');
      
      if (card) {
        // Remove the card from board
        const filteredBoard = board.filter(c => c.position !== 'A1');
        const foundCard = findCardByPosition(filteredBoard, 'A1');
        expect(foundCard).toBeUndefined();
      }
    });
  });

  describe('isCardMatch', () => {
    it('should return true for matching cards', () => {
      const card1 = { type: CardType.DOG, position: 'A1', isFlipped: false, isMatched: false };
      const card2 = { type: CardType.DOG, position: 'B2', isFlipped: false, isMatched: false };
      
      expect(isCardMatch(card1, card2)).toBe(true);
    });

    it('should return false for non-matching cards', () => {
      const card1 = { type: CardType.DOG, position: 'A1', isFlipped: false, isMatched: false };
      const card2 = { type: CardType.CAT, position: 'B2', isFlipped: false, isMatched: false };
      
      expect(isCardMatch(card1, card2)).toBe(false);
    });

    it('should return false for same position', () => {
      const card1 = { type: CardType.DOG, position: 'A1', isFlipped: false, isMatched: false };
      const card2 = { type: CardType.DOG, position: 'A1', isFlipped: false, isMatched: false };
      
      expect(isCardMatch(card1, card2)).toBe(false);
    });
  });

  describe('getRemainingPairs', () => {
    it('should return 8 for new board', () => {
      const board = createShuffledBoard();
      expect(getRemainingPairs(board)).toBe(8);
    });

    it('should return 7 after one pair is matched', () => {
      const board = createShuffledBoard();
      
      // Find a pair and mark them as matched
      const firstCard = board[0];
      const matchingCard = board.find(card => 
        card.type === firstCard.type && card.position !== firstCard.position
      );
      
      if (matchingCard) {
        firstCard.isMatched = true;
        matchingCard.isMatched = true;
        
        expect(getRemainingPairs(board)).toBe(7);
      }
    });
  });
});
