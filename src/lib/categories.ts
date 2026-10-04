import { Category, CategoryRow } from "@/types";

/** DB-ийн хавтгай мөрүүдийг (parent_slug-аар) үүсэл/дэд ангилал болгож нэгтгэнэ. */
export function nestCategories(rows: CategoryRow[]): Category[] {
  const parents = rows.filter((r) => !r.parent_slug);
  return parents.map((parent) => ({
    slug: parent.slug,
    name: parent.name,
    description: parent.description,
    image: parent.image,
    subcategories: rows
      .filter((r) => r.parent_slug === parent.slug)
      .map((r) => ({ slug: r.slug, name: r.name })),
  }));
}
