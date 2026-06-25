import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { kv } = await import("@vercel/kv");
    // Seed to 1336 on first ever call so incr makes the first visitor see 1337
    await kv.setnx("visitor_count", 1336);
    const count = await kv.incr("visitor_count");
    return NextResponse.json({ count });
  } catch {
    // KV not yet connected — return the seed value
    return NextResponse.json({ count: 1337 });
  }
}
