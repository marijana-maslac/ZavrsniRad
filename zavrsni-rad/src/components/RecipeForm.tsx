"use client";
import { useEffect, useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Category, Prisma } from "@/generated/prisma/client";
import axios from "axios";
import { useRouter } from "next/navigation";
import { recipeSchema } from "../../validationSchema/recipeSchema";
import z from "zod";

const loggedUserId = 1;

type RecipeWithRelations = Prisma.RecipeGetPayload<{
  include: { ingredients: true; steps: true; categories: true };
}>;

type RecipeFormData = z.infer<typeof recipeSchema>;

interface Props {
  recipe?: RecipeWithRelations;
}

const RecipeForm = ({ recipe }: Props) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const form = useForm<RecipeFormData>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      title: "",
      description: "",
      difficulty: "LAGANO",
      cooking_time: 1,
      servings: 1,
      categories: [],
      ingredients: [{ name: "", amount: 0, unit: "G" }],
      steps: [{ description: "", image: undefined, removeImage: false }],
      image: undefined,
      authorId: loggedUserId,
    },
  });
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    axios.get("/api/categories").then((res) => {
      setCategories(res.data);
    });
  }, []);
  useEffect(() => {
    if (!recipe || categories.length === 0) return;

    form.reset({
      title: recipe.title,
      description: recipe.description,
      difficulty: recipe.difficulty,
      cooking_time: recipe.cooking_time ?? 0,
      servings: recipe.servings ?? 1,
      categories: recipe.categories?.map((c) => c.id) || [],
      image: undefined,
      authorId: recipe.authorId,

      ingredients:
        recipe.ingredients?.length > 0
          ? recipe.ingredients.map((ing) => ({
              name: ing.name,
              amount: ing.amount ?? 0,
              unit: ing.unit ?? "G",
            }))
          : [{ name: "", amount: 0, unit: "G" }],

      steps:
        recipe.steps?.length > 0
          ? recipe.steps.map((step) => ({
              id: step.id,
              description: step.description,
              image: undefined,
            }))
          : [{ description: "", image: undefined, removeImage: false }],
    });
  }, [recipe, categories, form]);

  const {
    fields: ingredientFields,
    append: appendIngredient,
    remove: removeIngredient,
  } = useFieldArray({ name: "ingredients", control: form.control });

  const {
    fields: stepFields,
    append: appendStep,
    remove: removeStep,
  } = useFieldArray({
    name: "steps",
    control: form.control,
  });

  const onSubmit = async (values: RecipeFormData) => {
    setIsSubmitting(true);
    setError("");

    let imageUrl = recipe?.image || "";

    if (values.image) {
      const formData = new FormData();
      formData.append("image", values.image);
      try {
        const res = await axios.post("/api/upload", formData);
        imageUrl = res.data.filePath;
      } catch {
        setError("Greška pri uploadu slike");
        setIsSubmitting(false);
        return;
      }
    }

    const normalizedSteps = await Promise.all(
      values.steps.map(async (step, index) => {
        let oldImage = recipe?.steps[index]?.image || null;
        let stepImageUrl = oldImage;

        if (step.removeImage) {
          stepImageUrl = null;
        }

        if (step.image) {
          const formData = new FormData();
          formData.append("image", step.image);

          const res = await axios.post("/api/upload", formData);
          stepImageUrl = res.data.filePath;
        }

        return {
          id: recipe?.steps[index]?.id,
          description: step.description,
          step_order: index + 1,
          image: stepImageUrl,
        };
      }),
    );

    const payload = {
      ...values,
      image: imageUrl,
      steps: normalizedSteps,
    };

    try {
      if (recipe) {
        await axios.patch(`/api/recipes/${recipe.id}`, payload);
        router.push(`/recipes/${recipe.id}`);
      } else {
        await axios.post("/api/recipes", payload);
        router.push(`/recipes`);
      }
      router.refresh();
    } catch {
      setError("Greška pri spremanju recepta");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <label>Naslov:</label>
      <Controller
        name="title"
        control={form.control}
        render={({ field }) => <input {...field} />}
      />

      <label>Opis:</label>
      <Controller
        name="description"
        control={form.control}
        render={({ field }) => <textarea {...field} />}
      />

      <label>Težina:</label>
      <Controller
        name="difficulty"
        control={form.control}
        render={({ field }) => (
          <select {...field}>
            <option value="LAGANO">Lagano</option>
            <option value="SREDNJE">Srednje</option>
            <option value="TEŠKO">Teško</option>
          </select>
        )}
      />

      <label>Vrijeme kuhanja (min):</label>
      <Controller
        name="cooking_time"
        control={form.control}
        render={({ field }) => (
          <input
            type="number"
            {...field}
            onChange={(e) => field.onChange(Number(e.target.value))}
          />
        )}
      />

      <label>Porcije:</label>
      <Controller
        name="servings"
        control={form.control}
        render={({ field }) => (
          <input
            type="number"
            {...field}
            onChange={(e) => field.onChange(Number(e.target.value))}
          />
        )}
      />

      <label>Kategorije:</label>
      <Controller
        name="categories"
        control={form.control}
        render={({ field }) => (
          <div>
            {categories.map((cat) => (
              <label key={cat.id} style={{ display: "block" }}>
                <input
                  type="checkbox"
                  checked={(field.value ?? []).includes(cat.id)}
                  onChange={(e) => {
                    const current = field.value ?? [];

                    if (e.target.checked) {
                      field.onChange([...current, Number(cat.id)]);
                    } else {
                      field.onChange(
                        current.filter((id: number) => id !== cat.id),
                      );
                    }
                  }}
                />
                {cat.name}
              </label>
            ))}
          </div>
        )}
      />

      <label>Slika:</label>
      {recipe?.image && (
        <div>
          <p>Trenutna slika:</p>
          <img src={recipe.image} alt="recipe" width={150} />
        </div>
      )}

      <Controller
        name="image"
        control={form.control}
        render={({ field }) => (
          <input
            type="file"
            onChange={(e) => field.onChange(e.target.files?.[0] ?? undefined)}
          />
        )}
      />

      <h3>Sastojci</h3>
      {ingredientFields.map((item, index) => (
        <div key={item.id}>
          <Controller
            name={`ingredients.${index}.name`}
            control={form.control}
            render={({ field }) => <input placeholder="Ime" {...field} />}
          />
          <Controller
            name={`ingredients.${index}.amount`}
            control={form.control}
            render={({ field }) => (
              <input
                type="number"
                {...field}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            )}
          />
          <Controller
            name={`ingredients.${index}.unit`}
            control={form.control}
            render={({ field }) => (
              <select {...field}>
                <option value="G">G</option>
                <option value="KG">KG</option>
                <option value="ML">ML</option>
                <option value="DL">DL</option>
                <option value="L">L</option>
                <option value="KOM">KOM</option>
                <option value="TBSP">TBSP</option>
                <option value="TSP">TSP</option>
              </select>
            )}
          />
          <button type="button" onClick={() => removeIngredient(index)}>
            Ukloni
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={() => appendIngredient({ name: "", amount: 0, unit: "G" })}
      >
        Dodaj sastojak
      </button>

      <h3>Koraci izrade recepta</h3>
      {stepFields.map((item, index) => {
        const removeImage = form.watch(`steps.${index}.removeImage`);

        return (
          <div key={item.id}>
            <h4>{index + 1}. Korak</h4>

            <Controller
              name={`steps.${index}.description`}
              control={form.control}
              render={({ field }) => <textarea {...field} />}
            />

            <Controller
              name={`steps.${index}.image`}
              control={form.control}
              render={({ field }) => (
                <input
                  type="file"
                  onChange={(e) =>
                    field.onChange(e.target.files?.[0] ?? undefined)
                  }
                />
              )}
            />

            {recipe?.steps[index]?.image && (
              <div>
                <img src={recipe.steps[index].image} width={120} />

                <button
                  type="button"
                  disabled={removeImage}
                  onClick={() => {
                    form.setValue(`steps.${index}.removeImage`, !removeImage);
                  }}
                >
                  {removeImage ? "Obrisano" : "Ukloni sliku"}
                </button>
              </div>
            )}

            <button type="button" onClick={() => removeStep(index)}>
              Ukloni
            </button>
          </div>
        );
      })}
      <button
        type="button"
        onClick={() => appendStep({ description: "", image: undefined })}
      >
        Dodaj korak
      </button>

      <br />

      <button type="submit" disabled={isSubmitting}>
        {recipe ? "Ažuriraj recept" : "Kreiraj recept"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </form>
  );
};

export default RecipeForm;
