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

  it('returns a full analysis payload for a valid deck', async () => {
    const response = await request(app.getHttpServer())
      .post('/analysis')
      .send({ decklistText: sampleStandardDecklist })
      .expect(201);

    expect(response.body.landCountRecommendation.recommendedLandCount).toBeGreaterThan(18);
    expect(response.body.manaCurveAnalysis.byManaValue.length).toBeGreaterThan(0);
    expect(response.body.optimization.warnings).toBeDefined();
  });


  it('returns full mana curve vertical-slice response', async () => {
    const response = await request(app.getHttpServer())
      .post('/analysis/curve-analysis')
      .send({ decklistText: sampleStandardDecklist })
      .expect(201);

    expect(response.body.manaCurveAnalysis.manaValuePeakBucket).toBeDefined();
    expect(response.body.manaCurveAnalysis.expectedCastGapBuckets).toBeDefined();
  });

  it('returns mana curve endpoint response', async () => {
    const response = await request(app.getHttpServer())
      .post('/analysis/mana-curve')
      .send({ decklistText: sampleStandardDecklist })
      .expect(201);

    expect(response.body.manaCurveAnalysis.byExpectedCast.length).toBeGreaterThan(0);
  });

  it('returns land count recommendation endpoint response', async () => {
    const response = await request(app.getHttpServer())
      .post('/analysis/land-count')
      .send({ decklistText: sampleStandardDecklist })
      .expect(201);

    expect(response.body.landCountRecommendation.probabilities).toHaveLength(3);
  });

  it('returns colored source recommendation endpoint response', async () => {
    const response = await request(app.getHttpServer())
      .post('/analysis/colored-sources')
      .send({ decklistText: sampleStandardDecklist })
      .expect(201);

    expect(response.body.coloredSourceRecommendation.targets.length).toBeGreaterThan(0);
  });

  it('returns optimization endpoint response', async () => {
    const response = await request(app.getHttpServer())
      .post('/analysis/optimize')
      .send({ decklistText: sampleStandardDecklist })
      .expect(201);

    expect(response.body.optimization.explanation.summary.length).toBeGreaterThan(0);
  });
});
