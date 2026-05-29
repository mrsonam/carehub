import { requireAdminUser } from "@/lib/auth-server";
import { readSearchQuery } from "@/lib/dashboard-search";
import { searchAdminResults } from "@/lib/dashboard-search-data";
import { DashboardSearchResults } from "@/app/components/dashboard/DashboardSearchResults";

export const dynamic = "force-dynamic";

export default async function AdminSearchPage({ searchParams }) {
  await requireAdminUser("/admin/search");
  const sp = await Promise.resolve(searchParams);
  const query = readSearchQuery(sp?.q);
  const results = await searchAdminResults(query);

  return (
    <div className="max-w-4xl mx-auto w-full flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold font-manrope tracking-tight">Search</h1>
        <p className="text-sm text-foreground/55 mt-1">
          Find patients, clinicians, and appointments across the clinic.
        </p>
      </div>
      <DashboardSearchResults query={query} {...results} />
    </div>
  );
}
