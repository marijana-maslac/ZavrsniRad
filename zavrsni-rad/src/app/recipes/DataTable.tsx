import Link from "next/link";
import styles from "./DataTable.module.css";

export default function DataTable({ recipes }: any) {
  return (
    <div className={styles.container}>
      {recipes.map((r: any) => (
        <Link key={r.id} href={`/recipes/${r.id}`} className={styles.card}>
          <img src={r.image || "/food-placeholder.jpg"} />

          <div className={styles.info}>
            <div className={styles.title}>{r.title}</div>
            <div className={styles.author}>{r.author.name}</div>
          </div>
        </Link>
      ))}
    </div>
  );
}
