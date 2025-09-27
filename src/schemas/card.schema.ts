import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { CardType, GRID_POSITIONS } from '../types/card.types';

export type CardDocument = Card & Document;

@Schema({ _id: false })
export class Card {
  @Prop({ required: true, enum: Object.values(CardType), type: String })
  type: CardType;

  @Prop({ required: true, enum: GRID_POSITIONS, type: String })
  position: typeof GRID_POSITIONS[number];

  @Prop({ default: false })
  isFlipped: boolean;

  @Prop({ default: false })
  isMatched: boolean;
}

export const CardSchema = SchemaFactory.createForClass(Card);
