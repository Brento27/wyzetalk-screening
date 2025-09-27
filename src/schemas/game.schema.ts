import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Card, CardSchema } from './card.schema';
import { CardType } from '../types/card.types';

export type GameDocument = Game & Document;

@Schema({ timestamps: true })
export class Game {
  @Prop({ required: true, unique: true })
  gameId: string;

  @Prop({ type: [CardSchema], required: true })
  board: Card[];

  @Prop({ type: [String], enum: Object.values(CardType), default: [] })
  matchedPairs: CardType[];

  @Prop({ default: 0, min: 0 })
  attempts: number;

  @Prop({ default: false })
  isCompleted: boolean;

  @Prop({ required: true })
  startTime: Date;

  @Prop()
  endTime?: Date;

  @Prop({ default: '4x4' })
  gridSize: string;
}

export const GameSchema = SchemaFactory.createForClass(Game);
