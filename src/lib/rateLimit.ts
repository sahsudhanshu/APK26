import { NextResponse } from "next/server";

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

export function rateLimiter(
  req: Request,
  limit: number = 10,
  windowMs: number = 10000
) {
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  
  if (ip === "unknown") return null;

  const now = Date.now();
  const record = store[ip];

  if (!record) {
    store[ip] = {
      count: 1,
      resetTime: now + windowMs,
    };
    return null; // Passed
  }

  // Reset if window has passed
  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + windowMs;
    return null; // Passed
  }

  record.count += 1;

  if (record.count > limit) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  return null; // Passed
}
