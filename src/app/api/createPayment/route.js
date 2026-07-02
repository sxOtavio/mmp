import { NextResponse } from "next/server";
import { pool } from "../../../lib/db";
import { Preference } from "mercadopago";
import { client as mpClient } from "@/lib/mercadoPago";
import jwt from "jsonwebtoken";

export async function POST(request) {
  let client;


}