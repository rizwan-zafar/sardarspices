/** Site-wide brand name, slug, and contact addresses. */
export const brandName = "Sardar Store";
export const brandSlug = "sardarstore";
export const supportEmail = `support@${brandSlug}.com`;
export const adminEmailDefault = `admin@${brandSlug}.com`;
export const teamName = `${brandName} Team`;
export const adminPanelName = `${brandName} Admin`;

export function brandTitle(pageTitle) {
  return pageTitle ? `${pageTitle} | ${brandName}` : brandName;
}
