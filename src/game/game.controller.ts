import { Controller, Post, Param, Body, ValidationPipe } from '@nestjs/common';
import { GameService, StartGameResponse, SubmitCardsResponse } from './game.service';
import { SubmitCardsDto } from './dto/submit-cards.dto';

@Controller('games')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post('start')
  async startGame(): Promise<StartGameResponse> {
    return this.gameService.startGame();
  }

  @Post(':gameId/submit-cards')
  async submitCards(
    @Param('gameId') gameId: string,
    @Body(ValidationPipe) submitCardsDto: SubmitCardsDto,
  ): Promise<SubmitCardsResponse> {
    return this.gameService.submitCards(gameId, submitCardsDto);
  }
}
