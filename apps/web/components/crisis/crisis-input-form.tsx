"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CrisisType, CrisisSeverity, Market } from "@repo/shared";

// Crisis input form schema
const crisisInputSchema = z.object({
  crisisType: z.enum(['contamination', 'allergen', 'packaging', 'regulatory', 'supply-chain']),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  affectedProducts: z.string().min(1, "At least one affected product is required"),
  affectedMarkets: z.array(z.enum(['EU', 'ES', 'AO', 'MO', 'BR'])).min(1, "At least one market must be selected"),
  description: z.string().min(10, "Please provide a detailed description"),
  timeline: z.string().min(1, "Timeline is required"),
  immediateActions: z.string().optional(),
});

export type CrisisInputFormData = z.infer<typeof crisisInputSchema>;

interface CrisisInputFormProps {
  onSubmit: (data: CrisisInputFormData) => void;
  isLoading?: boolean;
}

const crisisTypes: { value: CrisisType; label: string; description: string }[] = [
  { value: 'contamination', label: 'Contamination', description: 'Bacterial, chemical, or foreign object contamination' },
  { value: 'allergen', label: 'Allergen Issue', description: 'Undeclared allergens or cross-contamination' },
  { value: 'packaging', label: 'Packaging Problem', description: 'Incorrect labels or missing warnings' },
  { value: 'regulatory', label: 'Regulatory Change', description: 'New restrictions or banned ingredients' },
  { value: 'supply-chain', label: 'Supply Chain Issue', description: 'Supplier quality problems or ingredient source issues' },
];

const severityLevels: { value: CrisisSeverity; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: 'bg-green-600' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-600' },
  { value: 'high', label: 'High', color: 'bg-orange-600' },
  { value: 'critical', label: 'Critical', color: 'bg-red-600' },
];

const markets: { value: Market; label: string }[] = [
  { value: 'EU', label: 'European Union' },
  { value: 'ES', label: 'Spain' },
  { value: 'AO', label: 'Angola' },
  { value: 'MO', label: 'Macau' },
  { value: 'BR', label: 'Brazil' },
];

