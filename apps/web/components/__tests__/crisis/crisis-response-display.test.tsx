import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CrisisResponse } from '@repo/shared';
import { CrisisResponseDisplay } from '../../crisis/crisis-response-display';

// Mock the LabelDisplay component
jest.mock('../../label-display', () => ({
  LabelDisplay: ({ label, onGenerateNew, showActions }: any) => (
    <div data-testid="label-display">
      <span>Label for {label.market}</span>
      {showActions && <button onClick={onGenerateNew}>Generate New</button>}
    </div>
  ),
}));

const mockCrisisResponse: CrisisResponse = {
  crisisId: 'crisis_test_123',
  scenario: {
    crisisType: 'contamination',
    severity: 'critical',
    affectedProducts: ['Premium Granola Mix', 'Organic Oat Bars'],
    affectedMarkets: ['EU', 'ES'],
    description: 'Salmonella contamination detected in production facility',
    timeline: 'Discovered at 2 PM today',
    immediateActions: ['Production halted', 'Quality team notified']
  },
  revisedLabels: {
    EU: {
      labelId: 'label_eu_123',
      market: 'EU',
      language: 'en',
      labelData: {
        legalLabel: {
          ingredients: 'Updated ingredients with warnings',
          allergens: 'Contains allergens - check contamination',
          nutrition: {}
        },
        marketing: { short: 'Crisis Updated Product' },
        warnings: ['PRODUCT RECALL NOTICE'],
        complianceNotes: ['Crisis response generated']
      },
      marketSpecificData: {
        certifications: [],
        localRegulations: ['EU emergency protocols'],
        culturalConsiderations: []
      },
      createdAt: '2024-01-15T14:00:00Z',
      generatedBy: 'Crisis Response System'
    },
    ES: {
      labelId: 'label_es_123',
      market: 'ES',
      language: 'en',
      labelData: {
        legalLabel: {
          ingredients: 'Updated ingredients with warnings',
          allergens: 'Contains allergens - check contamination',
          nutrition: {}
        },
        marketing: { short: 'Crisis Updated Product' },
        warnings: ['PRODUCT RECALL NOTICE'],
        complianceNotes: ['Crisis response generated']
      },
      marketSpecificData: {
        certifications: [],
        localRegulations: ['ES emergency protocols'],
        culturalConsiderations: []
      },
      createdAt: '2024-01-15T14:00:00Z',
      generatedBy: 'Crisis Response System'
    }
  },
  communicationMaterials: [
    {
      type: 'press-release',
      market: 'EU',
      language: 'en',
      content: 'IMMEDIATE PRESS RELEASE - CONTAMINATION CRISIS\n\nWe are addressing a critical contamination issue...',
      urgency: 'critical',
      reviewRequired: true
    },
    {
      type: 'customer-email',
      market: 'EU',
      language: 'en',
      content: 'Subject: URGENT Product Safety Notice\n\nDear Customer, we are writing to inform you...',
      urgency: 'critical',
      reviewRequired: false
    },
    {
      type: 'regulatory-notice',
      market: 'EU',
      language: 'en',
      content: 'REGULATORY NOTIFICATION\n\nTO: Food Safety Authorities\nRE: Contamination Crisis...',
      urgency: 'critical',
      reviewRequired: true
    }
  ],
  actionPlan: [
    {
      action: 'Halt production of affected products immediately',
      priority: 'critical',
      timeframe: 'Immediate (0-1 hour)',
      responsible: 'Production Manager',
      completed: true
    },
    {
      action: 'Contact regulatory authorities',
      priority: 'critical',
      timeframe: 'Immediate (1-2 hours)',
      responsible: 'Regulatory Affairs',
      completed: false
    }
  ],
  generatedAt: '2024-01-15T14:00:00Z',
  estimatedImpact: 'CRITICAL impact expected across 2 markets'
};

const mockOnGenerateNew = jest.fn();

