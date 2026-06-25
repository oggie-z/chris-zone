import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { Redis } = await import("@upstash/redis");
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
    // Seed to 1336 on first call so first visitor sees 1337
    await redis.setnx("visitor_count", 1336);
    const count = await redis.incr("visitor_count");
    return NextResponse.json({ count });
  } catch {
    // Redis not yet connected — return seed value
    return NextResponse.json({ count: 1337 });
  }
}
