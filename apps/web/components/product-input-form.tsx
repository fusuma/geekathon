"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { productInputSchema, type ProductInputFormData } from "@/lib/schemas"

interface ProductInputFormProps {
  onSubmit: (data: ProductInputFormData) => void
  isLoading?: boolean
}

export function ProductInputForm({ onSubmit, isLoading = false }: ProductInputFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProductInputFormData>({
    resolver: zodResolver(productInputSchema),
    defaultValues: {
      market: "UK",
    },
  })

  const handleFormSubmit = (data: ProductInputFormData) => {
    onSubmit(data)
  }

  const handleReset = () => {
    reset()
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Product Name *</Label>
          <Input
            id="name"
            {...register("name")}
            placeholder="Enter product name"
            disabled={isLoading}
          />
          {errors.name && (
            <p className="text-sm text-red-400 mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="ingredients">Ingredients *</Label>
          <Textarea
            id="ingredients"
            {...register("ingredients")}
            placeholder="List all ingredients (e.g., Wheat flour, sugar, vegetable oil, salt)"
            rows={3}
            disabled={isLoading}
          />
          {errors.ingredients && (
            <p className="text-sm text-red-400 mt-1">{errors.ingredients.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="market">Target Market *</Label>
          <select
            id="market"
            {...register("market")}
            disabled={isLoading}
            className="flex h-10 w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="EU">European Union (EU)</option>
            <option value="ES">Spain (ES)</option>
          </select>
          {errors.market && (
            <p className="text-sm text-red-400 mt-1">{errors.market.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="allergens">Known Allergens (Optional)</Label>
          <Input
            id="allergens"
            {...register("allergens")}
            placeholder="e.g., Contains gluten, may contain nuts"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Nutrition Information (Optional) */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-100">
          Nutrition Information (Optional)
        </h3>
        <p className="text-sm text-gray-300">
          Provide nutrition values per 100g if available. Leave blank for AI estimation.
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="energy">Energy (kcal/100g)</Label>
            <Input
              id="energy"
              {...register("energy")}
              placeholder="e.g., 450"
              type="number"
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="fat">Fat (g/100g)</Label>
            <Input
              id="fat"
              {...register("fat")}
              placeholder="e.g., 15.2"
              type="number"
              step="0.1"
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="saturatedFat">Saturated Fat (g/100g)</Label>
            <Input
              id="saturatedFat"
              {...register("saturatedFat")}
              placeholder="e.g., 5.8"
              type="number"
              step="0.1"
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="carbohydrates">Carbohydrates (g/100g)</Label>
            <Input
              id="carbohydrates"
              {...register("carbohydrates")}
              placeholder="e.g., 65.4"
              type="number"
              step="0.1"
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="sugars">Sugars (g/100g)</Label>
            <Input
              id="sugars"
              {...register("sugars")}
              placeholder="e.g., 8.2"
              type="number"
              step="0.1"
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="protein">Protein (g/100g)</Label>
            <Input
              id="protein"
              {...register("protein")}
              placeholder="e.g., 12.5"
              type="number"
              step="0.1"
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="salt">Salt (g/100g)</Label>
            <Input
              id="salt"
              {...register("salt")}
              placeholder="e.g., 1.2"
              type="number"
              step="0.1"
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="fiber">Fiber (g/100g)</Label>
            <Input
              id="fiber"
              {...register("fiber")}
              placeholder="e.g., 3.1"
              type="number"
              step="0.1"
              disabled={isLoading}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-4 pt-4 border-t">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? "Generating Label..." : "Generate Smart Label"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleReset}
          disabled={isLoading}
        >
          Reset Form
        </Button>
      </div>
    </form>
  )
}