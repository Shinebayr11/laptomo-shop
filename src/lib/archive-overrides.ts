export type ArchiveOverrides = Record<string, boolean>;

export const ARCHIVE_OVERRIDES_STORAGE_KEY = "laptomo_admin_archive_overrides";
export const ARCHIVE_OVERRIDES_COOKIE_KEY = "laptomo_archive_overrides";

const ARCHIVE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

type ArchivableProduct = {
  id: string;
  is_archived?: boolean;
};

export function parseArchiveOverrides(
  value: string | null | undefined,
): ArchiveOverrides {
  if (!value) return {};

  try {
    const decoded = decodeURIComponent(value);
    const parsed = JSON.parse(decoded) as unknown;

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }

    return Object.fromEntries(
      Object.entries(parsed).filter((entry): entry is [string, boolean] => {
        const [id, archived] = entry;
        return Boolean(id) && typeof archived === "boolean";
      }),
    );
  } catch {
    return {};
  }
}

export function applyArchiveOverrides<T extends ArchivableProduct>(
  products: T[],
  overrides: ArchiveOverrides,
): T[] {
  return products.map((product) =>
    product.id in overrides
      ? { ...product, is_archived: overrides[product.id] }
      : product,
  );
}

export function visibleProducts<T extends ArchivableProduct>(products: T[]): T[] {
  return products.filter((product) => !product.is_archived);
}

export function writeArchiveOverridesCookie(overrides: ArchiveOverrides) {
  if (typeof document === "undefined") return;

  const value = encodeURIComponent(JSON.stringify(overrides));
  document.cookie = `${ARCHIVE_OVERRIDES_COOKIE_KEY}=${value}; Path=/; Max-Age=${ARCHIVE_COOKIE_MAX_AGE}; SameSite=Lax`;
}
