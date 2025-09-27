import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import type { GridPosition } from '../types/card.types';

export type AttemptDocument = Attempt & Document;

@Schema({ timestamps: true })
export class Attempt {
  @Prop({ required: true })
  gameId: string;

  @Prop({ type: [String], required: true, validate: {
    validator: function(cards: string[]) {
      return cards.length === 2;
    },
    message: 'Exactly 2 cards must be chosen per attempt'
  }})
  cardsChosen: GridPosition[];

  @Prop({ required: true })
  isMatch: boolean;

  @Prop({ default: Date.now })
  timestamp: Date;
}

export const AttemptSchema = SchemaFactory.createForClass(Attempt);
