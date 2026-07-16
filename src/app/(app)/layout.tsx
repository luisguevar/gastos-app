import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCategories, getPaymentAccounts, getPaymentTypes, getTags } from "@/lib/queries";
import { Nav } from "@/components/nav";

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

  return (
    <>
      <Nav
        email={user.email ?? ""}
        categories={categories}
        paymentTypes={paymentTypes}
        paymentAccounts={paymentAccounts}
        tags={tags}
      />
      <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8 pb-24 md:pb-8">
        {children}
      </main>
    </>
  );
}