describe('CrisisResponseDisplay', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders crisis response overview with all key information', () => {
    render(<CrisisResponseDisplay response={mockCrisisResponse} onGenerateNew={mockOnGenerateNew} />);

    // Check header information
    expect(screen.getByText('Crisis Response Generated')).toBeInTheDocument();
    expect(screen.getByText('CRITICAL')).toBeInTheDocument();
    expect(screen.getByText('Contamination Crisis')).toBeInTheDocument();
    expect(screen.getByText('2 Markets')).toBeInTheDocument();

    // Check tabs
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Revised Labels')).toBeInTheDocument();
    expect(screen.getByText('Communications')).toBeInTheDocument();
    expect(screen.getByText('Action Plan')).toBeInTheDocument();
  });

  it('displays urgent styling for critical/high severity crises', () => {
    render(<CrisisResponseDisplay response={mockCrisisResponse} onGenerateNew={mockOnGenerateNew} isUrgent={true} />);

    // Check for urgent theme
    const container = screen.getByText('Crisis Response Generated').closest('div');
    expect(container).toHaveClass('bg-red-950/30', 'border-red-600/50');

    // Check for urgent indicator
    expect(screen.getByText('URGENT RESPONSE')).toBeInTheDocument();
    const urgentIndicator = screen.getByText('URGENT RESPONSE').closest('div');
    expect(urgentIndicator).toHaveClass('animate-pulse');
  });

  it('shows overview tab content by default', () => {
    render(<CrisisResponseDisplay response={mockCrisisResponse} onGenerateNew={mockOnGenerateNew} />);

    // Overview content should be visible
    expect(screen.getByText('Crisis Details')).toBeInTheDocument();
    expect(screen.getByText('Affected Scope')).toBeInTheDocument();
    expect(screen.getByText('Action Status')).toBeInTheDocument();

    // Check crisis details
    expect(screen.getByText('contamination')).toBeInTheDocument();
    expect(screen.getByText('EU, ES')).toBeInTheDocument();

    // Check crisis description
    expect(screen.getByText('Salmonella contamination detected in production facility')).toBeInTheDocument();

    // Check estimated impact
    expect(screen.getByText('CRITICAL impact expected across 2 markets')).toBeInTheDocument();
  });

  it('allows switching between tabs', async () => {
    const user = userEvent.setup();
    render(<CrisisResponseDisplay response={mockCrisisResponse} onGenerateNew={mockOnGenerateNew} />);

    // Click on Labels tab
    const labelsTab = screen.getByText('Revised Labels');
    await user.click(labelsTab);

    // Should show labels content
    expect(screen.getByText('Revised Product Labels')).toBeInTheDocument();
    expect(screen.getByText('Updated with Warnings')).toBeInTheDocument();
    expect(screen.getByText('Market: EU')).toBeInTheDocument();
    expect(screen.getByText('Market: ES')).toBeInTheDocument();

    // Click on Communications tab
    const communicationsTab = screen.getByText('Communications');
    await user.click(communicationsTab);

    // Should show communications content
    expect(screen.getByText('Communication Materials')).toBeInTheDocument();
    expect(screen.getByText('3 Templates Generated')).toBeInTheDocument();
  });

  it('shows communication materials with expandable content', async () => {
    const user = userEvent.setup();
    render(<CrisisResponseDisplay response={mockCrisisResponse} onGenerateNew={mockOnGenerateNew} />);

    // Switch to Communications tab
    const communicationsTab = screen.getByText('Communications');
    await user.click(communicationsTab);

    // Should show material types
    expect(screen.getByText('Press Release')).toBeInTheDocument();
    expect(screen.getByText('Customer Email')).toBeInTheDocument();
    expect(screen.getByText('Regulatory Notice')).toBeInTheDocument();

    // Click to expand press release
    const pressReleaseCard = screen.getByText('Press Release').closest('button');
    await user.click(pressReleaseCard!);

    // Should show expanded content
    await waitFor(() => {
      expect(screen.getByText(/IMMEDIATE PRESS RELEASE/)).toBeInTheDocument();
    });

    // Should show action buttons
    expect(screen.getByText('📋 Copy')).toBeInTheDocument();
    expect(screen.getByText('📥 Download')).toBeInTheDocument();
    expect(screen.getByText('🔍 Send for Review')).toBeInTheDocument();
  });

  it('shows action plan with completion status', async () => {
    const user = userEvent.setup();
    render(<CrisisResponseDisplay response={mockCrisisResponse} onGenerateNew={mockOnGenerateNew} />);

    // Switch to Actions tab
    const actionsTab = screen.getByText('Action Plan');
    await user.click(actionsTab);

    // Should show action plan content
    expect(screen.getByText('Crisis Action Plan')).toBeInTheDocument();
    expect(screen.getByText('1 Completed')).toBeInTheDocument();
    expect(screen.getByText('1 Pending')).toBeInTheDocument();

    // Should show individual actions
    expect(screen.getByText('Halt production of affected products immediately')).toBeInTheDocument();
    expect(screen.getByText('Contact regulatory authorities')).toBeInTheDocument();

    // Check completion status
    const completedAction = screen.getByText('Halt production of affected products immediately').closest('div');
    expect(completedAction).toHaveClass('bg-green-950/20');

    const pendingAction = screen.getByText('Contact regulatory authorities').closest('div');
    expect(pendingAction).toHaveClass('bg-gray-700/30');
  });

  it('shows correct severity badges and colors', () => {
    render(<CrisisResponseDisplay response={mockCrisisResponse} onGenerateNew={mockOnGenerateNew} />);

    // Check critical severity badge
    const severityBadge = screen.getByText('CRITICAL');
    expect(severityBadge).toHaveClass('bg-red-600');
  });

  it('calls onGenerateNew when generate new button is clicked', async () => {
    const user = userEvent.setup();
    render(<CrisisResponseDisplay response={mockCrisisResponse} onGenerateNew={mockOnGenerateNew} />);

    // Find and click the "Generate New Crisis Response" button
    const generateNewButton = screen.getByText('🔄 Generate New Crisis Response');
    await user.click(generateNewButton);

    expect(mockOnGenerateNew).toHaveBeenCalledTimes(1);
  });

  it('shows export and share buttons in footer', () => {
    render(<CrisisResponseDisplay response={mockCrisisResponse} onGenerateNew={mockOnGenerateNew} />);

    // Check footer action buttons
    expect(screen.getByText('🔄 Generate New Crisis Response')).toBeInTheDocument();
    expect(screen.getByText('📤 Export Complete Package')).toBeInTheDocument();
    expect(screen.getByText('👥 Share with Team')).toBeInTheDocument();
  });

  it('shows review required indicators for materials that need review', async () => {
    const user = userEvent.setup();
    render(<CrisisResponseDisplay response={mockCrisisResponse} onGenerateNew={mockOnGenerateNew} />);

    // Switch to Communications tab
    const communicationsTab = screen.getByText('Communications');
    await user.click(communicationsTab);

    // Should show review required badges
    const reviewBadges = screen.getAllByText('Review Required');
    expect(reviewBadges.length).toBeGreaterThan(0);

    // Press release should have review required
    const pressReleaseCard = screen.getByText('Press Release').closest('.cursor-pointer');
    expect(pressReleaseCard).toContainElement(screen.getByText('Review Required'));
  });

  it('displays market and language information for communications', async () => {
    const user = userEvent.setup();
    render(<CrisisResponseDisplay response={mockCrisisResponse} onGenerateNew={mockOnGenerateNew} />);

    // Switch to Communications tab
    const communicationsTab = screen.getByText('Communications');
    await user.click(communicationsTab);

    // Should show market and language info
    expect(screen.getByText('Market: EU')).toBeInTheDocument();
    expect(screen.getByText('Language: en')).toBeInTheDocument();
  });

  it('shows time and responsible person for action items', async () => {
    const user = userEvent.setup();
    render(<CrisisResponseDisplay response={mockCrisisResponse} onGenerateNew={mockOnGenerateNew} />);

    // Switch to Actions tab
    const actionsTab = screen.getByText('Action Plan');
    await user.click(actionsTab);

    // Should show timeframe and responsible person
    expect(screen.getByText('⏱️ Immediate (0-1 hour)')).toBeInTheDocument();
    expect(screen.getByText('👤 Production Manager')).toBeInTheDocument();
    expect(screen.getByText('👤 Regulatory Affairs')).toBeInTheDocument();
  });
});