import { render, screen, waitFor } from '@testing-library/react';
import { CrisisGenerationTrace } from '../../crisis/crisis-generation-trace';

// Mock the Progress component
jest.mock('@/components/ui/progress', () => ({
  Progress: ({ value, className, style }: { value: number; className: string; style: any }) => (
    <div className={className} style={style} data-testid="progress-bar" data-value={value} />
  ),
}));

describe('CrisisGenerationTrace', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders crisis generation trace with initial state', () => {
    render(<CrisisGenerationTrace />);

    // Check header
    expect(screen.getByText('Generating Crisis Response')).toBeInTheDocument();
    expect(screen.getByText('Processing 0/6 steps')).toBeInTheDocument();

    // Check timer
    expect(screen.getByText('0.0s')).toBeInTheDocument();
    expect(screen.getByText('< 10s')).toBeInTheDocument();

    // Check all steps are present
    expect(screen.getByText('🔍 Crisis Assessment')).toBeInTheDocument();
    expect(screen.getByText('🏷️ Revised Labels')).toBeInTheDocument();
    expect(screen.getByText('📢 Crisis Communications')).toBeInTheDocument();
    expect(screen.getByText('📋 Regulatory Notices')).toBeInTheDocument();
    expect(screen.getByText('✅ Action Plan')).toBeInTheDocument();
    expect(screen.getByText('🔒 Final Validation')).toBeInTheDocument();

    // Check progress bar
    const progressBar = screen.getByTestId('progress-bar');
    expect(progressBar).toHaveAttribute('data-value', '0');
  });

  it('shows step progression over time', async () => {
    render(<CrisisGenerationTrace />);

    // Initially, first step should be pending
    const firstStep = screen.getByText('🔍 Crisis Assessment').closest('div');
    expect(firstStep?.querySelector('.bg-gray-600')).toBeInTheDocument();

    // Fast-forward time to trigger first step
    jest.advanceTimersByTime(300);

    await waitFor(() => {
      // First step should now be in progress
      const firstStepProgress = screen.getByText('🔍 Crisis Assessment').closest('div');
      expect(firstStepProgress?.querySelector('.bg-red-600')).toBeInTheDocument();
      expect(firstStepProgress?.querySelector('.animate-pulse')).toBeInTheDocument();
    });

    // Fast-forward to complete first step
    jest.advanceTimersByTime(1000);

    await waitFor(() => {
      // First step should be completed
      const completedStep = screen.getByText('🔍 Crisis Assessment').closest('div');
      expect(completedStep?.querySelector('.bg-green-600')).toBeInTheDocument();
      expect(screen.getByText('Processing 1/6 steps')).toBeInTheDocument();
    });
  });

  it('updates elapsed time counter', async () => {
    render(<CrisisGenerationTrace />);

    // Initial time
    expect(screen.getByText('0.0s')).toBeInTheDocument();

    // Advance time by 1 second (10 intervals of 100ms)
    jest.advanceTimersByTime(1000);

    await waitFor(() => {
      expect(screen.getByText('1.0s')).toBeInTheDocument();
    });

    // Advance more time
    jest.advanceTimersByTime(2500);

    await waitFor(() => {
      expect(screen.getByText('3.5s')).toBeInTheDocument();
    });
  });

  it('shows urgency indicator when time exceeds threshold', async () => {
    render(<CrisisGenerationTrace />);

    // Initially no urgency indicator
    expect(screen.queryByText('URGENT')).not.toBeInTheDocument();

    // Fast-forward past 8 seconds (urgency threshold)
    jest.advanceTimersByTime(8500);

    await waitFor(() => {
      expect(screen.getByText('URGENT')).toBeInTheDocument();
      const urgentIndicator = screen.getByText('URGENT').closest('div');
      expect(urgentIndicator).toHaveClass('animate-pulse');
    });
  });

  it('shows time color changes based on progress', async () => {
    render(<CrisisGenerationTrace />);

    // Initially should be green (within target)
    let timeDisplay = screen.getByText('0.0s');
    expect(timeDisplay).toHaveClass('text-green-400');

    // Fast-forward to 60% of target (6 seconds)
    jest.advanceTimersByTime(6000);

    await waitFor(() => {
      timeDisplay = screen.getByText('6.0s');
      expect(timeDisplay).toHaveClass('text-yellow-400');
    });

    // Fast-forward to 80% of target (8 seconds)
    jest.advanceTimersByTime(2000);

    await waitFor(() => {
      timeDisplay = screen.getByText('8.0s');
      expect(timeDisplay).toHaveClass('text-red-400');
    });
  });

  it('shows crisis mode messaging', () => {
    render(<CrisisGenerationTrace />);

    expect(screen.getByText('Crisis Mode Active')).toBeInTheDocument();
    expect(screen.getByText(/High-priority processing enabled/)).toBeInTheDocument();
    expect(screen.getByText(/All materials will be generated within 10 seconds/)).toBeInTheDocument();
  });

  it('displays performance indicators', () => {
    render(<CrisisGenerationTrace />);

    // Check performance indicator labels
    expect(screen.getByText('Steps Complete')).toBeInTheDocument();
    expect(screen.getByText('Time Remaining')).toBeInTheDocument();
    expect(screen.getByText('Priority')).toBeInTheDocument();
    expect(screen.getByText('AI')).toBeInTheDocument();

    // Check initial values
    expect(screen.getByText('0')).toBeInTheDocument(); // Steps complete
    expect(screen.getByText('HIGH')).toBeInTheDocument(); // Priority
    expect(screen.getByText('AI')).toBeInTheDocument(); // AI powered
  });

  it('shows urgency indicators on urgent steps', () => {
    render(<CrisisGenerationTrace />);

    // Check that urgent steps have pulse indicators
    const crisisAssessment = screen.getByText('Analyzing crisis type, severity, and scope').closest('div');
    const revisedLabels = screen.getByText('Generating updated product labels with warnings').closest('div');
    const regulatoryNotices = screen.getByText('Preparing authority notifications and compliance docs').closest('div');
    const finalValidation = screen.getByText('Ensuring all materials meet crisis response standards').closest('div');

    // These steps should have urgency indicators (red pulse dots)
    expect(crisisAssessment?.querySelector('.animate-pulse')).toBeInTheDocument();
    expect(revisedLabels?.querySelector('.animate-pulse')).toBeInTheDocument();
    expect(regulatoryNotices?.querySelector('.animate-pulse')).toBeInTheDocument();
    expect(finalValidation?.querySelector('.animate-pulse')).toBeInTheDocument();

    // Non-urgent steps shouldn't have the urgency indicator in their description area
    const communications = screen.getByText('Creating press releases and customer notifications').closest('div');
    const actionPlan = screen.getByText('Developing crisis response action items and timeline').closest('div');

    // Check that communications and action plan don't have urgency markers in their titles
    expect(communications?.querySelector('h3')?.nextSibling?.textContent).not.toBe('🔴');
    expect(actionPlan?.querySelector('h3')?.nextSibling?.textContent).not.toBe('🔴');
  });

  it('shows progress bar updates', async () => {
    render(<CrisisGenerationTrace />);

    const progressBar = screen.getByTestId('progress-bar');
    expect(progressBar).toHaveAttribute('data-value', '0');

    // Complete first step
    jest.advanceTimersByTime(1300);

    await waitFor(() => {
      // Progress should be updated (100/6 = ~16.67%)
      const updatedProgressBar = screen.getByTestId('progress-bar');
      expect(parseInt(updatedProgressBar.getAttribute('data-value') || '0')).toBeGreaterThan(15);
    });
  });

  it('applies urgent styling throughout the component', () => {
    render(<CrisisGenerationTrace />);

    // Check for red/urgent theme
    const container = screen.getByText('Generating Crisis Response').closest('div');
    expect(container).toHaveClass('bg-red-950/20', 'border-red-600/30');

    // Check header background
    const header = screen.getByText('Generating Crisis Response').closest('.bg-red-900\\/40');
    expect(header).toBeInTheDocument();

    // Check urgent messaging container
    const crisisModeContainer = screen.getByText('Crisis Mode Active').closest('div');
    expect(crisisModeContainer).toHaveClass('bg-red-950/40', 'border-red-600/30');
  });
});