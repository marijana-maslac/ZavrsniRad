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

  category: z.enum([
    "DORUČAK",
    "RUČAK",
    "VEČERA",
    "VEGANSKI",
    "VEGETARIJANSKI",
    "FINGER_FOOD",
    "GLUTEN_FREE",
    "DESERTI",
    "PIĆA",
    "JUHE",
    "RAZNO",
  ]),
  ingredients: z.array(
    z.object({
      name: z.string(),
      amount: z.number().min(0).optional(),
      unit: z
        .enum(["G", "DAG", "KG", "ML", "DL", "L", "KOM", "TBSP", "TSP"])
        .optional(),
    }),
  ),
  steps: z.array(
    z.object({
      description: z.string(),
      image: z.any().optional(),
      removeImage: z.boolean().optional(),
    }),
  ),
  authorId: z.number(),
});
