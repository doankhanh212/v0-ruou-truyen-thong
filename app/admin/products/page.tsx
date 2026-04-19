import { AdminShell } from "@/components/admin/shell";
import { ProductsClient } from "./products-client";

export const dynamic = "force-dynamic";

export default function AdminProductsPage() {
  return (
    <AdminShell>
      <ProductsClient />
    </AdminShell>
  );
}
