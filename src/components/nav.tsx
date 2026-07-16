import { DesktopNav } from "@/components/nav/desktop-nav";
import { MobileNav } from "@/components/nav/mobile-nav";
import type { Category, PaymentAccount, PaymentType, Tag } from "@/lib/types";

export function Nav({
  email,
  categories,
  paymentTypes,
  paymentAccounts,
  tags,
}: {
  email: string;
  categories: Category[];
  paymentTypes: PaymentType[];
  paymentAccounts: PaymentAccount[];
  tags: Tag[];
}) {
  return (
    <>
      <DesktopNav email={email} />
      <MobileNav
        email={email}
        categories={categories}
        paymentTypes={paymentTypes}
        paymentAccounts={paymentAccounts}
        tags={tags}
      />
    </>
  );
}
