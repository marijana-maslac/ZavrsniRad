import { z } from "zod";

export const recipeSchema = z.object({
  title: z.string().trim().min(3, "Naslov recepta je obavezan.").max(150),
  description: z
    .string()
    .trim()
    .min(10)
    .max(3000, "Maksimalan broj znakova postignut."),
  image: z.any().optional(),
  difficulty: z.enum(["LAGANO", "SREDNJE", "TEŠKO"]),
  cooking_time: z
    .int("Vrijeme kuhanja mora biti cijeli broj u minutama.")
    .min(1, "Vrijeme kuhanja mora biti barem 1 minuta.")
    .max(1440, "Vrijeme kuhanja je predugo."),
  servings: z
    .int("Broj porcija mora biti cijeli broj")
    .min(1, "Mora biti barem 1 porcija.")
    .max(50, "Previše porcija."),
  categories: z.array(z.number()).min(1, "Odaberi barem jednu kategoriju"),
  ingredients: z.array(
    z.object({
      name: z.string().min(1, "Sastojak je obavezan"),
      amount: z.number().min(0, "Mora biti 0 ili više").optional(),
      unit: z
        .enum(["G", "DAG", "KG", "ML", "DL", "L", "KOM", "TBSP", "TSP"])
        .optional(),
    }),
  ),
  steps: z.array(
    z.object({
      id: z.number().optional(),
      description: z.string().min(1, "Opis koraka je obavezan"),
      image: z.any().optional(),
      removeImage: z.boolean().optional(),
    }),
  ),
  authorId: z.number(),
});
