import { db } from "@/db";
import { loginAttemptsTable, LoginAttemptSelect } from "./login-attempt.table";
import { eq } from "drizzle-orm";

export interface RateLimitStatus {
  isLocked: boolean;
  lockedUntil?: Date | null;
  remainingMinutes?: number;
  remainingSeconds?: number;
  remainingAttempts?: number;
}

const ATTEMPT_WINDOW_MS = 60 * 1000; // 1 menit window
const LOCKOUT_DURATION_MS = 10 * 60 * 1000; // 10 menit lockout
const MAX_ATTEMPTS = 3;

export async function checkRateLimit(identifier: string): Promise<RateLimitStatus> {
  const cleanId = identifier.trim().toLowerCase();
  const rows = await db
    .select()
    .from(loginAttemptsTable)
    .where(eq(loginAttemptsTable.identifier, cleanId));

  const record: LoginAttemptSelect | undefined = rows[0];
  if (!record) {
    return { isLocked: false, remainingAttempts: MAX_ATTEMPTS };
  }

  const now = Date.now();

  // 1. Periksa apakah saat ini sedang dalam status terkunci
  if (record.lockedUntil) {
    const lockedUntilMs = new Date(record.lockedUntil).getTime();
    if (lockedUntilMs > now) {
      const remainingSeconds = Math.max(1, Math.ceil((lockedUntilMs - now) / 1000));
      const remainingMinutes = Math.ceil(remainingSeconds / 60);
      return {
        isLocked: true,
        lockedUntil: record.lockedUntil,
        remainingMinutes,
        remainingSeconds,
        remainingAttempts: 0,
      };
    } else {
      // Masa kunci 10 menit telah berlalu, reset counter
      await db
        .update(loginAttemptsTable)
        .set({
          attempts: 0,
          lockedUntil: null,
          lastAttemptAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(loginAttemptsTable.identifier, cleanId));

      return { isLocked: false, remainingAttempts: MAX_ATTEMPTS };
    }
  }

  // 2. Jika tidak terkunci, periksa apakah window 1 menit telah kadaluarsa
  const lastAttemptMs = new Date(record.lastAttemptAt).getTime();
  if (now - lastAttemptMs > ATTEMPT_WINDOW_MS) {
    // Window 1 menit sudah lewat, counter reset otomatis
    await db
      .update(loginAttemptsTable)
      .set({
        attempts: 0,
        lastAttemptAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(loginAttemptsTable.identifier, cleanId));

    return { isLocked: false, remainingAttempts: MAX_ATTEMPTS };
  }

  const remaining = Math.max(0, MAX_ATTEMPTS - record.attempts);
  return { isLocked: false, remainingAttempts: remaining };
}

export async function recordFailedAttempt(identifier: string): Promise<RateLimitStatus> {
  const cleanId = identifier.trim().toLowerCase();
  const now = new Date();
  const nowMs = now.getTime();

  const rows = await db
    .select()
    .from(loginAttemptsTable)
    .where(eq(loginAttemptsTable.identifier, cleanId));

  const record = rows[0];

  if (!record) {
    // Percobaan pertama gagal
    await db.insert(loginAttemptsTable).values({
      identifier: cleanId,
      attempts: 1,
      lastAttemptAt: now,
      lockedUntil: null,
    });
    return { isLocked: false, remainingAttempts: MAX_ATTEMPTS - 1 };
  }

  // Jika sedang terkunci
  if (record.lockedUntil && new Date(record.lockedUntil).getTime() > nowMs) {
    const remainingSeconds = Math.ceil((new Date(record.lockedUntil).getTime() - nowMs) / 1000);
    const remainingMinutes = Math.ceil(remainingSeconds / 60);
    return {
      isLocked: true,
      lockedUntil: record.lockedUntil,
      remainingMinutes,
      remainingSeconds,
      remainingAttempts: 0,
    };
  }

  // Cek apakah window 1 menit sudah terlewati
  const lastAttemptMs = new Date(record.lastAttemptAt).getTime();
  let newAttempts = 1;
  if (nowMs - lastAttemptMs <= ATTEMPT_WINDOW_MS) {
    newAttempts = record.attempts + 1;
  }

  if (newAttempts >= MAX_ATTEMPTS) {
    // Gagal 3 kali dalam 1 menit -> Lockout selama 10 menit
    const lockedUntil = new Date(nowMs + LOCKOUT_DURATION_MS);
    await db
      .update(loginAttemptsTable)
      .set({
        attempts: MAX_ATTEMPTS,
        lastAttemptAt: now,
        lockedUntil,
        updatedAt: now,
      })
      .where(eq(loginAttemptsTable.identifier, cleanId));

    return {
      isLocked: true,
      lockedUntil,
      remainingMinutes: 10,
      remainingSeconds: 600,
      remainingAttempts: 0,
    };
  }

  // Belum mencapai 3 kali
  await db
    .update(loginAttemptsTable)
    .set({
      attempts: newAttempts,
      lastAttemptAt: now,
      lockedUntil: null,
      updatedAt: now,
    })
    .where(eq(loginAttemptsTable.identifier, cleanId));

  return {
    isLocked: false,
    remainingAttempts: MAX_ATTEMPTS - newAttempts,
  };
}

export async function resetLoginAttempts(identifier: string): Promise<void> {
  const cleanId = identifier.trim().toLowerCase();
  await db
    .delete(loginAttemptsTable)
    .where(eq(loginAttemptsTable.identifier, cleanId));
}
