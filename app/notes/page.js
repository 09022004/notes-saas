"use client"; // 👈 required for hooks

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // 👈 instead of next/router

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
      router.push("/login"); // redirect to login if not authenticated
    } else {
      // TODO: fetch notes using token
      console.log("Fetching notes with token:", token);
    }
  }, [router]);

  return (
    <main>
      <h1>Your Notes</h1>
      <ul>
        {notes.length > 0 ? (
          notes.map((note, idx) => <li key={idx}>{note}</li>)
        ) : (
          <li>No notes yet</li>
        )}
      </ul>
    </main>
  );
}
