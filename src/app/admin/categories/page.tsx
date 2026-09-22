"use client";
import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { CategoryRow } from "@/types";
import { useAdmin } from "@/store/AdminContext";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { AdminError } from "@/components/admin/AdminError";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

export default function AdminCategoriesPage() {
  const { categories, ready, saveCategory, deleteCategory, actionError, clearActionError } =
    useAdmin();
  const [editing, setEditing] = useState<CategoryRow | null>(null);
  const [open, setOpen] = useState(false);

  if (!ready) return <p className="text-sm text-muted">Ачааллаж байна...</p>;

  const parents = categories.filter((c) => !c.parent_slug);
  const subsOf = (slug: string) => categories.filter((c) => c.parent_slug === slug);

  const openNew = () => { setEditing(null); setOpen(true); };
  const openEdit = (c: CategoryRow) => { setEditing(c); setOpen(true); };
  const handleSave = async (c: CategoryRow) => {
    if (await saveCategory(c)) setOpen(false);
  };
  const handleDelete = (c: CategoryRow) => {
    const hasChildren = subsOf(c.slug).length > 0;
    const message = hasChildren
      ? `"${c.name}"-г устгавал доторх дэд ангиллууд ч устна. Үргэлжлүүлэх үү?`
      : `"${c.name}"-г устгах уу?`;
    if (!confirm(message)) return;
    if (hasChildren) {
      Promise.all([deleteCategory(c.id), ...subsOf(c.slug).map((s) => deleteCategory(s.id))]);
    } else {
      deleteCategory(c.id);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Ангилал</h1>
          <p className="mt-1 text-sm text-muted">
            Нийт {parents.length} үндсэн ангилал · {categories.length - parents.length} дэд ангилал
          </p>
        </div>
        <Button size="sm" onClick={openNew}><Plus size={16} /> Ангилал нэмэх</Button>
      </header>

      <AdminError message={actionError} onDismiss={clearActionError} />

      {parents.length ? (
        <div className="space-y-4">
          {parents.map((p) => (
            <div key={p.id} className="rounded-2xl border border-line p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-display text-lg text-ink">{p.name}</p>
                  <p className="text-xs uppercase tracking-wide2 text-muted">/{p.slug}</p>
                  {p.description && <p className="mt-1 text-sm text-muted">{p.description}</p>}
                </div>
                <div className="flex shrink-0 gap-2">
                  <button onClick={() => openEdit(p)} className="rounded-lg border border-line p-2 text-muted hover:text-accent" aria-label="Засах"><Pencil size={15} /></button>
                  <button onClick={() => handleDelete(p)} className="rounded-lg border border-line p-2 text-muted hover:text-red-600" aria-label="Устгах"><Trash2 size={15} /></button>
                </div>
              </div>

              {subsOf(p.slug).length > 0 && (
                <ul className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
                  {subsOf(p.slug).map((s) => (
                    <li key={s.id} className="flex items-center gap-2 rounded-full border border-line py-1.5 pl-3 pr-1.5 text-xs text-ink">
                      {s.name}
                      <button onClick={() => openEdit(s)} className="rounded-full p-1 text-muted hover:text-accent" aria-label="Засах"><Pencil size={11} /></button>
                      <button onClick={() => handleDelete(s)} className="rounded-full p-1 text-muted hover:text-red-600" aria-label="Устгах"><Trash2 size={11} /></button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="Ангилал алга" hint="Эхний ангиллаа нэмнэ үү." />
      )}

      {open && (
        <CategoryForm
          initial={editing ?? undefined}
          parents={parents}
          onSave={handleSave}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}
