"use client";

import { useEffect, useState } from "react";
import { IconChevronDown, IconCircle, IconCircleCheck } from "@tabler/icons-react";
import { Modal } from "@/components/modal";
import { iconForPaymentType, paymentTypeRequiresAccount } from "@/lib/payment-icons";
import type { PaymentAccount, PaymentType } from "@/lib/types";

export function PaymentMethodPicker({
  paymentTypes,
  paymentAccounts,
  defaultPaymentTypeId,
  defaultPaymentAccountId,
}: {
  paymentTypes: PaymentType[];
  paymentAccounts: PaymentAccount[];
  defaultPaymentTypeId?: string;
  defaultPaymentAccountId?: string | null;
}) {
  const [typeId, setTypeId] = useState(defaultPaymentTypeId ?? "");
  const [accountId, setAccountId] = useState<string | null>(defaultPaymentAccountId ?? null);
  const [open, setOpen] = useState(false);
  const [draftTypeId, setDraftTypeId] = useState(typeId);
  const [draftAccountId, setDraftAccountId] = useState<string | null>(accountId);

  useEffect(() => {
    if (open) {
      setDraftTypeId(typeId);
      setDraftAccountId(accountId);
    }
  }, [open, typeId, accountId]);

  const selectedType = paymentTypes.find((t) => t.id === typeId);
  const selectedAccount = paymentAccounts.find((a) => a.id === accountId);
  const draftType = paymentTypes.find((t) => t.id === draftTypeId);
  const showAccounts = draftType ? paymentTypeRequiresAccount(draftType.name) : false;
  const draftAccounts = paymentAccounts.filter((a) => a.payment_type_id === draftTypeId);

  const ButtonIcon = selectedType ? iconForPaymentType(selectedType.name) : null;
  const summary = selectedType
    ? selectedType.name + (selectedAccount ? ` · ${selectedAccount.name}` : "")
    : "Selecciona un método de pago";

  function handleSelectType(id: string) {
    setDraftTypeId(id);
    const type = paymentTypes.find((t) => t.id === id);
    if (!type || !paymentTypeRequiresAccount(type.name)) {
      setDraftAccountId(null);
      return;
    }
    setDraftAccountId((current) => {
      if (!current) return current;
      const stillValid = paymentAccounts.some(
        (a) => a.id === current && a.payment_type_id === id
      );
      return stillValid ? current : null;
    });
  }

  function handleDone() {
    setTypeId(draftTypeId);
    setAccountId(draftAccountId);
    setOpen(false);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs uppercase tracking-[0.15em] text-ink-muted">Pago</span>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center justify-between gap-3 rounded-[8px] border border-line bg-card px-3.5 py-3 text-left transition-colors hover:border-gold/60"
      >
        <span className="flex min-w-0 items-center gap-2.5">
          {ButtonIcon ? <ButtonIcon size={18} className="shrink-0 text-gold" /> : null}
          <span className={`truncate text-sm ${selectedType ? "text-ink" : "text-ink-muted"}`}>
            {summary}
          </span>
        </span>
        <IconChevronDown size={18} className="shrink-0 text-ink-muted" />
      </button>

      <input type="hidden" name="payment_type_id" value={typeId} />
      <input type="hidden" name="payment_account_id" value={accountId ?? ""} />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Método de pago"
        overlayClassName="bg-[rgba(0,0,0,0.55)]"
        contentClassName="max-w-[340px] rounded-xl p-5"
        titleClassName="text-[15px] font-medium text-ink"
      >
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <span className="text-[11px] uppercase tracking-[0.15em] text-ink-muted">
              Tipo de pago
            </span>
            <div className="flex flex-wrap gap-2">
              {paymentTypes.map((pt) => {
                const active = pt.id === draftTypeId;
                return (
                  <button
                    key={pt.id}
                    type="button"
                    onClick={() => handleSelectType(pt.id)}
                    className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                      active
                        ? "border-gold bg-gold text-gold-ink"
                        : "border-line bg-transparent text-ink-muted"
                    }`}
                  >
                    {pt.name}
                  </button>
                );
              })}
            </div>
          </div>

          {showAccounts ? (
            <div className="flex flex-col gap-2">
              <span className="text-[11px] text-ink-muted">
                <span className="uppercase tracking-[0.15em]">Cuenta / Tarjeta</span> (opcional)
              </span>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setDraftAccountId(null)}
                  className={`flex items-center gap-2 rounded-[8px] border px-[10px] py-[9px] text-sm transition-colors ${
                    draftAccountId === null
                      ? "border-gold text-ink"
                      : "border-line text-ink-muted"
                  }`}
                >
                  {draftAccountId === null ? (
                    <IconCircleCheck size={18} className="shrink-0 text-gold" />
                  ) : (
                    <IconCircle size={18} className="shrink-0 text-ink-muted" />
                  )}
                  Sin cuenta
                </button>
                {draftAccounts.map((account) => {
                  const active = account.id === draftAccountId;
                  return (
                    <button
                      key={account.id}
                      type="button"
                      onClick={() => setDraftAccountId(account.id)}
                      className={`flex items-center gap-2 rounded-[8px] border px-[10px] py-[9px] text-sm transition-colors ${
                        active ? "border-gold text-ink" : "border-line text-ink-muted"
                      }`}
                    >
                      {active ? (
                        <IconCircleCheck size={18} className="shrink-0 text-gold" />
                      ) : (
                        <IconCircle size={18} className="shrink-0 text-ink-muted" />
                      )}
                      {account.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          <button
            type="button"
            onClick={handleDone}
            disabled={!draftTypeId}
            className="w-full rounded-[8px] bg-gold p-[11px] text-sm font-medium text-gold-ink disabled:opacity-40"
          >
            Listo
          </button>
        </div>
      </Modal>
    </div>
  );
}
