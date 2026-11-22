"use server";

import { revalidatePath } from "next/cache";
import { headers, cookies } from "next/headers";
import {
  updateRegistrationStatusSchema,
  UpdateRegistrationStatusInput,
  submitRegistrationSchema,
  SubmitRegistrationInput,
} from "../domain/registration.schema";
import {
  updateRegistrationStatus,
  deleteRegistration,
  createRegistration,
} from "../infrastructure/registration.repository";
import { getCompetitionById } from "../../competition/infrastructure/competition.repository";
import { CompetitionStatus } from "../../competition/domain/competition-status.enum";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { usersTable } from "../../auth/infrastructure/user.table";
import { eq } from "drizzle-orm";
import { ActionResult } from "@/modules/shared/domain/common.types";
import { registrationRateLimiter } from "@/lib/rate-limiter";

/**
 * Server Action: Perbarui Status Verifikasi Pendaftar (Admin Dashboard)
 */
export async function updateRegistrationStatusAction(
  payload: UpdateRegistrationStatusInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const parseResult = updateRegistrationStatusSchema.safeParse(payload);
    if (!parseResult.success) {
      return {
        success: false,
        error: parseResult.error.issues[0]?.message || "Input tidak valid",
      };
    }

    const { id, status, notes } = parseResult.data;

    // 1. Ambil user admin yang sedang login untuk dicatat sebagai verifiedBy
    let verifiedByUserId: string | null = null;
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.email) {
        const [matchedUser] = await db
          .select({ id: usersTable.id })
          .from(usersTable)
          .where(eq(usersTable.email, user.email))
          .limit(1);

        if (matchedUser) {
          verifiedByUserId = matchedUser.id;
        }
      }
    } catch {
      // Fallback jika konteks auth tidak tersedia
    }

    // 2. Eksekusi pembaruan status
    const updated = await updateRegistrationStatus(id, {
      status,
      notes: notes || null,
      verifiedBy: verifiedByUserId,
    });

    if (!updated) {
      return {
        success: false,
        error: "Data pendaftaran tidak ditemukan atau gagal diperbarui.",
      };
    }

    revalidatePath("/dashboard/registrations");
    return {
      success: true,
      message: `Status pendaftaran berhasil diubah menjadi ${status}.`,
      data: { id: updated.id },
    };
  } catch (error: any) {
    console.error("Error updateRegistrationStatusAction:", error);
    return {
      success: false,
      error: error.message || "Gagal memperbarui status pendaftar.",
    };
  }
}

/**
 * Server Action: Hapus Data Pendaftar (Admin Dashboard)
 */
export async function deleteRegistrationAction(
  id: string
): Promise<ActionResult<{ id: string }>> {
  try {
    if (!id) {
      return { success: false, error: "ID registrasi tidak valid." };
    }

    const deleted = await deleteRegistration(id);
    if (!deleted) {
      return {
        success: false,
        error: "Data pendaftaran tidak ditemukan atau gagal dihapus.",
      };
    }

    revalidatePath("/dashboard/registrations");
    return {
      success: true,
      message: "Data pendaftar berhasil dihapus.",
      data: { id },
    };
  } catch (error: any) {
    console.error("Error deleteRegistrationAction:", error);
    return {
      success: false,
      error: error.message || "Gagal menghapus data pendaftar.",
    };
  }
}

/**
 * Server Action: Submit Pendaftaran Formulir Publik (Dengan Proteksi Rate Limiting 3x/menit)
 */
export async function submitRegistrationAction(
  payload: SubmitRegistrationInput
): Promise<ActionResult<{ registrationNumber: string; id: string }>> {
  try {
    // 1. Ekstraksi Identifier Klien (IP Address & Session Cookie)
    const headersList = await headers();
    const forwardedFor = headersList.get("x-forwarded-for");
    const realIp = headersList.get("x-real-ip");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : realIp || "127.0.0.1";
    const userAgent = headersList.get("user-agent") || undefined;

    let sessionId = "anonymous";
    try {
      const cookieStore = await cookies();
      const sessionCookie = cookieStore.get("kp_reg_session");
      if (sessionCookie) {
        sessionId = sessionCookie.value;
      }
    } catch {
      // Ignore cookie extraction failure
    }

    const rateLimitKey = `reg_${ip}_${sessionId}`;

    // 2. Evaluasi Rate Limiter (Maksimal 3x per menit)
    const rateCheck = registrationRateLimiter.check(rateLimitKey);
    if (!rateCheck.success) {
      return {
        success: false,
        error: `Terlalu banyak permintaan pendaftaran. Batas maksimal 3 kali pendaftaran per menit. Silakan coba lagi dalam ${rateCheck.retryAfterSeconds} detik.`,
      };
    }

    // 3. Validasi Payload Input
    const parseResult = submitRegistrationSchema.safeParse(payload);
    if (!parseResult.success) {
      return {
        success: false,
        error: parseResult.error.issues[0]?.message || "Data formulir tidak valid.",
      };
    }

    const { competitionId, formId, data, files } = parseResult.data;

    // 4. Verifikasi status kompetisi
    const comp = await getCompetitionById(competitionId);
    if (!comp) {
      return {
        success: false,
        error: "Kompetisi tidak ditemukan.",
      };
    }

    if (comp.status !== CompetitionStatus.OPEN) {
      return {
        success: false,
        error: "Pendaftaran untuk cabang kegiatan ini sedang ditutup atau belum dibuka.",
      };
    }

    // 5. Simpan Data Pendaftar
    const registration = await createRegistration({
      competitionId,
      formId,
      data,
      files,
      ipAddress: ip,
      userAgent,
    });

    revalidatePath("/dashboard/registrations");

    return {
      success: true,
      message: `Pendaftaran berhasil dikirim! Simpan Nomor Registrasi Anda: ${registration.registrationNumber}`,
      data: {
        id: registration.id,
        registrationNumber: registration.registrationNumber,
      },
    };
  } catch (error: any) {
    console.error("Error submitRegistrationAction:", error);
    return {
      success: false,
      error: error.message || "Terjadi kesalahan saat memproses pendaftaran.",
    };
  }
}
