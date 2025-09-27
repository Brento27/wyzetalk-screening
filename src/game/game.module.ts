import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { Game, GameSchema } from '../schemas/game.schema';
import { Attempt, AttemptSchema } from '../schemas/attempt.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Game.name, schema: GameSchema },
      { name: Attempt.name, schema: AttemptSchema },
    ]),
  ],
  providers: [GameService],
  controllers: [GameController]
})
export class GameModule {}
