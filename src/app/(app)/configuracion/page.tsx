import { createClient } from "@/lib/supabase/server";
import { getCategories, getPaymentAccounts, getPaymentTypes, getPeople, getTags } from "@/lib/queries";
import {
  createCategory,
  createPaymentType,
  createPerson,
  createTag,
  renameCategory,
  renamePaymentType,
  renamePerson,
  renameTag,
  setCategoryActive,
  setCategoryIcon,
  setPaymentTypeActive,
  setPersonActive,
  setTagActive,
} from "@/app/actions/catalogs";
import { Tabs } from "@/components/config/tabs";
import { CatalogManager } from "@/components/config/catalog-manager";
import { CategoryManager } from "@/components/config/category-manager";
import { PaymentAccountManager } from "@/components/config/payment-account-manager";

export const dynamic = "force-dynamic";

export default async function ConfiguracionPage() {
  const supabase = await createClient();

  const [categories, tags, paymentTypes, paymentAccounts, people] = await Promise.all([
    getCategories(supabase),
    getTags(supabase),
    getPaymentTypes(supabase),
    getPaymentAccounts(supabase),
    getPeople(supabase),
  ]);

  return (
    <>
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-ink-muted">Bóveda</p>
        <h1 className="font-display text-xl font-semibold text-ink">Configuración</h1>
      </header>

      <section className="vault-card px-6 py-6">
        <Tabs
          tabs={[
            {
              key: "categorias",
              label: "Categorías",
              content: (
                <CategoryManager
                  items={categories}
                  createAction={createCategory}
                  toggleAction={setCategoryActive}
                  renameAction={renameCategory}
                  setIconAction={setCategoryIcon}
                />
              ),
            },
            {
              key: "etiquetas",
              label: "Etiquetas",
              content: (
                <CatalogManager
                  items={tags}
                  createAction={createTag}
                  toggleAction={setTagActive}
                  renameAction={renameTag}
                  placeholder="Nueva etiqueta…"
                />
              ),
            },
            {
              key: "personas",
              label: "Personas",
              content: (
                <CatalogManager
                  items={people}
                  createAction={createPerson}
                  toggleAction={setPersonActive}
                  renameAction={renamePerson}
                  placeholder="Nueva persona…"
                />
              ),
            },
            {
              key: "cuentas",
              label: "Cuentas y tarjetas",
              content: (
                <div className="flex flex-col gap-8">
                  <div>
                    <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-ink-muted">
                      Tipos de pago
                    </h3>
                    <CatalogManager
                      items={paymentTypes}
                      createAction={createPaymentType}
                      toggleAction={setPaymentTypeActive}
                      renameAction={renamePaymentType}
                      placeholder="Nuevo tipo de pago…"
                    />
                  </div>
                  <div>
                    <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-ink-muted">
                      Cuentas y tarjetas
                    </h3>
                    <PaymentAccountManager items={paymentAccounts} paymentTypes={paymentTypes} />
                  </div>
                </div>
              ),
            },
          ]}
        />
      </section>
    </>
  );
}
