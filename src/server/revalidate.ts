// Thin wrapper so server-action modules can revalidate without importing next/cache directly in tests.
export { revalidatePath } from "next/cache";
