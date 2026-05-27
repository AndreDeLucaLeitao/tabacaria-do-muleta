import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "../product-form";
import type { Product } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function EditarProdutoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();

  return (
    <div>
      <h2 className="mb-6 text-2xl text-cream-100">Editar produto</h2>
      <ProductForm mode="edit" product={data as Product} />
    </div>
  );
}
