import { Body, Controller, Post } from '@nestjs/common';
import type { DeckAnalysisRequest, DeckAnalysisResponse } from '@mtg-mana-optimizer/shared';
import { AppService } from './app.service';

@Controller('analysis')
export class AppController {
  constructor(private readonly appService: AppService) {}

  /** Typed analysis endpoint used by the web app. */
  @Post()
  analyze(@Body() request: DeckAnalysisRequest): DeckAnalysisResponse {
    return this.appService.analyzeDeck(request);
  }
}
