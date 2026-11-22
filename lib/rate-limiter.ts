/**
 * In-memory sliding window rate limiter
 * Menyimpan riwayat timestamp permintaan per client key (IP / Session).
 */

interface RateLimitRecord {
  timestamps: number[];
  lastCleanup: number;
}

class RateLimiter {
  private cache = new Map<string, RateLimitRecord>();
  private readonly windowMs: number;
  private readonly maxLimit: number;

  constructor(windowMs = 60 * 1000, maxLimit = 3) {
    this.windowMs = windowMs;
    this.maxLimit = maxLimit;

    // Bersihkan memori setiap 5 menit dari entri yang sudah kedaluwarsa
    if (typeof setInterval !== "undefined") {
      setInterval(() => {
        const now = Date.now();
        for (const [key, record] of this.cache.entries()) {
          if (now - record.lastCleanup > this.windowMs * 2) {
            const valid = record.timestamps.filter((ts) => now - ts < this.windowMs);
            if (valid.length === 0) {
              this.cache.delete(key);
            } else {
              record.timestamps = valid;
              record.lastCleanup = now;
            }
          }
        }
      }, 5 * 60 * 1000);
    }
  }

  /**
   * Memeriksa apakah permintaan dari key ini diizinkan
   */
  public check(key: string): {
    success: boolean;
    limit: number;
    remaining: number;
    resetTime: number;
    retryAfterSeconds: number;
  } {
    const now = Date.now();
    const record = this.cache.get(key) || { timestamps: [], lastCleanup: now };

    // Filter timestamp yang masih berada dalam kurun waktu windowMs
    const validTimestamps = record.timestamps.filter((ts) => now - ts < this.windowMs);

    if (validTimestamps.length >= this.maxLimit) {
      // Melebihi kuota
      const oldestValid = validTimestamps[0];
      const resetTime = oldestValid + this.windowMs;
      const retryAfterSeconds = Math.max(1, Math.ceil((resetTime - now) / 1000));

      this.cache.set(key, { timestamps: validTimestamps, lastCleanup: now });

      return {
        success: false,
        limit: this.maxLimit,
        remaining: 0,
        resetTime,
        retryAfterSeconds,
      };
    }

    // Masih dalam batas yang diizinkan
    validTimestamps.push(now);
    this.cache.set(key, { timestamps: validTimestamps, lastCleanup: now });

    const oldest = validTimestamps[0];
    const resetTime = oldest + this.windowMs;
    const remaining = Math.max(0, this.maxLimit - validTimestamps.length);

    return {
      success: true,
      limit: this.maxLimit,
      remaining,
      resetTime,
      retryAfterSeconds: 0,
    };
  }

  /**
   * Reset kuota untuk key tertentu (misal untuk testing)
   */
  public reset(key: string): void {
    this.cache.delete(key);
  }
}

// Instance global: 3 request per 60.000 ms (1 menit)
export const registrationRateLimiter = new RateLimiter(60 * 1000, 3);
