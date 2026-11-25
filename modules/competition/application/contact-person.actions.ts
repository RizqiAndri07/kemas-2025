"use server";

import { revalidatePath } from "next/cache";
import { apiClient } from "@/lib/api-client";
import {
  contactPersonFormSchema,
  ContactPersonFormInput,
} from "../domain/contact-person.schema";
import { ContactPersonSelect } from "../infrastructure/contact-person.table";
import { ActionResult } from "@/modules/shared/domain/common.types";

export async function getAllContactPersonsAction(): Promise<
  ActionResult<ContactPersonSelect[]>
> {
  try {
    const res = await apiClient<ContactPersonSelect[]>("competitions/contact-persons");
    return {
      success: true,
      data: res.data || [],
    };
  } catch (error) {
    console.error("Error fetching contact persons:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal memuat contact persons",
    };
  }
}

export async function createContactPersonAction(
  payload: ContactPersonFormInput
): Promise<ActionResult<ContactPersonSelect>> {
  try {
    const validated = contactPersonFormSchema.safeParse(payload);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Validasi gagal",
      };
    }

    const res = await apiClient<ContactPersonSelect>("competitions/contact-persons", {
      method: "POST",
      body: JSON.stringify(validated.data),
    });

    if (!res.success || !res.data) {
      return {
        success: false,
        error: res.error || "Gagal menambahkan contact person",
      };
    }

    revalidatePath("/dashboard/competition/contact-person");
    revalidatePath("/dashboard/competition");

    return {
      success: true,
      message: res.message || "Contact person berhasil ditambahkan!",
      data: res.data,
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
    const validated = contactPersonFormSchema.safeParse(payload);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Validasi gagal",
      };
    }

    const res = await apiClient<ContactPersonSelect>(`competitions/contact-persons/${id}`, {
      method: "PUT",
      body: JSON.stringify(validated.data),
    });

    if (!res.success || !res.data) {
      return {
        success: false,
        error: res.error || "Gagal memperbarui contact person",
      };
    }

    revalidatePath("/dashboard/competition/contact-person");
    revalidatePath("/dashboard/competition");

    return {
      success: true,
      message: res.message || "Contact person berhasil diperbarui!",
      data: res.data,
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
    const res = await apiClient(`competitions/contact-persons/${id}`, {
      method: "DELETE",
    });

    if (!res.success) {
      return {
        success: false,
        error: res.error || "Gagal menghapus contact person",
      };
    }

    revalidatePath("/dashboard/competition/contact-person");
    revalidatePath("/dashboard/competition");

    return {
      success: true,
      data: undefined,
      message: res.message || "Contact person berhasil dihapus!",
    };
  } catch (error) {
    console.error("Error deleting contact person:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal menghapus contact person",
    };
  }
}
