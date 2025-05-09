import { useState } from "react";
import styles from "@styles/footer/Copy.module.css";

export default function Copy() {
  const [date] = useState(new Date());
  const year = date.getFullYear();

  return (
    <footer className={styles.footer}>
      <p>&copy; {year} Kefi Student App</p>
    </footer>
  );
}
