export const CAT_STATUSES = ["available", "pending", "adopted", "not_listed"] as const;
export type CatStatus = (typeof CAT_STATUSES)[number];
