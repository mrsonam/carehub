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
    <div className="max-w-4xl mx-auto w-full flex flex-col gap-8 sm:gap-10">
      <header className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold font-manrope tracking-tight">Search</h1>
        <p className="text-sm sm:text-[15px] text-foreground/55 leading-relaxed max-w-2xl">
          Find patients, clinicians, and appointments across the clinic.
        </p>
      </header>
      <DashboardSearchResults query={query} {...results} />
    </div>
  );
}
