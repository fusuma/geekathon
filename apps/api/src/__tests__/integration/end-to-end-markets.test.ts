// Mock environment variables
process.env.LABELS_TABLE = 'test-labels-table';

import { handler } from '../../handlers/generate';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';

// Mock external dependencies
jest.mock('../../utils/bedrock');
jest.mock('../../utils/dynamodb');

import { generateLabelWithRetry } from '../../utils/bedrock';
import { saveLabel } from '../../utils/dynamodb';

const mockGenerateLabelWithRetry = generateLabelWithRetry as jest.MockedFunction<typeof generateLabelWithRetry>;
const mockSaveLabel = saveLabel as jest.MockedFunction<typeof saveLabel>;

describe('End-to-End Market Flow Tests', () => {
  const mockContext: Context = {
    callbackWaitsForEmptyEventLoop: false,
    functionName: 'generate-label',
    functionVersion: '1',
    invokedFunctionArn: 'arn:aws:lambda:us-east-1:123456789012:function:generate-label',
    memoryLimitInMB: '512',
    awsRequestId: 'test-request-id',
    logGroupName: '/aws/lambda/generate-label',
    logStreamName: 'test-stream',
    getRemainingTimeInMillis: () => 30000,
    done: jest.fn(),
    fail: jest.fn(),
    succeed: jest.fn()
  };

  const baseEvent: Partial<APIGatewayProxyEvent> = {
    httpMethod: 'POST',
    headers: { 'Content-Type': 'application/json' },
    multiValueHeaders: {},
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    pathParameters: null,
    stageVariables: null,
    isBase64Encoded: false,
    path: '/generate',
    resource: '/generate'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockSaveLabel.mockResolvedValue(undefined);
  });

  describe('Complete Market Flows', () => {
    describe('Angola Market Flow', () => {
      test('Should generate Portuguese label for Angola with tropical climate considerations', async () => {
        mockGenerateLabelWithRetry.mockResolvedValue({
          labelData: {
            legalLabel: {
              ingredients: 'ingredientes de teste',
              allergens: 'Contém: leite, ovos',
              nutrition: {
                energy: { per100g: '350 kcal' },
                fat: { per100g: '15g' },
                protein: { per100g: '12g' }
              }
            },
            marketing: {
              short: 'Produto Alimentar de Qualidade',
              detailed: 'Produto alimentar de alta qualidade adaptado ao clima tropical'
            },
            complianceNotes: [
              'Armazenamento em clima tropical: temperatura máxima 30°C',
              'Requisitos de umidade: máximo 75% UR',
              'Conforme regulamentações do Ministério da Saúde de Angola'
            ],
            warnings: ['Manter refrigerado em clima tropical']
          },
          marketSpecificData: {
            certifications: ['Marca de Qualidade de Angola'],
            localRegulations: ['Regulamentações do Ministério da Saúde', 'Padrões coloniais portugueses'],
            culturalConsiderations: ['Língua portuguesa obrigatória', 'Considerações de clima tropical'],
            languageVariant: 'pt'
          },
          language: 'pt' as const,
          translatedData: {
            legalLabel: {
              ingredients: 'test ingredients',
              allergens: 'Contains: milk, eggs',
              nutrition: {
                energy: { per100g: '350 kcal' },
                fat: { per100g: '15g' },
                protein: { per100g: '12g' }
              }
            },
            marketing: {
              short: 'Quality Food Product',
              detailed: 'High-quality food product adapted for tropical climate'
            },
            complianceNotes: [
              'Tropical climate storage: maximum temperature 30°C',
              'Humidity requirements: maximum 75% RH',
              'Complies with Angola Ministry of Health regulations'
            ],
            warnings: ['Keep refrigerated in tropical climate']
          }
        });

        const event: APIGatewayProxyEvent = {
          ...baseEvent,
          body: JSON.stringify({
            name: 'Frango Assado Português',
            market: 'AO',
            ingredients: ['frango', 'especiarias portuguesas', 'sal marinho'],
            allergens: ['leite', 'ovos'],
            nutrition: { energy: 350, fat: 15, protein: 12 },
            productId: 'portugal-chicken-ao'
          })
        } as APIGatewayProxyEvent;

        const result = await handler(event, mockContext);

        expect(result.statusCode).toBe(200);

        const body = JSON.parse(result.body);
        expect(body.success).toBe(true);
        expect(body.data.market).toBe('AO');
        expect(body.data.language).toBe('pt');
        expect(body.data.labelData.legalLabel.allergens).toContain('Contém');
        expect(body.data.labelData.complianceNotes).toContain(
          expect.stringMatching(/tropical|clima/)
        );
        expect(body.data.translatedData).toBeDefined();
        expect(body.data.marketSpecificData.culturalConsiderations).toContain('Língua portuguesa obrigatória');
      });
    });

    describe('Macau Market Flow', () => {
      test('Should generate dual-language label for Macau with tourism industry considerations', async () => {
        mockGenerateLabelWithRetry.mockResolvedValue({
          labelData: {
            legalLabel: {
              ingredients: '豬肉, 澳門香料, 海鹽 / carne de porco, especiarias de Macau, sal marinho',
              allergens: 'Contém/含有: soja/大豆',
              nutrition: {
                energy: { per100g: '280 kcal' },
                fat: { per100g: '18g' },
                protein: { per100g: '20g' }
              }
            },
            marketing: {
              short: '澳門傳統豬肉乾 / Carne Seca Tradicional de Macau',
              detailed: 'Produto tradicional de Macau com influência chinesa e portuguesa / 融合中葡文化的澳門傳統產品'
            },
            complianceNotes: [
              'Conforme regulamentações da RAE de Macau / 符合澳門特別行政區規定',
              'Padrões da indústria do turismo aplicados / 適用旅遊業標準',
              'Certificação de segurança alimentar chinesa / 中國食品安全認證'
            ],
            warnings: []
          },
          marketSpecificData: {
            certifications: ['Marca de Qualidade de Macau/澳門品質標誌', 'Certificação de Segurança Alimentar Chinesa'],
            localRegulations: ['Regulamentações da RAE de Macau', 'Padrões GB chineses', 'Herança portuguesa'],
            culturalConsiderations: ['Influência cultural dupla', 'Indústria do turismo', 'Culinária de fusão'],
            languageVariant: 'zh-pt'
          },
          language: 'zh' as const,
          translatedData: undefined
        });

        const event: APIGatewayProxyEvent = {
          ...baseEvent,
          body: JSON.stringify({
            name: 'Macau Pork Jerky / 澳門豬肉乾',
            market: 'MO',
            ingredients: ['pork', 'Macau spices', 'sea salt'],
            allergens: ['soy'],
            nutrition: { energy: 280, fat: 18, protein: 20 },
            productId: 'macau-pork-jerky-mo'
          })
        } as APIGatewayProxyEvent;

        const result = await handler(event, mockContext);

        expect(result.statusCode).toBe(200);

        const body = JSON.parse(result.body);
        expect(body.success).toBe(true);
        expect(body.data.market).toBe('MO');
        expect(body.data.language).toBe('zh');
        expect(body.data.labelData.legalLabel.allergens).toContain('含有');
        expect(body.data.labelData.legalLabel.allergens).toContain('Contém');
        expect(body.data.labelData.complianceNotes).toContain(
          expect.stringMatching(/RAE|澳門|turismo|旅遊/)
        );
        expect(body.data.marketSpecificData.culturalConsiderations).toContain('Influência cultural dupla');
      });
    });

    describe('Brazil Market Flow', () => {
      test('Should generate Brazilian Portuguese label with ANVISA compliance', async () => {
        mockGenerateLabelWithRetry.mockResolvedValue({
          labelData: {
            legalLabel: {
              ingredients: 'carne bovina, sal, especiarias naturais',
              allergens: 'Contém: soja. Pode conter: leite, glúten',
              nutrition: {
                energy: { per100g: '250 kcal' },
                fat: { per100g: '8g' },
                protein: { per100g: '35g' },
                carbohydrates: { per100g: '2g' },
                sodium: { per100g: '1200mg' }
              }
            },
            marketing: {
              short: 'Carne Seca Brasileira Premium',
              detailed: 'Carne seca de alta qualidade produzida conforme padrões ANVISA'
            },
            complianceNotes: [
              'Certificação ANVISA obrigatória obtida - RDC nº 360/2003',
              'Tabela nutricional no formato ANVISA',
              'SAC: 0800-123-4567 (Segunda a Sexta, 8h às 18h)',
              'Ingredientes em ordem decrescente de peso conforme RDC',
              'Informações detalhadas de alérgenos em português brasileiro'
            ],
            warnings: ['Conservar em local seco e arejado']
          },
          marketSpecificData: {
            certifications: ['Certificação ANVISA', 'SISORG Orgânico', 'BRC Food Safety'],
            localRegulations: ['Regulamentações ANVISA (RDC)', 'Padrões do Ministério da Saúde', 'INMETRO'],
            culturalConsiderations: ['Mercado de agricultura em larga escala', 'Preferência por produtos orgânicos'],
            languageVariant: 'pt-BR'
          },
          language: 'pt-BR' as const,
          translatedData: {
            legalLabel: {
              ingredients: 'beef, salt, natural spices',
              allergens: 'Contains: soy. May contain: milk, gluten',
              nutrition: {
                energy: { per100g: '250 kcal' },
                fat: { per100g: '8g' },
                protein: { per100g: '35g' },
                carbohydrates: { per100g: '2g' },
                sodium: { per100g: '1200mg' }
              }
            },
            marketing: {
              short: 'Premium Brazilian Dried Beef',
              detailed: 'High-quality dried beef produced according to ANVISA standards'
            },
            complianceNotes: [
              'Mandatory ANVISA certification obtained - RDC No. 360/2003',
              'Nutritional table in ANVISA format',
              'Customer Service: 0800-123-4567 (Monday to Friday, 8am to 6pm)',
              'Ingredients in descending order by weight per RDC',
              'Detailed allergen information in Brazilian Portuguese'
            ],
            warnings: ['Store in a dry and airy place']
          }
        });

        const event: APIGatewayProxyEvent = {
          ...baseEvent,
          body: JSON.stringify({
            name: 'Carne Seca do Nordeste',
            market: 'BR',
            ingredients: ['carne bovina', 'sal', 'especiarias naturais'],
            allergens: ['soja'],
            nutrition: { energy: 250, fat: 8, protein: 35, carbohydrates: 2, sodium: 1200 },
            productId: 'northeast-dried-beef-br'
          })
        } as APIGatewayProxyEvent;

        const result = await handler(event, mockContext);

        expect(result.statusCode).toBe(200);

        const body = JSON.parse(result.body);
        expect(body.success).toBe(true);
        expect(body.data.market).toBe('BR');
        expect(body.data.language).toBe('pt-BR');
        expect(body.data.labelData.complianceNotes).toContain(
          expect.stringMatching(/ANVISA/)
        );
        expect(body.data.labelData.complianceNotes).toContain(
          expect.stringMatching(/SAC|0800/)
        );
        expect(body.data.translatedData).toBeDefined();
        expect(body.data.marketSpecificData.localRegulations).toContain('Regulamentações ANVISA (RDC)');
      });
    });

    describe('Spain Market Flow', () => {
      test('Should generate Spanish label with EU compliance', async () => {
        mockGenerateLabelWithRetry.mockResolvedValue({
          labelData: {
            legalLabel: {
              ingredients: 'jamón ibérico, sal marina, especias mediterráneas',
              allergens: 'Contiene: sulfitos',
              nutrition: {
                energy: { per100g: '380 kcal' },
                fat: { per100g: '28g' },
                protein: { per100g: '30g' },
                salt: { per100g: '3.2g' }
              }
            },
            marketing: {
              short: 'Jamón Ibérico de Bellota DOP',
              detailed: 'Jamón ibérico de bellota con Denominación de Origen Protegida'
            },
            complianceNotes: [
              'Conforme al Reglamento UE 1169/2011',
              'Denominación de Origen Protegida certificada',
              'Real Decreto 1334/1999 cumplido',
              'Certificación IFS Food aplicada'
            ],
            warnings: ['Conservar en lugar fresco y seco']
          },
          marketSpecificData: {
            certifications: ['DOP', 'IFS Food', 'Marca de Calidad Española'],
            localRegulations: ['Reglamento UE 1169/2011', 'Real Decreto 1334/1999'],
            culturalConsiderations: ['Dieta mediterránea', 'Cultura alimentaria tradicional'],
            languageVariant: 'es'
          },
          language: 'es' as const,
          translatedData: undefined
        });

        const event: APIGatewayProxyEvent = {
          ...baseEvent,
          body: JSON.stringify({
            name: 'Jamón Ibérico de Bellota',
            market: 'ES',
            ingredients: ['jamón ibérico', 'sal marina', 'especias mediterráneas'],
            allergens: ['sulfitos'],
            nutrition: { energy: 380, fat: 28, protein: 30, salt: 3.2 },
            productId: 'iberico-ham-es'
          })
        } as APIGatewayProxyEvent;

        const result = await handler(event, mockContext);

        expect(result.statusCode).toBe(200);

        const body = JSON.parse(result.body);
        expect(body.success).toBe(true);
        expect(body.data.market).toBe('ES');
        expect(body.data.language).toBe('es');
        expect(body.data.labelData.legalLabel.allergens).toContain('Contiene');
        expect(body.data.labelData.complianceNotes).toContain(
          expect.stringMatching(/Reglamento UE|Real Decreto/)
        );
        expect(body.data.marketSpecificData.certifications).toContain('DOP');
      });
    });
  });

  describe('Error Flow Testing', () => {
    test('Should handle invalid market gracefully', async () => {
      const event: APIGatewayProxyEvent = {
        ...baseEvent,
        body: JSON.stringify({
          name: 'Test Product',
          market: 'INVALID',
          ingredients: ['ingredient1'],
          allergens: [],
          nutrition: { energy: 100 }
        })
      } as APIGatewayProxyEvent;

      const result = await handler(event, mockContext);

      expect(result.statusCode).toBe(400);
      expect(JSON.parse(result.body).error).toBe('INVALID_MARKET');
    });

    test('Should provide market-specific error messages', async () => {
      mockGenerateLabelWithRetry.mockRejectedValue(new Error('AI generation failed'));

      const event: APIGatewayProxyEvent = {
        ...baseEvent,
        body: JSON.stringify({
          name: 'Test Product',
          market: 'AO',
          ingredients: ['ingredient1'],
          allergens: [],
          nutrition: { energy: 100 }
        })
      } as APIGatewayProxyEvent;

      const result = await handler(event, mockContext);

      expect(result.statusCode).toBe(500);
      const body = JSON.parse(result.body);
      expect(body.message).toContain('Angola');
    });
  });

  describe('Performance Verification', () => {
    test('Should complete all market flows within performance targets', async () => {
      const markets = ['US', 'UK', 'ES', 'AO', 'MO', 'BR', 'AE'];

      // Mock fast AI generation
      mockGenerateLabelWithRetry.mockResolvedValue({
        labelData: {
          legalLabel: {
            ingredients: 'test ingredients',
            allergens: 'test allergens',
            nutrition: { energy: { per100g: '100 kcal' } }
          },
          marketing: { short: 'test product' },
          complianceNotes: ['test compliance'],
          warnings: []
        },
        marketSpecificData: {
          certifications: ['test cert'],
          localRegulations: ['test regulation'],
          culturalConsiderations: ['test culture'],
          languageVariant: 'en'
        },
        language: 'en' as const,
        translatedData: undefined
      });

      for (const market of markets) {
        const event: APIGatewayProxyEvent = {
          ...baseEvent,
          body: JSON.stringify({
            name: `Test Product ${market}`,
            market,
            ingredients: ['ingredient1'],
            allergens: [],
            nutrition: { energy: 100 }
          })
        } as APIGatewayProxyEvent;

        const startTime = Date.now();
        const result = await handler(event, mockContext);
        const duration = Date.now() - startTime;

        expect(result.statusCode).toBe(200);
        expect(duration).toBeLessThan(15000);

        const body = JSON.parse(result.body);
        expect(body.data.metadata.meetsTarget).toBe(true);
      }
    });
  });
});