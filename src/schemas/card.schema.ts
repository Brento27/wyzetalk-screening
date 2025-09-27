import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { CardType } from '../types/card.types';
import type { GridPosition } from '../types/card.types';

export type CardDocument = Card & Document;

@Schema({ _id: false })
export class Card {
  @Prop({ required: true, enum: Object.values(CardType) })
  type: CardType;

  @Prop({ required: true })
  position: GridPosition;

  @Prop({ default: false })
  isFlipped: boolean;

  @Prop({ default: false })
  isMatched: boolean;
}

export const CardSchema = SchemaFactory.createForClass(Card);
