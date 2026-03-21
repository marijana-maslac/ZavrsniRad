import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Image
          className={styles.logo}
          src="/next.svg"
          alt="Logo"
          width={100}
          height={20}
          priority
        />

        <div className={styles.intro}>
          <h1>Dobrodošli u Recipe App</h1>
          <p>
            Pronađi, spremi i podijeli svoje omiljene recepte. Pregledavaj
            recepte drugih korisnika ili dodaj vlastite.
          </p>
        </div>

        <div className={styles.ctas}>
          <Link className="primary" href="/recipes">
            Pregledaj recepte
          </Link>

          <Link className="secondary" href="/recipes/new">
            Dodaj recept
          </Link>
        </div>
      </main>
    </div>
  );
}
