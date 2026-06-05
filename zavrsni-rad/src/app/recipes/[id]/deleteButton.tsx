"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

interface Props {
  recipeId: number;
  className?: string;
}

const DeleteButton = ({ recipeId, className }: Props) => {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    const confirmed = confirm(
      "Jesi li siguran/na da želiš izbrisati ovaj recept? Ova akcija se ne može poništiti i svi podaci će biti izbrisani.",
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await axios.delete(`/api/recipes/${recipeId}`);
      router.push("/recipes");
      router.refresh();
    } catch (err) {
      console.error(err);
      console.error("Greška pri brisanju recepta:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button onClick={handleDelete} disabled={isDeleting} className={className}>
      {isDeleting ? "Brisanje..." : "Obriši"}
    </button>
  );
};

export default DeleteButton;
