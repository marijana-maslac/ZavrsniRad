import Link from "next/link";
import { getServerSession } from "next-auth";
import options from "@/app/api/auth/[...nextauth]/options";
import SignOutButton from "./SignOutButton";
import styles from "../styles/mainNav.module.css";

const MainNav = async () => {
  const session = await getServerSession(options);
  return (
    <nav className={styles.nav}>
      <Link href="/" className={styles.logo}>
        <div className={styles.logoIcon}>R</div>
        <span>
          Recipe<span className={styles.app}>App</span>
        </span>
      </Link>

      <div className={styles.center}>
        <Link className={styles.link} href="/">
          Početna
        </Link>

        <Link className={styles.link} href="/recipes">
          Recepti
        </Link>

        {session && (
          <Link className={styles.link} href="/favorites">
            ❤️ Omiljeni Recepti
          </Link>
        )}
      </div>

      <div className={styles.right}>
        {session && (
          <Link className={styles.link} href="/profile">
            Moj profil
          </Link>
        )}
        {session?.user.role === "ADMIN" && (
          <Link className={styles.link} href="/admin">
            Administracijska ploča
          </Link>
        )}

        {session ? (
          <SignOutButton />
        ) : (
          <Link className={styles.authBtn} href="/auth/signin">
            Prijava
          </Link>
        )}
      </div>
    </nav>
  );
};

export default MainNav;
