import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCategories, getPaymentAccounts, getPaymentTypes, getTags } from "@/lib/queries";
import { Sidebar } from "@/components/nav/sidebar";
import { MobileNav } from "@/components/nav/mobile-nav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [categories, paymentTypes, paymentAccounts, tags] = await Promise.all([
    getCategories(supabase, { activeOnly: true }),
    getPaymentTypes(supabase, { activeOnly: true }),
    getPaymentAccounts(supabase, { activeOnly: true }),
    getTags(supabase, { activeOnly: true }),
  ]);

  const email = user.email ?? "";

  return (
    <div className="md:flex md:min-h-screen">
      <Sidebar email={email} />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileNav
          email={email}
          categories={categories}
          paymentTypes={paymentTypes}
          paymentAccounts={paymentAccounts}
          tags={tags}
        />
        <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 pb-24 md:pb-8">
          {children}
        </main>
      </div>
    </div>
  );
}
