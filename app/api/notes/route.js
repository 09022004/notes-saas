import { NextResponse } from "next/server";
import { getClient } from "@/lib/db";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

// GET all notes for this tenant
export async function GET(req) {
  try {
    const auth = req.headers.get("authorization");
    if (!auth) return NextResponse.json({ error: "No token" }, { status: 401 });

    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const client = await getClient();
    const { rows } = await client.query(
      "SELECT id, title, content FROM notes WHERE tenant_id=$1",
      [decoded.tenant_id]
    );
    client.release();

    return NextResponse.json(rows);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// CREATE a new note
export async function POST(req) {
  try {
    const auth = req.headers.get("authorization");
    if (!auth) return NextResponse.json({ error: "No token" }, { status: 401 });

    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const body = await req.json();
    const { title, content } = body;

    const client = await getClient();
    const result = await client.query(
      "INSERT INTO notes (title, content, tenant_id) VALUES ($1, $2, $3) RETURNING *",
      [title, content, decoded.tenant_id]
    );
    client.release();

    return NextResponse.json(result.rows[0]);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
