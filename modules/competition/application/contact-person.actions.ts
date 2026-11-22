"use server";

import { revalidatePath } from "next/cache";
import { contactPersonFormSchema, ContactPersonFormInput } from "../domain/contact-person.schema";
import * as contactPersonRepo from "../infrastructure/contact-person.repository";
import { ContactPersonSelect } from "../infrastructure/contact-person.table";
import { ActionResult } from "@/modules/shared/domain/common.types";
import { requireAuthUser } from "@/modules/auth/application/auth.guard";

export async function getAllContactPersonsAction(): Promise<
  ActionResult<contactPersonRepo.ContactPersonWithCompetitions[]>
> {
  try {
    await requireAuthUser();
    const data = await contactPersonRepo.getAllContactPersons();
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Error fetching contact persons:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal memuat data contact person",
    };
  }
}

export async function createContactPersonAction(
  payload: ContactPersonFormInput
): Promise<ActionResult<ContactPersonSelect>> {
  try {
    await requireAuthUser();

    const validated = contactPersonFormSchema.safeParse(payload);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Validasi data gagal",
      };
    }

    const { name, phone } = validated.data;

    // Bersihkan format nomor HP (hilangkan spasi atau tanda hubung)
    const cleanPhone = phone.trim().replace(/[\s\-]/g, "");

    const newCp = await contactPersonRepo.createContactPerson({
      name: name.trim(),
      phone: cleanPhone,
    });

    try {
      revalidatePath("/dashboard/competition/contact-person");
      revalidatePath("/dashboard/competition/create");
      revalidatePath("/dashboard/competition");
    } catch {
      // Abaikan jika di luar request context
    }

    return {
      success: true,
      data: newCp,
      message: `Contact person "${newCp.name}" berhasil ditambahkan!`,
    };
  } catch (error) {
    console.error("Error creating contact person:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal menambahkan contact person",
    };
  }
}

export async function updateContactPersonAction(
  id: string,
  payload: ContactPersonFormInput
): Promise<ActionResult<ContactPersonSelect>> {
  try {
    await requireAuthUser();

    const validated = contactPersonFormSchema.safeParse(payload);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Validasi data gagal",
      };
    }

    const { name, phone } = validated.data;
    const cleanPhone = phone.trim().replace(/[\s\-]/g, "");

    const updated = await contactPersonRepo.updateContactPerson(id, {
      name: name.trim(),
      phone: cleanPhone,
    });

    if (!updated) {
      return {
        success: false,
        error: "Data contact person tidak ditemukan",
      };
    }

    try {
      revalidatePath("/dashboard/competition/contact-person");
      revalidatePath("/dashboard/competition");
    } catch {
      // Abaikan jika di luar request context
    }

    return {
      success: true,
      data: updated,
      message: `Contact person "${updated.name}" berhasil diperbarui!`,
    };
  } catch (error) {
    console.error("Error updating contact person:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal memperbarui contact person",
    };
  }
}

export async function deleteContactPersonAction(id: string): Promise<ActionResult<void>> {
  try {
    await requireAuthUser();

    const deleted = await contactPersonRepo.deleteContactPerson(id);
    if (!deleted) {
      return {
        success: false,
        error: "Contact person gagal dihapus atau tidak ditemukan",
      };
    }

    try {
      revalidatePath("/dashboard/competition/contact-person");
      revalidatePath("/dashboard/competition");
    } catch {
      // Abaikan jika di luar request context
    }

    return {
      success: true,
      message: "Contact person berhasil dihapus!",
    };
  } catch (error) {
    console.error("Error deleting contact person:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal menghapus contact person",
    };
  }
}
