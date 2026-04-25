"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";

interface Props {
  recipeId: number;
}

export default function Rating({ recipeId }: Props) {
  const { data: session } = useSession();

  const [value, setValue] = useState(0);
  const [avg, setAvg] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    fetchAverage();
  }, []);

  useEffect(() => {
    if (session) {
      fetchUserRating();
    }
  }, [session]);

  const fetchAverage = async () => {
    const res = await axios.get(`/api/recipes/${recipeId}/rating/average`);
    setAvg(res.data.average);
    setCount(res.data.count);
  };
  const fetchUserRating = async () => {
    if (!session) return;

    const res = await axios.get(`/api/recipes/${recipeId}/rating`);
    setValue(res.data.value);
  };
  const submitRating = async (v: number) => {
    if (!session) return;

    const previous = value;

    setValue(v);

    try {
      await axios.post(`/api/recipes/${recipeId}/rating`, {
        value: v,
      });

      fetchAverage();
    } catch {
      setValue(previous);
    }
  };

  return (
    <div style={{ marginTop: "20px" }}>
      <p>
        ⭐ Ocjena: {avg.toFixed(1)} ({count})
      </p>

      <div>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => submitRating(star)}
            style={{
              fontSize: "20px",
              color: star <= value ? "gold" : "gray",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            ★
          </button>
        ))}
      </div>

      {!session && <p>Prijavi se za ocjenjivanje</p>}
    </div>
  );
}
