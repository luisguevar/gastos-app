"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import type { Category, PaymentType, Tag } from "@/lib/types";
import { detectPreset, isDefaultState, presetRange, type Preset } from "./shared";
import { DesktopFilters } from "./desktop";
import { MobileFilters } from "./mobile";

export function DashboardFilters({
  categories,
  tags,
  paymentTypes,
  defaultFrom,
  defaultTo,
}: {
  categories: Category[];
  tags: Tag[];
  paymentTypes: PaymentType[];
  defaultFrom: string;
  defaultTo: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const from = searchParams.get("from") || defaultFrom;
  const to = searchParams.get("to") || defaultTo;
  const categoryId = searchParams.get("categoryId") ?? "";
  const tagId = searchParams.get("tagId") ?? "";
  const paymentTypeId = searchParams.get("paymentTypeId") ?? "";
  const preset = detectPreset(from, to);
  const showClear = !isDefaultState(preset, categoryId, tagId, paymentTypeId);

  function update(patch: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  function applyPreset(p: Exclude<Preset, "custom">) {
    update(presetRange(p));
  }

  function clearAll() {
    router.push(pathname);
  }

  return (
    <>
      <DesktopFilters
        preset={preset}
        from={from}
        to={to}
        categoryId={categoryId}
        tagId={tagId}
        paymentTypeId={paymentTypeId}
        categories={categories}
        tags={tags}
        paymentTypes={paymentTypes}
        showClear={showClear}
        onPreset={applyPreset}
        onDateChange={update}
        onFilterChange={update}
        onClear={clearAll}
      />
      <MobileFilters
        preset={preset}
        from={from}
        to={to}
        categoryId={categoryId}
        tagId={tagId}
        paymentTypeId={paymentTypeId}
        categories={categories}
        tags={tags}
        paymentTypes={paymentTypes}
        showClear={showClear}
        onPreset={applyPreset}
        onApply={update}
        onClear={clearAll}
      />
    </>
  );
}
