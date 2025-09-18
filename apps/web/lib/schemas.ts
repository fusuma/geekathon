import { z } from "zod"

export const productInputSchema = z.object({
  name: z.string().min(1, "Product name is required").max(200, "Product name too long"),
  ingredients: z.string().min(1, "Ingredients list is required"),
  market: z.enum(["US", "UK", "ES", "AO", "MO", "BR", "AE"], {
    required_error: "Please select a market",
  }),
  allergens: z.string().optional(),
  // Optional nutrition values
  energy: z.string().optional(),
  fat: z.string().optional(),
  saturatedFat: z.string().optional(),
  carbohydrates: z.string().optional(),
  sugars: z.string().optional(),
  protein: z.string().optional(),
  salt: z.string().optional(),
  fiber: z.string().optional(),
})

export type ProductInputFormData = z.infer<typeof productInputSchema>