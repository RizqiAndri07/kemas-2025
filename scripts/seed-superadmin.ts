import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { usersTable } from "../modules/auth/infrastructure/user.table";
import { eq } from "drizzle-orm";

async function seedSuperadmin() {
  console.log("🌱 Memulai inisialisasi akun Superadmin pertama...");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("❌ NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY wajib ada di .env");
    process.exit(1);
  }

  if (!dbUrl) {
    console.error("❌ DATABASE_URL atau DIRECT_URL wajib ada di .env");
    process.exit(1);
  }

  const superadminEmail = process.env.SUPERADMIN_EMAIL || "superadmin@kemasprasasti.com";
  const superadminPassword = process.env.SUPERADMIN_PASSWORD || "Kemas2025!Superadmin";
  const superadminUsername = "superadmin";

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const sql = postgres(dbUrl, { max: 1 });
  const db = drizzle(sql);

  try {
    // 1. Cek apakah user sudah ada di Supabase Auth
    console.log(`🔍 Memeriksa akun Supabase Auth: ${superadminEmail}...`);
    const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
      throw listError;
    }

    let authUser = listData.users.find(
      (u) => u.email?.toLowerCase() === superadminEmail.toLowerCase()
    );

    if (!authUser) {
      console.log("👤 Membuat user baru di Supabase Auth...");
      const { data: createData, error: createError } = await supabase.auth.admin.createUser({
        email: superadminEmail,
        password: superadminPassword,
        email_confirm: true,
        user_metadata: {
          username: superadminUsername,
          role: "SUPERADMIN",
        },
      });

      if (createError || !createData.user) {
        throw createError || new Error("Gagal membuat user di Supabase Auth");
      }
      authUser = createData.user;
      console.log(`✅ User Supabase Auth berhasil dibuat! ID: ${authUser.id}`);
    } else {
      console.log(`ℹ️ User Supabase Auth sudah ada (ID: ${authUser.id}). Memperbarui kata sandi...`);
      await supabase.auth.admin.updateUserById(authUser.id, {
        password: superadminPassword,
        email_confirm: true,
        user_metadata: {
          username: superadminUsername,
          role: "SUPERADMIN",
        },
      });
      console.log("✅ Kata sandi akun Supabase Auth diperbarui!");
    }

    // 2. Cek apakah record sudah ada di database PostgreSQL
    console.log("🔍 Menyinkronkan ke PostgreSQL usersTable...");
    const existingDbUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, superadminEmail));

    if (existingDbUser.length === 0) {
      await db.insert(usersTable).values({
        id: authUser.id,
        username: superadminUsername,
        email: superadminEmail,
        role: "SUPERADMIN",
        status: "verified",
      });
      console.log("✅ Data Superadmin berhasil dimasukkan ke PostgreSQL usersTable!");
    } else {
      await db
        .update(usersTable)
        .set({
          id: authUser.id,
          role: "SUPERADMIN",
          status: "verified",
          updatedAt: new Date(),
        })
        .where(eq(usersTable.email, superadminEmail));
      console.log("✅ Data Superadmin di PostgreSQL usersTable diperbarui!");
    }

    console.log("\n==================================================");
    console.log("🎉 AKUN SUPERADMIN SIAP DIGUNAKAN!");
    console.log(`📧 Email       : ${superadminEmail}`);
    console.log(`🔑 Kata Sandi  : ${superadminPassword}`);
    console.log(`🛡️ Role        : SUPERADMIN`);
    console.log("==================================================\n");
  } catch (error) {
    console.error("❌ Terjadi kesalahan saat seeding:", error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

seedSuperadmin();
