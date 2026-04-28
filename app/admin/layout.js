import { DashboardRoleLayout } from "../components/dashboard/DashboardRoleLayout";

export const dynamic = "force-dynamic";

export default function AdminLayout({ children }) {
  return <DashboardRoleLayout>{children}</DashboardRoleLayout>;
}
