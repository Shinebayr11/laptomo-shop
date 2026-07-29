/**
 * Хуучин (хэрэглэгчээр салгаагүй) localStorage түлхүүрүүдийг нэг л удаа цэвэрлэнэ.
 * Provider бүр mount болох болгонд давтагдахаас сэргийлж тэмдэглэгээ үлдээдэг.
 */
function markDone(flag: string) {
  try {
    localStorage.setItem(flag, "1");
  } catch {
    /* алгасна */
  }
}

function alreadyDone(flag: string) {
  try {
    return localStorage.getItem(flag) === "1";
  } catch {
    return true;
  }
}

/** Хуучин түлхүүрийг ганц удаа устгана. */
export function dropLegacyKey(legacyKey: string) {
  const flag = `laptomo_legacy_dropped_${legacyKey}`;
  if (alreadyDone(flag)) return;

  try {
    localStorage.removeItem(legacyKey);
  } catch {
    /* алгасна */
  }
  markDone(flag);
}

/**
 * Хуучин түлхүүрийн утгыг шинэ түлхүүр рүү ганц удаа зөөнө.
 * Шинэ түлхүүрт өгөгдөл байвал хөндөхгүй — өгөгдөл дарагдахаас сэргийлнэ.
 */
export function migrateLegacyKey(legacyKey: string, targetKey: string) {
  const flag = `laptomo_legacy_moved_${legacyKey}`;
  if (alreadyDone(flag)) return;

  try {
    const legacyValue = localStorage.getItem(legacyKey);
    const moved =
      legacyValue !== null && localStorage.getItem(targetKey) === null;

    if (moved) localStorage.setItem(targetKey, legacyValue);
    localStorage.removeItem(legacyKey);

    // useLocalStorage аль хэдийн хоосон утга уншсан байж болзошгүй тул
    // шинэ түлхүүрийг дахин уншуулах event илгээнэ.
    if (moved) {
      window.dispatchEvent(
        new CustomEvent("laptomo-local-storage", {
          detail: { key: targetKey },
        }),
      );
    }
  } catch {
    /* алгасна */
  }
  markDone(flag);
}
