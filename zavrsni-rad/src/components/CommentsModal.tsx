"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";

export default function CommentsModal({
  recipeId,
  onClose,
  setCommentCount,
}: any) {
  const [comments, setComments] = useState<any[]>([]);
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const { data: session } = useSession();

  const fetchComments = async () => {
    const res = await axios.get(`/api/recipes/${recipeId}/comments`);
    setComments(res.data);
    setCommentCount(res.data.length);
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const submitComment = async () => {
    if (!content.trim()) return;
    let imagePath = null;

    if (image) {
      const formData = new FormData();
      formData.append("image", image);

      const res = await axios.post("/api/upload", formData);
      imagePath = res.data.filePath;
    }
    const temp = {
      id: Date.now(),
      content,
      image: imagePath,
      createdAt: new Date().toISOString(),
      user: session?.user,
    };

    setComments((prev) => [temp, ...prev]);

    setContent("");

    setCommentCount((prev: number) => prev + 1);

    await axios.post(`/api/recipes/${recipeId}/comments`, {
      content,
      image: imagePath,
    });

    fetchComments();
  };
  const deleteComment = async (id: number) => {
    await axios.delete(`/api/comments/${id}`);

    setComments((prev) => {
      const updated = prev.filter((c) => c.id !== id);

      return updated;
    });
    setCommentCount((prev: number) => prev - 1);
  };

  return (
    <div
      style={overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div style={modal}>
        <button onClick={onClose}>X</button>
        <h2>Komentari ({comments.length})</h2>
        {session && (
          <div>
            <textarea
              maxLength={1000}
              style={{ marginTop: "10px" }}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Napiši komentar..."
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] ?? null)}
            />
            <button onClick={submitComment}>Pošalji</button>
          </div>
        )}{" "}
        {!session && <p>Prijavi se za komentiranje</p>}
        <div style={{ overflowY: "auto", flex: 1 }}>
          {comments.map((c) => (
            <div key={c.id}>
              <b>{c.user.username}</b>
              <p>
                {c.content}
                {c.image && (
                  <img
                    src={c.image}
                    alt="comment"
                    style={{
                      width: "200px",
                      marginTop: "10px",
                      borderRadius: "8px",
                    }}
                  />
                )}
              </p>
              <small>{new Date(c.createdAt).toLocaleString()}</small>

              {(session?.user?.id === c.user.id ||
                session?.user?.role === "ADMIN") && (
                <button
                  onClick={() => {
                    if (
                      confirm("Jesi li siguran da želiš obrisati komentar?")
                    ) {
                      deleteComment(c.id);
                    }
                  }}
                >
                  Obriši
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const overlay: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  background: "rgba(0,0,0,0.6)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
};

const modal: React.CSSProperties = {
  width: "500px",
  maxHeight: "80vh",
  background: "white",
  borderRadius: "12px",
  padding: "20px",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
};
