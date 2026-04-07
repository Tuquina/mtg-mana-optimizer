import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import { AppModule } from '../src/app.module';
import { sampleStandardDecklist } from '@mtg-mana-optimizer/shared';

describe('Analysis API integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns an analysis payload for a valid deck', async () => {
    const response = await request(app.getHttpServer())
      .post('/analysis')
      .send({ decklistText: sampleStandardDecklist })
      .expect(201);

    expect(response.body.recommendedLandCount).toBeGreaterThan(18);
    expect(response.body.manaCurve.length).toBeGreaterThan(0);
  });
});
