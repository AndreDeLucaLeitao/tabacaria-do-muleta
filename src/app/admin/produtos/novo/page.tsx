import { ProductForm } from "../product-form";

export default function NovoProdutoPage() {
  return (
    <div>
      <h2 className="mb-6 text-2xl text-cream-100">Novo produto</h2>
      <ProductForm mode="create" />
    </div>
  );
}
