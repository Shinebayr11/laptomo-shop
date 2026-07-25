"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Archive, CheckSquare, Plus, Search } from "lucide-react";
import { Product } from "@/types";
import { useAdmin } from "@/store/AdminContext";
import { ProductTable } from "@/components/admin/ProductTable";
import { ProductForm } from "@/components/admin/ProductForm";
import { Select, TextInput } from "@/components/admin/AdminField";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { CATEGORIES } from "@/constants/categories";

export default function AdminProductsPage() {
  const { products, ready, saveProduct, archiveProduct, archiveProducts } = useAdmin();
  const [editing, setEditing] = useState<Product | null>(null);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [archiveCategory, setArchiveCategory] = useState("");

  const filtered = products.filter((p) => p.title.toLowerCase().includes(q.toLowerCase()));
  const filteredIds = filtered.map((p) => p.id);
  const allSelected =
    filteredIds.length > 0 && filteredIds.every((id) => selectedIds.includes(id));
  const categoryArchiveIds = archiveCategory
    ? products
        .filter((p) => p.category === archiveCategory)
        .map((p) => p.id)
    : [];
  const archiveCategoryName =
    CATEGORIES.find((category) => category.slug === archiveCategory)?.name ??
    "ангилал";

  useEffect(() => {
    setSelectedIds((prev) => prev.filter((id) => products.some((p) => p.id === id)));
  }, [products]);

  if (!ready) return <p className="text-sm text-muted">Ачааллаж байна...</p>;

  const openNew = () => { setEditing(null); setOpen(true); };
  const openEdit = (p: Product) => { setEditing(p); setOpen(true); };
  const handleSave = (p: Product) => { saveProduct(p); setOpen(false); };
  const handleArchive = (p: Product) => { if (confirm(`"${p.title}"-г дэлгүүрээс нууж архивлах уу?`)) archiveProduct(p.id); };
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };
  const toggleSelectAll = () => {
    setSelectedIds((prev) => {
      if (allSelected) return prev.filter((id) => !filteredIds.includes(id));
      return Array.from(new Set([...prev, ...filteredIds]));
    });
  };
  const handleBulkArchive = async () => {
    if (!selectedIds.length) return;
    if (confirm(`${selectedIds.length} бүтээгдэхүүнийг архив руу оруулах уу?`)) {
      await archiveProducts(selectedIds);
      setSelectedIds([]);
    }
  };
  const handleCategoryArchive = async () => {
    if (!archiveCategory || !categoryArchiveIds.length) return;
    if (
      confirm(
        `"${archiveCategoryName}" ангиллын ${categoryArchiveIds.length} бүтээгдэхүүнийг архив руу оруулах уу?`,
      )
    ) {
      await archiveProducts(categoryArchiveIds);
      setArchiveCategory("");
      setSelectedIds([]);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Бүтээгдэхүүн</h1>
          <p className="mt-1 text-sm text-muted">Нийт {products.length} идэвхтэй бүтээгдэхүүн</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/archive"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-line px-4 py-2 text-xs font-medium uppercase tracking-wide2 text-ink transition-all duration-300 hover:border-accent hover:text-accent"
          >
            <Archive size={16} /> Архив
          </Link>
          <Button size="sm" onClick={openNew}><Plus size={16} /> Шинэ нэмэх</Button>
        </div>
      </header>

      <div className="grid items-start gap-3 xl:grid-cols-[minmax(260px,340px)_minmax(0,1fr)]">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <TextInput
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Нэрээр хайх..."
            className="h-12 pl-9"
          />
        </div>

        <div className="grid min-h-12 gap-2 rounded-lg border border-line bg-surface/40 p-1.5 sm:grid-cols-[minmax(220px,1fr)_auto] sm:items-center lg:grid-cols-[minmax(220px,1fr)_auto_auto]">
          <div className="min-w-0">
            <Select
              value={archiveCategory}
              onChange={(e) => setArchiveCategory(e.target.value)}
              aria-label="Архивлах ангилал сонгох"
              className="h-9"
            >
              <option value="">Ангиллаар архивлах...</option>
              {CATEGORIES.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </Select>
          </div>
          <span className="hidden whitespace-nowrap px-2 text-sm text-muted lg:inline">
            {archiveCategory
              ? `${categoryArchiveIds.length} бараа`
              : "Ангилал сонгоно уу"}
          </span>
          <Button
            size="sm"
            onClick={handleCategoryArchive}
            disabled={!archiveCategory || !categoryArchiveIds.length}
            className="h-9 whitespace-nowrap"
          >
            <Archive size={16} /> Ангиллыг архивлах
          </Button>
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface/50 px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-ink">
            <CheckSquare size={17} className="text-accent" />
            <span>{selectedIds.length} бүтээгдэхүүн сонгогдсон</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setSelectedIds([])}>
              Сонголт цэвэрлэх
            </Button>
            <Button size="sm" onClick={handleBulkArchive}>
              <Archive size={16} /> Архивлах
            </Button>
          </div>
        </div>
      )}

      {filtered.length ? (
        <ProductTable
          products={filtered}
          selectedIds={selectedIds}
          allSelected={allSelected}
          onToggleSelect={toggleSelect}
          onToggleSelectAll={toggleSelectAll}
          onEdit={openEdit}
          onArchive={handleArchive}
        />
      ) : (
        <EmptyState title="Бүтээгдэхүүн олдсонгүй" hint="Хайлтаа өөрчлөх эсвэл шинэ бүтээгдэхүүн нэмнэ үү." />
      )}

      {open && <ProductForm initial={editing ?? undefined} onSave={handleSave} onClose={() => setOpen(false)} />}
    </div>
  );
}
