import Link from "next/link";
import styles from "./admin.module.css";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <h2>Administracijska ploča</h2>

        <Link href="/admin" className={styles.link}>
          📊 Pregled
        </Link>

        <Link href="/admin/categories" className={styles.link}>
          📂 Kategorije
        </Link>

        <Link href="/admin/users" className={styles.link}>
          👤 Korisnici
        </Link>
      </aside>

      <main className={styles.content}>{children}</main>
    </div>
  );
}
