export const REQUEST_STATUSES = ["new", "in_progress", "fulfilled"] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];
