"use client";
import { useEffect, useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Category, Prisma } from "@/generated/prisma/client";
import axios from "axios";
import { useRouter } from "next/navigation";
import { recipeSchema } from "../../validationSchema/recipeSchema";
import z from "zod";
import { useSession } from "next-auth/react";
import styles from "../styles/RecipeForm.module.css";

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
  const { data: session } = useSession();

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
    },
  });
  const [categories, setCategories] = useState<Category[]>([]);
  useEffect(() => {
    if (session?.user?.id) {
      form.setValue("authorId", Number(session.user.id));
    }
  }, [session, form]);
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

      steps: recipe.steps?.length
        ? recipe.steps.map((step) => ({
            id: step.id,
            description: step.description,
            image: step.image || null,
            removeImage: false,
          }))
        : [],
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
        const existingStep = recipe?.steps.find((s) => s.id === step.id);

        let oldImage = existingStep?.image || null;
        let stepImageUrl = oldImage;

        if (step.removeImage) {
          stepImageUrl = null;
        }

        if (step.image instanceof File) {
          const formData = new FormData();
          formData.append("image", step.image);

          const res = await axios.post("/api/upload", formData);
          stepImageUrl = res.data.filePath;
        }

        return {
          id: step.id,
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
    } catch (error: any) {
      console.error("Submission error: ", error);
      setError(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Greška pri spremanju recepta",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className={styles.header}>
          <h1>{recipe ? "Uredi recept" : "Novi recept"}</h1>
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isSubmitting}
          >
            {recipe ? "Ažuriraj recept" : "Kreiraj recept"}
          </button>
        </div>
        <div className={styles.gridTop} style={{ margin: "10px" }}>
          <div className={styles.col}>
            <div className={styles.sectionTitle}>Osnovno</div>
            <h5 className={styles.smallTitle}>Naslov</h5>
            <input
              {...form.register("title")}
              className={styles.input}
              placeholder="Naslov"
            />
            <h5 className={styles.sectionTitle}>Opis</h5>
            <textarea
              {...form.register("description")}
              className={styles.textarea}
              placeholder="Opis"
            />
            <h4
              className={styles.sectionTitle}
              style={{ fontWeight: "550", fontSize: "13px" }}
            >
              Naslovna fotografija jela
            </h4>
            <input
              type="file"
              className={styles.input}
              onChange={(e) => form.setValue("image", e.target.files?.[0])}
            />

            {recipe?.image && <img src={recipe.image} width={200} />}
          </div>

          <div className={styles.col}>
            <div className={styles.sectionTitle}>Detalji</div>
            <h5 className={styles.smallTitle}>Težina jela</h5>
            <Controller
              name="difficulty"
              control={form.control}
              render={({ field }) => (
                <select {...field} className={styles.select}>
                  <option value="LAGANO">Lagano</option>
                  <option value="SREDNJE">Srednje</option>
                  <option value="TEŠKO">Teško</option>
                </select>
              )}
            />
            <h5 className={styles.smallTitle}>Vrijeme kuhanja</h5>

            <input
              type="number"
              {...form.register("cooking_time", { valueAsNumber: true })}
              className={styles.input}
              placeholder="Vrijeme (min)"
            />
            <h5 className={styles.smallTitle}>Broj porcija</h5>

            <input
              type="number"
              {...form.register("servings", { valueAsNumber: true })}
              className={styles.input}
              placeholder="Porcije"
            />
          </div>

          <div className={styles.col}>
            <div className={styles.sectionTitle}>Kategorije</div>

            {categories.map((cat) => (
              <label key={cat.id} className={styles.checkboxRow}>
                <input
                  type="checkbox"
                  checked={(form.watch("categories") ?? []).includes(cat.id)}
                  onChange={(e) => {
                    const current = form.getValues("categories") ?? [];

                    if (e.target.checked) {
                      form.setValue("categories", [...current, cat.id]);
                    } else {
                      form.setValue(
                        "categories",
                        current.filter((id: number) => id !== cat.id),
                      );
                    }
                  }}
                />
                {cat.name}
              </label>
            ))}
          </div>
        </div>

        <div className={styles.bottomGrid} style={{ margin: "10px" }}>
          <div className={styles.bigCard}>
            <div className={styles.cardHeader}>Sastojci</div>
            {ingredientFields.map((item, index) => (
              <div key={item.id} className={styles.itemRow}>
                <input
                  {...form.register(`ingredients.${index}.name`)}
                  className={styles.input}
                  placeholder="Sastojak"
                />
                <input
                  type="number"
                  {...form.register(`ingredients.${index}.amount`, {
                    valueAsNumber: true,
                  })}
                  className={styles.input}
                  placeholder="Količina"
                />

                <select
                  {...form.register(`ingredients.${index}.unit`)}
                  className={styles.select}
                >
                  <option value="G">G</option>
                  <option value="KG">KG</option>
                  <option value="ML">ML</option>
                  <option value="DL">DL</option>
                  <option value="L">L</option>
                  <option value="KOM">KOM</option>
                </select>

                <button type="button" onClick={() => removeIngredient(index)}>
                  {" "}
                  Ukloni{" "}
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() =>
                appendIngredient({ name: "", amount: 0, unit: "G" })
              }
            >
              {" "}
              + Dodaj sastojak
            </button>
          </div>

          <div className={styles.bigCard}>
            <div className={styles.section}>
              <div className={styles.sectionTitle}>Koraci</div>

              {stepFields.map((item, index) => {
                const removeImage = form.watch(`steps.${index}.removeImage`);
                const stepImage = form.watch(`steps.${index}.image`);

                return (
                  <div key={item.id}>
                    <h4>{index + 1}. Korak</h4>

                    <Controller
                      name={`steps.${index}.description`}
                      control={form.control}
                      render={({ field }) => (
                        <textarea
                          {...field}
                          className={styles.textarea}
                          placeholder="Opis koraka.."
                        />
                      )}
                    />

                    <Controller
                      name={`steps.${index}.image`}
                      control={form.control}
                      render={({ field }) => (
                        <input
                          type="file"
                          className={styles.input}
                          onChange={(e) => {
                            field.onChange(e.target.files?.[0] ?? undefined);

                            form.setValue(`steps.${index}.removeImage`, false);
                          }}
                        />
                      )}
                    />

                    <div className={styles.imageWrapper}>
                      <div className={styles.imageWrapper}>
                        {typeof stepImage === "string" &&
                          stepImage &&
                          !removeImage && (
                            <div>
                              <img
                                src={stepImage}
                                width={120}
                                className={styles.stepImage}
                                alt="Korak"
                              />

                              <button
                                type="button"
                                onClick={() =>
                                  form.setValue(
                                    `steps.${index}.removeImage`,
                                    true,
                                  )
                                }
                              >
                                Ukloni sliku
                              </button>
                            </div>
                          )}
                      </div>
                    </div>

                    <button type="button" onClick={() => removeStep(index)}>
                      Ukloni
                    </button>
                  </div>
                );
              })}
              <button
                type="button"
                onClick={() =>
                  appendStep({ description: "", image: undefined })
                }
              >
                Dodaj korak
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default RecipeForm;
