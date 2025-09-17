import { handler } from '../../handlers/crisis';
import { APIGatewayProxyEvent } from 'aws-lambda';

describe('Crisis Handler', () => {
  it('should handle contamination crisis scenario', async () => {
    const event: APIGatewayProxyEvent = {
      httpMethod: 'POST',
      path: '/crisis',
      headers: {},
      multiValueHeaders: {},
      queryStringParameters: null,
      multiValueQueryStringParameters: null,
      pathParameters: null,
      stageVariables: null,
      requestContext: {} as any,
      resource: '',
      isBase64Encoded: false,
      body: JSON.stringify({
        crisisType: 'contamination',
        severity: 'high',
        affectedProducts: ['Organic Cookies'],
        affectedMarkets: ['EU', 'ES'],
        description: 'Salmonella contamination detected in production batch',
        timeline: 'Immediate action required',
        immediateActions: ['Stop production', 'Issue recall']
      })
    };

    const result = await handler(event);

    expect(result.statusCode).toBe(200);

    const responseBody = JSON.parse(result.body);
    expect(responseBody.success).toBe(true);
    expect(responseBody.data).toBeDefined();
    expect(responseBody.data.crisisId).toBeDefined();
    expect(responseBody.data.scenario.crisisType).toBe('contamination');
    expect(responseBody.data.scenario.severity).toBe('high');
    expect(responseBody.data.revisedLabels).toBeDefined();
    expect(responseBody.data.communicationMaterials).toBeDefined();
    expect(responseBody.data.actionPlan).toBeDefined();
    expect(responseBody.processingTime).toBeDefined();
    expect(responseBody.urgencyLevel).toBe('high');
  });

  it('should handle allergen crisis scenario', async () => {
    const event: APIGatewayProxyEvent = {
      httpMethod: 'POST',
      path: '/crisis',
      headers: {},
      multiValueHeaders: {},
      queryStringParameters: null,
      multiValueQueryStringParameters: null,
      pathParameters: null,
      stageVariables: null,
      requestContext: {} as any,
      resource: '',
      isBase64Encoded: false,
      body: JSON.stringify({
        crisisType: 'allergen',
        severity: 'critical',
        affectedProducts: ['Chocolate Bar'],
        affectedMarkets: ['BR'],
        description: 'Undeclared tree nuts found in production',
        timeline: 'Immediate recall required'
      })
    };

    const result = await handler(event);

    expect(result.statusCode).toBe(200);

    const responseBody = JSON.parse(result.body);
    expect(responseBody.success).toBe(true);
    expect(responseBody.data.scenario.crisisType).toBe('allergen');
    expect(responseBody.data.scenario.severity).toBe('critical');
    expect(responseBody.urgencyLevel).toBe('critical');
  });

  it('should handle multi-market crisis scenario', async () => {
    const event: APIGatewayProxyEvent = {
      httpMethod: 'POST',
      path: '/crisis',
      headers: {},
      multiValueHeaders: {},
      queryStringParameters: null,
      multiValueQueryStringParameters: null,
      pathParameters: null,
      stageVariables: null,
      requestContext: {} as any,
      resource: '',
      isBase64Encoded: false,
      body: JSON.stringify({
        crisisType: 'regulatory',
        severity: 'medium',
        affectedProducts: ['Energy Drink'],
        affectedMarkets: ['EU', 'ES', 'AO', 'MO', 'BR'],
        description: 'New caffeine regulations affecting product formula',
        timeline: 'Compliance update needed within 30 days'
      })
    };

    const result = await handler(event);

    expect(result.statusCode).toBe(200);

    const responseBody = JSON.parse(result.body);
    expect(responseBody.success).toBe(true);
    expect(responseBody.data.scenario.affectedMarkets).toHaveLength(5);
    expect(responseBody.data.revisedLabels).toBeDefined();

    // Should have labels for all affected markets
    expect(Object.keys(responseBody.data.revisedLabels)).toEqual(
      expect.arrayContaining(['EU', 'ES', 'AO', 'MO', 'BR'])
    );

    // Should have communication materials for all markets
    expect(responseBody.data.communicationMaterials.length).toBeGreaterThan(0);
  });

  it('should handle invalid input gracefully', async () => {
    const event: APIGatewayProxyEvent = {
      httpMethod: 'POST',
      path: '/crisis',
      headers: {},
      multiValueHeaders: {},
      queryStringParameters: null,
      multiValueQueryStringParameters: null,
      pathParameters: null,
      stageVariables: null,
      requestContext: {} as any,
      resource: '',
      isBase64Encoded: false,
      body: JSON.stringify({
        crisisType: 'invalid-type',
        severity: 'unknown'
      })
    };

    const result = await handler(event);

    expect(result.statusCode).toBe(500);

    const responseBody = JSON.parse(result.body);
    expect(responseBody.success).toBe(false);
    expect(responseBody.error).toBeDefined();
  });

  it('should generate appropriate crisis warnings', async () => {
    const event: APIGatewayProxyEvent = {
      httpMethod: 'POST',
      path: '/crisis',
      headers: {},
      multiValueHeaders: {},
      queryStringParameters: null,
      multiValueQueryStringParameters: null,
      pathParameters: null,
      stageVariables: null,
      requestContext: {} as any,
      resource: '',
      isBase64Encoded: false,
      body: JSON.stringify({
        crisisType: 'contamination',
        severity: 'critical',
        affectedProducts: ['Prepared Salad'],
        affectedMarkets: ['EU'],
        description: 'E. coli contamination detected',
        timeline: 'Immediate action'
      })
    };

    const result = await handler(event);

    const responseBody = JSON.parse(result.body);
    const euLabel = responseBody.data.revisedLabels.EU;

    expect(euLabel.labelData.warnings).toEqual(
      expect.arrayContaining([
        expect.stringContaining('DO NOT CONSUME'),
        expect.stringContaining('CRITICAL SAFETY ALERT')
      ])
    );
  });

  it('should complete within performance requirements', async () => {
    const startTime = Date.now();

    const event: APIGatewayProxyEvent = {
      httpMethod: 'POST',
      path: '/crisis',
      headers: {},
      multiValueHeaders: {},
      queryStringParameters: null,
      multiValueQueryStringParameters: null,
      pathParameters: null,
      stageVariables: null,
      requestContext: {} as any,
      resource: '',
      isBase64Encoded: false,
      body: JSON.stringify({
        crisisType: 'packaging',
        severity: 'high',
        affectedProducts: ['Cereal Box'],
        affectedMarkets: ['BR'],
        description: 'Incorrect allergen labeling on packaging',
        timeline: 'Immediate correction needed'
      })
    };

    const result = await handler(event);
    const processingTime = Date.now() - startTime;

    expect(result.statusCode).toBe(200);
    expect(processingTime).toBeLessThan(10000); // Should complete in under 10 seconds

    const responseBody = JSON.parse(result.body);
    expect(responseBody.processingTime).toBeDefined();
  });
});