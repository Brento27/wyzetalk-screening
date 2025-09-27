import { Controller, Post, Get, Param, Body, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { GameService, StartGameResponse, SubmitCardsResponse, GameStateResponse, LeaderboardResponse } from './game.service';
import { SubmitCardsDto } from './dto/submit-cards.dto';

@ApiTags('games')
@Controller('games')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post('start')
  @ApiOperation({ summary: 'Start a new memory card game' })
  @ApiResponse({ status: 201, description: 'Game started successfully' })
  async startGame(): Promise<StartGameResponse> {
    return this.gameService.startGame();
  }

  @Post(':gameId/submit-cards')
  @ApiOperation({ summary: 'Submit two cards for matching' })
  @ApiParam({ name: 'gameId', description: 'Game ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({ status: 200, description: 'Cards submitted successfully' })
  @ApiResponse({ status: 400, description: 'Invalid card positions or game already completed' })
  @ApiResponse({ status: 404, description: 'Game not found' })
  async submitCards(
    @Param('gameId') gameId: string,
    @Body(ValidationPipe) submitCardsDto: SubmitCardsDto,
  ): Promise<SubmitCardsResponse> {
    return this.gameService.submitCards(gameId, submitCardsDto);
  }

  @Get(':gameId')
  @ApiOperation({ summary: 'Get current game state' })
  @ApiParam({ name: 'gameId', description: 'Game ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({ status: 200, description: 'Game state retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Game not found' })
  async getGameState(@Param('gameId') gameId: string): Promise<GameStateResponse> {
    return this.gameService.getGameState(gameId);
  }
}

@ApiTags('leaderboard')
@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly gameService: GameService) {}

  @Get()
  @ApiOperation({ summary: 'Get top 5 completed games leaderboard' })
  @ApiResponse({ status: 200, description: 'Leaderboard retrieved successfully' })
  async getLeaderboard(): Promise<LeaderboardResponse> {
    return this.gameService.getLeaderboard();
  }
}
