import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CrisisInputForm } from '../../crisis/crisis-input-form';

// Mock the form submission
const mockOnSubmit = jest.fn();

describe('CrisisInputForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders crisis input form with all required fields', () => {
    render(<CrisisInputForm onSubmit={mockOnSubmit} />);

    // Check for form title
    expect(screen.getByText('Crisis Simulator')).toBeInTheDocument();
    expect(screen.getByText('Generate complete crisis response package instantly')).toBeInTheDocument();

    // Check for crisis type options
    expect(screen.getByText('Contamination')).toBeInTheDocument();
    expect(screen.getByText('Allergen Issue')).toBeInTheDocument();
    expect(screen.getByText('Packaging Problem')).toBeInTheDocument();
    expect(screen.getByText('Regulatory Change')).toBeInTheDocument();
    expect(screen.getByText('Supply Chain Issue')).toBeInTheDocument();

    // Check for severity levels
    expect(screen.getByText('Low')).toBeInTheDocument();
    expect(screen.getByText('Medium')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
    expect(screen.getByText('Critical')).toBeInTheDocument();

    // Check for required fields
    expect(screen.getByLabelText(/affected products/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/crisis description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/timeline/i)).toBeInTheDocument();

    // Check for market selection
    expect(screen.getByText('EU')).toBeInTheDocument();
    expect(screen.getByText('ES')).toBeInTheDocument();
    expect(screen.getByText('AO')).toBeInTheDocument();
    expect(screen.getByText('MO')).toBeInTheDocument();
    expect(screen.getByText('BR')).toBeInTheDocument();

    // Check submit button
    expect(screen.getByText('🚨 Generate Crisis Response')).toBeInTheDocument();
  });

  it('shows validation errors for required fields when submitted empty', async () => {
    render(<CrisisInputForm onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByText('🚨 Generate Crisis Response');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('At least one affected product is required')).toBeInTheDocument();
      expect(screen.getByText('Please provide a detailed description')).toBeInTheDocument();
      expect(screen.getByText('Timeline is required')).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('allows selecting crisis type and severity', async () => {
    const user = userEvent.setup();
    render(<CrisisInputForm onSubmit={mockOnSubmit} />);

    // Select allergen crisis type
    const allergenOption = screen.getByLabelText(/allergen issue/i);
    await user.click(allergenOption);

    // Select high severity
    const highSeverityOption = screen.getByLabelText(/high/i);
    await user.click(highSeverityOption);

    expect(allergenOption).toBeChecked();
    expect(highSeverityOption).toBeChecked();
  });

  it('allows multiple market selection', async () => {
    const user = userEvent.setup();
    render(<CrisisInputForm onSubmit={mockOnSubmit} />);

    // EU should be selected by default
    const euButton = screen.getByText('EU').closest('button');
    expect(euButton).toHaveClass('bg-red-600');

    // Select additional markets
    const esButton = screen.getByText('ES').closest('button');
    const brButton = screen.getByText('BR').closest('button');

    await user.click(esButton!);
    await user.click(brButton!);

    expect(esButton).toHaveClass('bg-red-600');
    expect(brButton).toHaveClass('bg-red-600');

    // Deselect EU
    await user.click(euButton!);
    expect(euButton).not.toHaveClass('bg-red-600');
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    render(<CrisisInputForm onSubmit={mockOnSubmit} />);

    // Fill in required fields
    const affectedProductsInput = screen.getByLabelText(/affected products/i);
    const descriptionInput = screen.getByLabelText(/crisis description/i);
    const timelineInput = screen.getByLabelText(/timeline/i);

    await user.type(affectedProductsInput, 'Premium Granola Mix, Organic Oat Bars');
    await user.type(descriptionInput, 'Salmonella contamination detected in production facility batch 2024-01-15. Potential contamination of all products produced on that day.');
    await user.type(timelineInput, 'Discovered at 2 PM today, affects products shipped since yesterday');

    // Select contamination crisis type (default should be selected)
    // Select critical severity
    const criticalSeverityOption = screen.getByLabelText(/critical/i);
    await user.click(criticalSeverityOption);

    // Submit form
    const submitButton = screen.getByText('🚨 Generate Crisis Response');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        crisisType: 'contamination',
        severity: 'critical',
        affectedProducts: 'Premium Granola Mix, Organic Oat Bars',
        affectedMarkets: ['EU'], // Default selection
        description: 'Salmonella contamination detected in production facility batch 2024-01-15. Potential contamination of all products produced on that day.',
        timeline: 'Discovered at 2 PM today, affects products shipped since yesterday',
      });
    });
  });

  it('includes immediate actions when provided', async () => {
    const user = userEvent.setup();
    render(<CrisisInputForm onSubmit={mockOnSubmit} />);

    // Fill in all fields including optional immediate actions
    await user.type(screen.getByLabelText(/affected products/i), 'Test Product');
    await user.type(screen.getByLabelText(/crisis description/i), 'Test crisis description for testing purposes');
    await user.type(screen.getByLabelText(/timeline/i), 'Test timeline');
    await user.type(screen.getByLabelText(/immediate actions/i), 'Production halted, quality team notified, samples isolated');

    const submitButton = screen.getByText('🚨 Generate Crisis Response');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          immediateActions: 'Production halted, quality team notified, samples isolated',
        })
      );
    });
  });

  it('prevents form submission when loading', () => {
    render(<CrisisInputForm onSubmit={mockOnSubmit} isLoading={true} />);

    const submitButton = screen.getByText('Generating Crisis Response...');
    expect(submitButton).toBeDisabled();

    const resetButton = screen.getByText('Reset');
    expect(resetButton).toBeDisabled();

    // Input fields should be disabled
    const affectedProductsInput = screen.getByLabelText(/affected products/i);
    expect(affectedProductsInput).toBeDisabled();
  });

  it('resets form when reset button is clicked', async () => {
    const user = userEvent.setup();
    render(<CrisisInputForm onSubmit={mockOnSubmit} />);

    // Fill some fields
    const affectedProductsInput = screen.getByLabelText(/affected products/i);
    await user.type(affectedProductsInput, 'Test Product');

    const descriptionInput = screen.getByLabelText(/crisis description/i);
    await user.type(descriptionInput, 'Test description');

    // Verify fields are filled
    expect(affectedProductsInput).toHaveValue('Test Product');
    expect(descriptionInput).toHaveValue('Test description');

    // Click reset
    const resetButton = screen.getByText('Reset');
    await user.click(resetButton);

    // Fields should be cleared
    expect(affectedProductsInput).toHaveValue('');
    expect(descriptionInput).toHaveValue('');
  });

  it('displays crisis urgency styling and indicators', () => {
    render(<CrisisInputForm onSubmit={mockOnSubmit} />);

    // Check for red/urgent theme
    const formContainer = screen.getByText('Crisis Simulator').closest('div');
    expect(formContainer).toHaveClass('bg-red-950/20', 'border-red-600/30');

    // Check for emergency icon
    const emergencyIcon = screen.getByText('Crisis Simulator').previousElementSibling;
    expect(emergencyIcon).toHaveClass('bg-red-600');

    // Check submit button styling
    const submitButton = screen.getByText('🚨 Generate Crisis Response');
    expect(submitButton).toHaveClass('bg-red-600');
  });
});