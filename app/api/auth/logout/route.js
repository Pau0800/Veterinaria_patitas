import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = createClient();
    await supabase.auth.signOut();
  } catch (err) {
    console.error("[AUTH LOGOUT ERROR]:", err?.message || err);
  }

  const response = NextResponse.json({ ok: true }, { status: 200 });
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  return response;
}
