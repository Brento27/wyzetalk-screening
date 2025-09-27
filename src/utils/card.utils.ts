import { CardType, GRID_POSITIONS, GridPosition } from '../types/card.types';
import { Card } from '../schemas/card.schema';

/**
 * Shuffles an array using the Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Creates a shuffled 4x4 board with 8 pairs of cards
 * @returns Array of 16 cards with shuffled positions
 */
export function createShuffledBoard(): Card[] {
  // Create 8 pairs of cards (16 total)
  const cardTypes = Object.values(CardType);
  const cardPairs: CardType[] = [];
  
  // Add each card type twice to create pairs
  cardTypes.forEach(cardType => {
    cardPairs.push(cardType, cardType);
  });

  // Shuffle the card types
  const shuffledCardTypes = shuffleArray(cardPairs);

  // Create cards with positions
  const cards: Card[] = shuffledCardTypes.map((cardType, index) => ({
    type: cardType,
    position: GRID_POSITIONS[index],
    isFlipped: false,
    isMatched: false,
  }));

  return cards;
}

/**
 * Validates if two positions are valid for a match attempt
 * @param position1 First card position
 * @param position2 Second card position
 * @returns True if positions are valid and different
 */
export function validateCardPositions(position1: GridPosition, position2: GridPosition): boolean {
  if (position1 === position2) {
    return false;
  }
  
  if (!GRID_POSITIONS.includes(position1) || !GRID_POSITIONS.includes(position2)) {
    return false;
  }
  
  return true;
}

/**
 * Finds a card by position in the board
 * @param board Array of cards
 * @param position Position to find
 * @returns Card if found, undefined otherwise
 */
export function findCardByPosition(board: Card[], position: GridPosition): Card | undefined {
  return board.find(card => card.position === position);
}

/**
 * Checks if two cards are a match
 * @param card1 First card
 * @param card2 Second card
 * @returns True if cards match
 */
export function isCardMatch(card1: Card, card2: Card): boolean {
  return card1.type === card2.type && card1.position !== card2.position;
}

/**
 * Calculates the number of remaining unmatched pairs
 * @param board Array of cards
 * @returns Number of unmatched pairs
 */
export function getRemainingPairs(board: Card[]): number {
  const unmatchedCards = board.filter(card => !card.isMatched);
  return unmatchedCards.length / 2;
}
