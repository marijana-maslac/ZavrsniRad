"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import styles from "../styles/CommentsModal.module.css";

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
    const response = await axios.get(`/api/recipes/${recipeId}/comments`);
    setComments(response.data);
    setCommentCount(response.data.length);
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

      const response = await axios.post("/api/upload", formData);
      imagePath = response.data.filePath;
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

    setComments((previous) => {
      const updated = previous.filter((comment) => comment.id !== id);

      return updated;
    });
    setCommentCount((previous: number) => previous - 1);
  };

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.modal}>
        <div className={styles.header}>
          <span>Komentari ({comments.length})</span>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.body}>
          {comments.map((comment) => (
            <div key={comment.id} className={styles.commentCard}>
              <div className={styles.username}>{comment.user.username}</div>
              <div>{comment.content}</div>

              {comment.image && (
                <img src={comment.image} className={styles.img} />
              )}

              <div className={styles.date}>
                {new Date(comment.createdAt).toLocaleString()}
              </div>

              {(session?.user?.id === comment.user.id ||
                session?.user?.role === "ADMIN") && (
                <button
                  className={styles.deleteBtn}
                  onClick={() => {
                    if (confirm("Obrisati komentar?"))
                      deleteComment(comment.id);
                  }}
                >
                  Obriši
                </button>
              )}
            </div>
          ))}
        </div>

        <div className={styles.form}>
          {session ? (
            <>
              <textarea
                className={styles.textarea}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Napiši komentar..."
              />

              <input
                className={styles.fileInput}
                type="file"
                onChange={(e) => setImage(e.target.files?.[0] ?? null)}
              />

              <button className={styles.sendBtn} onClick={submitComment}>
                Pošalji
              </button>
            </>
          ) : (
            <p>Prijavi se za komentiranje</p>
          )}
        </div>
      </div>
    </div>
  );
}
