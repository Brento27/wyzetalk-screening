import { IsString, IsNotEmpty, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitCardsDto {
  @ApiProperty({
    description: 'Position of the first card to match',
    example: 'A1',
    pattern: '^[A-D][1-4]$',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-D][1-4]$/, {
    message: 'card1Position must be in format A1-D4 (e.g., A1, B2, C3, D4)',
  })
  card1Position: string;

  @ApiProperty({
    description: 'Position of the second card to match',
    example: 'B2',
    pattern: '^[A-D][1-4]$',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-D][1-4]$/, {
    message: 'card2Position must be in format A1-D4 (e.g., A1, B2, C3, D4)',
  })
  card2Position: string;
}
