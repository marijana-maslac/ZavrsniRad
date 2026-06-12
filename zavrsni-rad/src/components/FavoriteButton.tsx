"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSession } from "next-auth/react";
import styles from "../styles/FavoriteButton.module.css";

interface Props {
  recipeId: number;
  initialIsFavorite?: boolean;
}

const FavoriteButton = ({ recipeId, initialIsFavorite = false }: Props) => {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();

  const handleToggle = async () => {
    if (!session) {
      setError("Moraš se prijaviti da bi spremio omiljene recepte.");
      return;
    }

    try {
      setLoading(true);

      await axios.post("/api/favorites", { recipeId });

      setIsFavorite((previous) => !previous);

      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <button
        onClick={handleToggle}
        disabled={loading}
        className={styles.favoriteButton}
      >
        {isFavorite ? "❤️ " : "🤍 "}
      </button>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
};
export default FavoriteButton;
