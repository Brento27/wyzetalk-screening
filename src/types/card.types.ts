export enum CardType {
  DOG = 'Dog',
  CAT = 'Cat',
  HORSE = 'Horse',
  BIRD = 'Bird',
  FISH = 'Fish',
  LION = 'Lion',
  ELEPHANT = 'Elephant',
  MONKEY = 'Monkey',
}

export const CARD_TYPES = Object.values(CardType);

export const GRID_POSITIONS = [
  'A1', 'A2', 'A3', 'A4',
  'B1', 'B2', 'B3', 'B4',
  'C1', 'C2', 'C3', 'C4',
  'D1', 'D2', 'D3', 'D4',
] as const;

export type GridPosition = typeof GRID_POSITIONS[number];

export interface Card {
  type: CardType;
  position: GridPosition;
  isFlipped: boolean;
  isMatched: boolean;
}
