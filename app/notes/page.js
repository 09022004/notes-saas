"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // ✅ new import

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/login");
    } else {
      // Fetch notes logic
      setNotes(["Note 1", "Note 2"]);
    }
  }, [router]);

  return (
    <div>
      <h1>Your Notes</h1>
      <ul>
        {notes.map((n, i) => (
          <li key={i}>{n}</li>
        ))}
      </ul>
    </div>
  );
}
