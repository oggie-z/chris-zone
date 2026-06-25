import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_NOW_PLAYING_URL = "https://api.spotify.com/v1/me/player/currently-playing";
const LAST_PLAYED_KEY = "last_played_song";

async function getAccessToken() {
  const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN } = process.env;
  const basic = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString("base64");

  const res = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: SPOTIFY_REFRESH_TOKEN!,
    }),
  });

  return res.json() as Promise<{ access_token: string }>;
}

function getRedis() {
  return new Redis({
    url: process.env.UPSTASH_KV_REST_API_URL!,
    token: process.env.UPSTASH_KV_REST_API_TOKEN!,
  });
}

export async function GET() {
  try {
    const { access_token } = await getAccessToken();

    const res = await fetch(SPOTIFY_NOW_PLAYING_URL, {
      headers: { Authorization: `Bearer ${access_token}` },
      next: { revalidate: 0 },
    });

    // Something is currently playing
    if (res.status === 200) {
      const data = await res.json();

      if (data?.item && data.is_playing) {
        const track = {
          isPlaying: true,
          title: data.item.name,
          artist: data.item.artists.map((a: { name: string }) => a.name).join(", "),
          url: data.item.external_urls.spotify,
        };

        // Save as last played
        try {
          const redis = getRedis();
          await redis.set(LAST_PLAYED_KEY, JSON.stringify(track));
        } catch {
          // Redis unavailable — still return the track
        }

        return NextResponse.json(track);
      }
    }

    // Nothing playing — return last saved track
    try {
      const redis = getRedis();
      const lastPlayed = await redis.get<string>(LAST_PLAYED_KEY);
      if (lastPlayed) {
        const track = typeof lastPlayed === "string" ? JSON.parse(lastPlayed) : lastPlayed;
        return NextResponse.json({ ...track, isPlaying: false });
      }
    } catch {
      // Redis unavailable
    }

    return NextResponse.json({ isPlaying: false });
  } catch {
    return NextResponse.json({ isPlaying: false });
  }
}
