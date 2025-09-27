import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class SubmitCardsDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-D][1-4]$/, {
    message: 'card1Position must be in format A1-D4 (e.g., A1, B2, C3, D4)',
  })
  card1Position: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-D][1-4]$/, {
    message: 'card2Position must be in format A1-D4 (e.g., A1, B2, C3, D4)',
  })
  card2Position: string;
}
