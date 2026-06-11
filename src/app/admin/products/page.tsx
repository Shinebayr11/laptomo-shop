"use client";
import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Product } from "@/types";
import { useAdmin } from "@/store/AdminContext";
import { ProductTable } from "@/components/admin/ProductTable";
import { ProductForm } from "@/components/admin/ProductForm";
import { TextInput } from "@/components/admin/AdminField";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

export default function AdminProductsPage() {
  const { products, ready, saveProduct, deleteProduct } = useAdmin();
  const [editing, setEditing] = useState<Product | null>(null);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  if (!ready) return <p className="text-sm text-muted">Ачааллаж байна...</p>;

  const filtered = products.filter((p) => p.title.toLowerCase().includes(q.toLowerCase()));

  const openNew = () => { setEditing(null); setOpen(true); };
  const openEdit = (p: Product) => { setEditing(p); setOpen(true); };
  const handleSave = (p: Product) => { saveProduct(p); setOpen(false); };
  const handleDelete = (p: Product) => { if (confirm(`"${p.title}"-г устгах уу?`)) deleteProduct(p.id); };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Бүтээгдэхүүн</h1>
          <p className="mt-1 text-sm text-muted">Нийт {products.length} бүтээгдэхүүн</p>
        </div>
        <Button size="sm" onClick={openNew}><Plus size={16} /> Шинэ нэмэх</Button>
      </header>

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <TextInput value={q} onChange={(e) => setQ(e.target.value)} placeholder="Нэрээр хайх..." className="pl-9" />
      </div>

      {filtered.length ? (
        <ProductTable products={filtered} onEdit={openEdit} onDelete={handleDelete} />
      ) : (
        <EmptyState title="Бүтээгдэхүүн олдсонгүй" hint="Хайлтаа өөрчлөх эсвэл шинэ бүтээгдэхүүн нэмнэ үү." />
      )}

      {open && <ProductForm initial={editing ?? undefined} onSave={handleSave} onClose={() => setOpen(false)} />}
    </div>
  );
}
