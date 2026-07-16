"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type CatalogActionState = {
  error?: string;
};

type CatalogTable = "categories" | "tags" | "payment_types" | "payment_accounts";

async function createCatalogItem(
  table: CatalogTable,
  name: string
): Promise<CatalogActionState> {
  const trimmed = name.trim();
  if (!trimmed) {
    return { error: "El nombre no puede estar vacío." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from(table).insert({
    user_id: user.id,
    name: trimmed,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "Ya existe un registro con ese nombre." };
    }
    return { error: "No se pudo crear. Intenta de nuevo." };
  }

  revalidatePath("/configuracion");
  revalidatePath("/gastos");
  revalidatePath("/dashboard");
  return {};
}

async function setCatalogActive(table: CatalogTable, id: string, activa: boolean) {
  const supabase = await createClient();
  await supabase.from(table).update({ activa }).eq("id", id);
  revalidatePath("/configuracion");
  revalidatePath("/gastos");
  revalidatePath("/dashboard");
}

export async function createCategory(_prev: CatalogActionState, formData: FormData) {
  return createCatalogItem("categories", String(formData.get("name") ?? ""));
}
export async function setCategoryActive(id: string, activa: boolean) {
  return setCatalogActive("categories", id, activa);
}

export async function createTag(_prev: CatalogActionState, formData: FormData) {
  return createCatalogItem("tags", String(formData.get("name") ?? ""));
}
export async function setTagActive(id: string, activa: boolean) {
  return setCatalogActive("tags", id, activa);
}

export async function createPaymentType(_prev: CatalogActionState, formData: FormData) {
  return createCatalogItem("payment_types", String(formData.get("name") ?? ""));
}
export async function setPaymentTypeActive(id: string, activa: boolean) {
  return setCatalogActive("payment_types", id, activa);
}

export async function createPaymentAccount(
  _prev: CatalogActionState,
  formData: FormData
): Promise<CatalogActionState> {
  const trimmed = String(formData.get("name") ?? "").trim();
  const paymentTypeId = String(formData.get("payment_type_id") ?? "");

  if (!trimmed) return { error: "El nombre no puede estar vacío." };
  if (!paymentTypeId) return { error: "Selecciona a qué tipo de pago pertenece." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("payment_accounts").insert({
    user_id: user.id,
    name: trimmed,
    payment_type_id: paymentTypeId,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "Ya existe una cuenta con ese nombre." };
    }
    return { error: "No se pudo crear. Intenta de nuevo." };
  }

  revalidatePath("/configuracion");
  revalidatePath("/gastos");
  revalidatePath("/dashboard");
  return {};
}
export async function setPaymentAccountActive(id: string, activa: boolean) {
  return setCatalogActive("payment_accounts", id, activa);
}

/** Crea una etiqueta desde el selector inline del formulario de gasto y la
 * devuelve ya creada, para que el cliente la agregue a la selección sin
 * recargar la página. */
export async function createTagInline(
  name: string
): Promise<{ id: string; name: string } | { error: string }> {
  const trimmed = name.trim();
  if (!trimmed) return { error: "El nombre no puede estar vacío." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data, error } = await supabase
    .from("tags")
    .insert({ user_id: user.id, name: trimmed })
    .select("id,name")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { error: "Ya existe una etiqueta con ese nombre." };
    }
    return { error: "No se pudo crear la etiqueta." };
  }

  revalidatePath("/configuracion");
  return data;
}