export function CrisisInputForm({ onSubmit, isLoading = false }: CrisisInputFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<CrisisInputFormData>({
    resolver: zodResolver(crisisInputSchema),
    defaultValues: {
      affectedMarkets: ['EU'],
      severity: 'medium',
      crisisType: 'contamination',
    },
  });

  const selectedMarkets = watch('affectedMarkets') || [];
  const selectedSeverity = watch('severity');

  const handleMarketToggle = (market: Market) => {
    const currentMarkets = selectedMarkets;
    const updatedMarkets = currentMarkets.includes(market)
      ? currentMarkets.filter(m => m !== market)
      : [...currentMarkets, market];

    setValue('affectedMarkets', updatedMarkets);
  };

  const handleFormSubmit = (data: CrisisInputFormData) => {
    onSubmit(data);
  };

  const handleReset = () => {
    reset();
  };

  return (
    <div className="bg-red-950/20 border-2 border-red-600/30 rounded-lg p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="bg-red-600 p-2 rounded-lg">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-red-400">Crisis Simulator</h2>
          <p className="text-red-300">Generate complete crisis response package instantly</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Crisis Type Selection */}
        <div className="space-y-3">
          <Label className="text-lg font-semibold text-red-300">Crisis Type *</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {crisisTypes.map((type) => (
              <label key={type.value} className="cursor-pointer">
                <input
                  type="radio"
                  {...register('crisisType')}
                  value={type.value}
                  className="sr-only"
                  disabled={isLoading}
                />
                <div className="p-4 border border-red-600/30 rounded-lg hover:border-red-500/50 has-[:checked]:border-red-400 has-[:checked]:bg-red-950/30 transition-colors">
                  <div className="font-semibold text-red-300">{type.label}</div>
                  <div className="text-sm text-red-400/80 mt-1">{type.description}</div>
                </div>
              </label>
            ))}
          </div>
          {errors.crisisType && (
            <p className="text-sm text-red-400">{errors.crisisType.message}</p>
          )}
        </div>

        {/* Severity Level */}
        <div className="space-y-3">
          <Label className="text-lg font-semibold text-red-300">Severity Level *</Label>
          <div className="flex gap-3">
            {severityLevels.map((severity) => (
              <label key={severity.value} className="cursor-pointer">
                <input
                  type="radio"
                  {...register('severity')}
                  value={severity.value}
                  className="sr-only"
                  disabled={isLoading}
                />
                <Badge
                  className={`px-4 py-2 text-white border-2 transition-all has-[:checked]:ring-2 has-[:checked]:ring-white ${
                    selectedSeverity === severity.value ? severity.color : 'bg-gray-600 hover:bg-gray-500'
                  }`}
                >
                  {severity.label}
                </Badge>
              </label>
            ))}
          </div>
          {errors.severity && (
            <p className="text-sm text-red-400">{errors.severity.message}</p>
          )}
        </div>

        {/* Affected Products */}
        <div>
          <Label htmlFor="affectedProducts" className="text-lg font-semibold text-red-300">Affected Products *</Label>
          <Input
            id="affectedProducts"
            {...register("affectedProducts")}
            placeholder="e.g., Premium Granola Mix, Organic Oat Bars"
            disabled={isLoading}
            className="mt-2 bg-red-950/20 border-red-600/30 text-red-100 placeholder:text-red-400/60"
          />
          {errors.affectedProducts && (
            <p className="text-sm text-red-400 mt-1">{errors.affectedProducts.message}</p>
          )}
        </div>

        {/* Affected Markets */}
        <div className="space-y-3">
          <Label className="text-lg font-semibold text-red-300">Affected Markets *</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {markets.map((market) => (
              <button
                key={market.value}
                type="button"
                onClick={() => handleMarketToggle(market.value)}
                disabled={isLoading}
                className={`p-3 border rounded-lg transition-colors ${
                  selectedMarkets.includes(market.value)
                    ? 'bg-red-600 border-red-500 text-white'
                    : 'bg-red-950/20 border-red-600/30 text-red-300 hover:border-red-500/50'
                }`}
              >
                <div className="font-semibold">{market.value}</div>
                <div className="text-xs">{market.label}</div>
              </button>
            ))}
          </div>
          {errors.affectedMarkets && (
            <p className="text-sm text-red-400">{errors.affectedMarkets.message}</p>
          )}
        </div>

        {/* Crisis Description */}
        <div>
          <Label htmlFor="description" className="text-lg font-semibold text-red-300">Crisis Description *</Label>
          <Textarea
            id="description"
            {...register("description")}
            placeholder="Provide detailed description of the crisis situation, what happened, when it was discovered, and potential impact..."
            rows={4}
            disabled={isLoading}
            className="mt-2 bg-red-950/20 border-red-600/30 text-red-100 placeholder:text-red-400/60"
          />
          {errors.description && (
            <p className="text-sm text-red-400 mt-1">{errors.description.message}</p>
          )}
        </div>

        {/* Timeline */}
        <div>
          <Label htmlFor="timeline" className="text-lg font-semibold text-red-300">Timeline *</Label>
          <Input
            id="timeline"
            {...register("timeline")}
            placeholder="e.g., Discovered today at 2 PM, affects production since yesterday"
            disabled={isLoading}
            className="mt-2 bg-red-950/20 border-red-600/30 text-red-100 placeholder:text-red-400/60"
          />
          {errors.timeline && (
            <p className="text-sm text-red-400 mt-1">{errors.timeline.message}</p>
          )}
        </div>

        {/* Immediate Actions */}
        <div>
          <Label htmlFor="immediateActions" className="text-lg font-semibold text-red-300">Immediate Actions Taken (Optional)</Label>
          <Textarea
            id="immediateActions"
            {...register("immediateActions")}
            placeholder="List any immediate actions already taken, such as production halt, product isolation, notifications sent..."
            rows={3}
            disabled={isLoading}
            className="mt-2 bg-red-950/20 border-red-600/30 text-red-100 placeholder:text-red-400/60"
          />
        </div>

        <div className="flex gap-4 pt-6 border-t border-red-600/30">
          <Button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3"
          >
            {isLoading ? "Generating Crisis Response..." : "🚨 Generate Crisis Response"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={isLoading}
            className="border-red-600/30 text-red-300 hover:bg-red-950/30"
          >
            Reset
          </Button>
        </div>
      </form>
    </div>
  );
}