import { NextResponse } from "next/server";
import { pool } from "../../../lib/db";

export async function GET() {
  const client = await pool.connect();

  console.log("conexão estabelecida");

  try {
    const result = await client.query("SELECT * FROM products WHERE promotion_price IS NOT NULL AND promotion_price != 0");
    return NextResponse.json(result.rows);
  
  } finally {
    client.release();
  }
}
export async function POST(request) {
  const body = await request.json();
  const client = await pool.connect();
  try {
    const result = await client.query("INSERT INTO products (name, price) VALUES ($1, $2) RETURNING *", [body.name, body.price]);
    return NextResponse.json(result.rows[0]);
  } finally {
    client.release();
  }
}
