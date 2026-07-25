import { cookies } from "next/headers";
import {
  ARCHIVE_OVERRIDES_COOKIE_KEY,
  ArchiveOverrides,
  parseArchiveOverrides,
} from "./archive-overrides";

export function getArchiveOverridesFromCookie(): ArchiveOverrides {
  try {
    return parseArchiveOverrides(
      cookies().get(ARCHIVE_OVERRIDES_COOKIE_KEY)?.value,
    );
  } catch {
    return {};
  }
}
