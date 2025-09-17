import { describe, it, expect } from '@jest/globals';
import {
  CrisisTypeSchema,
  CrisisSeveritySchema,
  CrisisScenarioSchema,
  CommunicationMaterialSchema,
  ActionItemSchema,
  CrisisResponseSchema,
  CrisisLogSchema,
} from '../../src/schemas';

describe('Crisis Response Schemas', () => {
  describe('CrisisTypeSchema', () => {
    it('should validate valid crisis types', () => {
      const validTypes = ['contamination', 'allergen', 'packaging', 'regulatory', 'supply-chain'];

      validTypes.forEach(type => {
        expect(() => CrisisTypeSchema.parse(type)).not.toThrow();
      });
    });

    it('should reject invalid crisis types', () => {
      expect(() => CrisisTypeSchema.parse('invalid')).toThrow();
    });
  });

  describe('CrisisSeveritySchema', () => {
    it('should validate valid severity levels', () => {
      const validSeverities = ['low', 'medium', 'high', 'critical'];

      validSeverities.forEach(severity => {
        expect(() => CrisisSeveritySchema.parse(severity)).not.toThrow();
      });
    });

    it('should reject invalid severity levels', () => {
      expect(() => CrisisSeveritySchema.parse('extreme')).toThrow();
    });
  });

  describe('CrisisScenarioSchema', () => {
    it('should validate a complete crisis scenario', () => {
      const scenario = {
        crisisType: 'contamination',
        severity: 'high',
        affectedProducts: ['Product A', 'Product B'],
        affectedMarkets: ['EU', 'ES'],
        description: 'Salmonella contamination detected',
        timeline: 'Immediate action required',
        immediateActions: ['Stop production', 'Issue recall'],
      };

      expect(() => CrisisScenarioSchema.parse(scenario)).not.toThrow();
    });

    it('should validate scenario without optional fields', () => {
      const scenario = {
        crisisType: 'allergen',
        severity: 'medium',
        affectedProducts: ['Product C'],
        affectedMarkets: ['BR'],
        description: 'Undeclared nuts found',
        timeline: '24 hours',
      };

      expect(() => CrisisScenarioSchema.parse(scenario)).not.toThrow();
    });
  });

  describe('CommunicationMaterialSchema', () => {
    it('should validate communication material', () => {
      const material = {
        type: 'press-release',
        market: 'EU',
        language: 'en',
        content: 'We are issuing a voluntary recall...',
        urgency: 'high',
        reviewRequired: true,
      };

      expect(() => CommunicationMaterialSchema.parse(material)).not.toThrow();
    });
  });

  describe('ActionItemSchema', () => {
    it('should validate action item', () => {
      const actionItem = {
        action: 'Contact regulatory authorities',
        priority: 'critical',
        timeframe: 'Within 2 hours',
        responsible: 'Quality Manager',
        completed: false,
      };

      expect(() => ActionItemSchema.parse(actionItem)).not.toThrow();
    });
  });

  describe('CrisisResponseSchema', () => {
    it('should validate complete crisis response', () => {
      const crisisResponse = {
        crisisId: 'crisis-001',
        scenario: {
          crisisType: 'contamination',
          severity: 'high',
          affectedProducts: ['Product A'],
          affectedMarkets: ['EU'],
          description: 'Test contamination',
          timeline: 'Immediate',
        },
        revisedLabels: {
          EU: {
            labelId: 'label-001',
            market: 'EU',
            language: 'en',
            labelData: {
              legalLabel: {
                ingredients: 'Test ingredients',
                allergens: 'None',
                nutrition: {},
              },
              marketing: { short: 'Test product' },
              warnings: ['DO NOT CONSUME - RECALL IN EFFECT'],
              complianceNotes: ['Product recalled due to contamination'],
            },
            marketSpecificData: {
              certifications: [],
              localRegulations: [],
              culturalConsiderations: [],
            },
            createdAt: '2025-09-17T12:00:00Z',
            generatedBy: 'crisis-system',
          },
        },
        communicationMaterials: [{
          type: 'press-release',
          market: 'EU',
          language: 'en',
          content: 'Press release content',
          urgency: 'high',
          reviewRequired: true,
        }],
        actionPlan: [{
          action: 'Issue recall notice',
          priority: 'critical',
          timeframe: 'Immediate',
          completed: false,
        }],
        generatedAt: '2025-09-17T12:00:00Z',
        estimatedImpact: 'High impact on brand reputation',
      };

      expect(() => CrisisResponseSchema.parse(crisisResponse)).not.toThrow();
    });
  });
});