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

/** Nested Category[]-г админы CRUD-д ашиглах хавтгай мөр болгож задална. */
export function flattenCategories(categories: Category[]): CategoryRow[] {
  const now = new Date().toISOString();
  const rows: CategoryRow[] = [];
  for (const c of categories) {
    rows.push({
      id: crypto.randomUUID(),
      slug: c.slug,
      name: c.name,
      description: c.description,
      image: c.image,
      parent_slug: null,
      created_at: now,
    });
    for (const s of c.subcategories) {
      rows.push({
        id: crypto.randomUUID(),
        slug: s.slug,
        name: s.name,
        description: "",
        image: "",
        parent_slug: c.slug,
        created_at: now,
      });
    }
  }
  return rows;
}

export function findCategoryName(rows: CategoryRow[], slug: string): string | undefined {
  return rows.find((r) => r.slug === slug)?.name;
}
