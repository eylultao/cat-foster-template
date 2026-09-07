export const APPLICATION_STATUSES = ["new", "reviewing", "approved", "declined"] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];
