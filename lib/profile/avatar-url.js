/**
 * Append a version query so replaced storage objects bypass browser cache.
 * @param {string | null | undefined} avatarUrl
 * @param {Date | string | number | null | undefined} version
 */
export function avatarDisplayUrl(avatarUrl, version) {
  if (!avatarUrl) return null;
  const base = avatarUrl.split("?")[0];
  const t =
    version instanceof Date
      ? version.getTime()
      : version
        ? new Date(version).getTime()
        : Date.now();
  return `${base}?v=${t}`;
}
