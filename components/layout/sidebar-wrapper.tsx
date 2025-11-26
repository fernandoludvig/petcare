import { Sidebar } from "./sidebar";
import { getCurrentUser } from "@/lib/auth";

export async function SidebarWrapper() {
  const currentUser = await getCurrentUser();
  const userRole = currentUser?.role || null;

  return <Sidebar userRole={userRole} />;
}

