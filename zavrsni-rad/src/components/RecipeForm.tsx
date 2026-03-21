"use client";
import { useEffect, useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Prisma } from "@/generated/prisma/client";
import axios from "axios";
import { useRouter } from "next/navigation";
import { recipeSchema } from "../../validationSchema/recipeSchema";
import z from "zod";

const loggedUserId = 1;

type RecipeWithRelations = Prisma.RecipeGetPayload<{
  include: { ingredients: true; steps: true };
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
      cooking_time: 0,
      servings: 1,
      category: "RAZNO",
      ingredients: [{ name: "", amount: 0, unit: "G" }],
      steps: [{ description: "" }],
      image: undefined,
      authorId: loggedUserId,
    },
  });

  useEffect(() => {
    if (!recipe) return;
    form.reset({
      title: recipe.title,
      description: recipe.description,
      difficulty: recipe.difficulty,
      cooking_time: recipe.cooking_time ?? 0,
      servings: recipe.servings ?? 1,
      category: recipe.category,
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
              description: step.description,
            }))
          : [{ description: "" }],
    });
  }, [recipe, form]);

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

    const normalizedSteps = values.steps.map((step, index) => ({
      description: step.description,
      step_order: index + 1,
    }));

    const payload = {
      ...values,
      image: imageUrl,
      steps: normalizedSteps,
    };
    try {
      if (recipe) {
        await axios.patch(`/api/recipes/${recipe.id}`, payload);
        router.push(`/recipes/${recipe.id}`);
        router.refresh();
      } else {
        await axios.post("/api/recipes", payload);
        router.push(`/recipes`);
        router.refresh();
      }
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

      <label>Kategorija:</label>
      <Controller
        name="category"
        control={form.control}
        render={({ field }) => (
          <select {...field}>
            <option value="RAZNO">Razno</option>
            <option value="DORUČAK">Doručak</option>
            <option value="RUČAK">Ručak</option>
            <option value="VEČERA">Večera</option>
            <option value="VEGANSKI">Veganski</option>
            <option value="VEGETARIJANSKI">Vegetarijanski</option>
            <option value="FINGER_FOOD">Finger food</option>
            <option value="GLUTEN_FREE">Bez glutena</option>
            <option value="DESERTI">Deserti</option>
            <option value="PIĆA">Pića</option>
            <option value="JUHE">Juhe</option>
          </select>
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
          <h4>{index + 1}.sastojak</h4>
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
      {stepFields.map((item, index) => (
        <div key={item.id}>
          <h4>{index + 1}. Korak</h4>
          <Controller
            name={`steps.${index}.description`}
            control={form.control}
            render={({ field }) => <textarea {...field} />}
          />
          <button type="button" onClick={() => removeStep(index)}>
            Ukloni
          </button>
        </div>
      ))}
      <button type="button" onClick={() => appendStep({ description: "" })}>
        Dodaj korak
      </button>

      <br />
      <button type="submit" disabled={isSubmitting}>
        {recipe ? "Update" : "Create"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </form>
  );
};

export default RecipeForm;
