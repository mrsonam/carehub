export const dynamic = "force-dynamic";

export default function DashboardSetupLayout({ children }) {
  // Auth + access checks already live in the setup pages themselves.
  // Keeping this layout "flat" prevents double dashboard chrome (double navbar/header).
  return children;
}
