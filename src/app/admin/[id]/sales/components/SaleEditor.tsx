"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Copy } from "lucide-react";
import { Paragraph1, Paragraph2 } from "@/common/ui/Text";
import { FormSkeleton } from "@/common/ui/SkeletonLoaders";
import {
  useAdminShopSaleDetail,
} from "@/lib/queries/admin/useShopSales";
import {
  useCreateShopSale,
  useSetShopSaleEnabled,
  useSetShopSaleProducts,
  useUpdateShopSale,
} from "@/lib/mutations/admin";
import type { ShopSaleFormPayload } from "@/lib/api/admin/shopSales";
import { toast } from "sonner";
import SaleItemPicker from "./SaleItemPicker";
import SaleWaitlistCard from "./SaleWaitlistCard";
import SaleDateTimePicker from "./SaleDateTimePicker";
import {
  datetimeLocalToIso,
  formatSaleBannerDateLine,
  formatSalePhaseLabel,
  isoToDatetimeLocal,
  phaseBadgeClass,
  splitDatetimeLocal,
} from "../lib/saleDateTime";
import { buildSaleShopAbsoluteUrl, buildSaleShopHref } from "@/lib/api/shopSale";
import {
  SHOP_SALE_NOTIFY_EMAIL_BODY_PLACEHOLDER,
  SHOP_SALE_NOTIFY_EMAIL_SUBJECT_PLACEHOLDER,
} from "../lib/shopSaleEmailDefaults";
import {
  saleFieldWrapClass,
  saleFieldWideWrapClass,
  saleInputClass,
  saleInputMonoClass,
  saleReadonlyBoxClass,
  saleTextareaClass,
  saleTextareaMonoClass,
} from "../lib/saleFormStyles";

type Tab = "details" | "listings" | "waitlist";

function defaultSchedule() {
  const start = new Date();
  start.setDate(start.getDate() + 1);
  start.setHours(10, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 2);
  end.setHours(23, 59, 0, 0);
  return {
    startsAt: isoToDatetimeLocal(start.toISOString()),
    endsAt: isoToDatetimeLocal(end.toISOString()),
  };
}

type SaleEditorForm = ShopSaleFormPayload & {
  slug: string;
} & Required<
  Pick<
    ShopSaleFormPayload,
    | "isEnabled"
    | "bannerEnabled"
    | "waitlistEnabled"
    | "shopAccessEnabled"
    | "showCountdown"
  >
>;

const defaultForm = (): SaleEditorForm => {
  const schedule = defaultSchedule();
  return {
    internalName: "",
    slug: "",
    headline: "",
    subheadline: formatSaleBannerDateLine(schedule.startsAt, schedule.endsAt),
    shopTitle: "",
    shopDescription: "",
    preSaleMessage: "",
    startsAt: schedule.startsAt,
    endsAt: schedule.endsAt,
    earliestDeliveryAt: "",
    isEnabled: false,
    bannerEnabled: true,
    waitlistEnabled: true,
    shopAccessEnabled: false,
    showCountdown: true,
    notifyEmailSubject: "",
    notifyEmailBody: "",
  };
};

type Props = {
  adminId: string;
  saleId?: string;
};

function ToggleRow({
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-3 py-4 border-b border-gray-100 last:border-0">
      <div>
        <Paragraph1 className="font-medium text-gray-900">{label}</Paragraph1>
        <Paragraph1 className="mt-0.5 text-gray-500 text-sm leading-snug">
          {description}
        </Paragraph1>
      </div>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(!checked)}
        aria-pressed={checked}
        className={`relative shrink-0 inline-flex items-center h-8 w-14 rounded-full transition-colors self-start sm:self-center disabled:opacity-50 ${
          checked ? "bg-gray-900" : "bg-gray-300"
        }`}
      >
        <span
          className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
            checked ? "translate-x-7" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

export default function SaleEditor({ adminId, saleId }: Props) {
  const isNew = !saleId;
  const router = useRouter();
  const { data, isLoading, isError } = useAdminShopSaleDetail(
    isNew ? null : saleId!,
  );
  const createSale = useCreateShopSale();
  const updateSale = useUpdateShopSale();
  const setEnabled = useSetShopSaleEnabled();
  const setProducts = useSetShopSaleProducts();

  const [tab, setTab] = useState<Tab>("details");
  const [form, setForm] = useState<SaleEditorForm>(defaultForm);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [dirtyProducts, setDirtyProducts] = useState(false);
  const [subheadlineManual, setSubheadlineManual] = useState(false);

  useEffect(() => {
    const sale = data?.data;
    if (!sale) return;
    const startsAt = isoToDatetimeLocal(sale.startsAt);
    const endsAt = isoToDatetimeLocal(sale.endsAt);
    const autoLine = formatSaleBannerDateLine(startsAt, endsAt);
    setSubheadlineManual(
      Boolean(sale.subheadline?.trim()) &&
        sale.subheadline.trim() !== autoLine,
    );
    setForm({
      internalName: sale.internalName,
      slug: sale.slug,
      headline: sale.headline,
      subheadline: sale.subheadline ?? "",
      shopTitle: sale.shopTitle,
      shopDescription: sale.shopDescription ?? "",
      preSaleMessage: sale.preSaleMessage ?? "",
      startsAt: isoToDatetimeLocal(sale.startsAt),
      endsAt: isoToDatetimeLocal(sale.endsAt),
      earliestDeliveryAt: isoToDatetimeLocal(sale.earliestDeliveryAt),
      isEnabled: sale.isEnabled,
      bannerEnabled: sale.bannerEnabled,
      waitlistEnabled: sale.waitlistEnabled,
      shopAccessEnabled: sale.shopAccessEnabled,
      showCountdown: sale.showCountdown,
      notifyEmailSubject: sale.notifyEmailSubject ?? "",
      notifyEmailBody: sale.notifyEmailBody ?? "",
    });
    setSelectedProductIds(sale.products.map((p) => p.id));
    setDirtyProducts(false);
  }, [data]);

  useEffect(() => {
    if (subheadlineManual) return;
    const line = formatSaleBannerDateLine(form.startsAt, form.endsAt);
    if (!line) return;
    setForm((prev) =>
      prev.subheadline === line ? prev : { ...prev, subheadline: line },
    );
  }, [form.startsAt, form.endsAt, subheadlineManual]);

  const setField = <K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K],
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const buildPayload = (): ShopSaleFormPayload => ({
    internalName: form.internalName.trim(),
    slug: form.slug.trim() || undefined,
    headline: form.headline.trim(),
    subheadline: form.subheadline?.trim() || undefined,
    shopTitle: form.shopTitle.trim(),
    shopDescription: form.shopDescription?.trim() || undefined,
    preSaleMessage: form.preSaleMessage?.trim() || undefined,
    startsAt: datetimeLocalToIso(form.startsAt),
    endsAt: datetimeLocalToIso(form.endsAt),
    earliestDeliveryAt: form.earliestDeliveryAt
      ? datetimeLocalToIso(form.earliestDeliveryAt)
      : null,
    isEnabled: form.isEnabled,
    bannerEnabled: form.bannerEnabled,
    waitlistEnabled: form.waitlistEnabled,
    shopAccessEnabled: form.shopAccessEnabled,
    showCountdown: form.showCountdown,
    notifyEmailSubject: form.notifyEmailSubject?.trim() || undefined,
    notifyEmailBody: form.notifyEmailBody?.trim() || undefined,
  });

  const validate = () => {
    if (!form.internalName.trim()) {
      toast.error("Give this sale a name your team will recognize.");
      return false;
    }
    if (!form.headline.trim() || !form.shopTitle.trim()) {
      toast.error("Add a banner headline and shop page title.");
      return false;
    }
    if (!form.startsAt || !form.endsAt) {
      toast.error("Set a start and end date.");
      return false;
    }
    if (new Date(form.endsAt).getTime() <= new Date(form.startsAt).getTime()) {
      toast.error("End date and time must be after the start.");
      return false;
    }
    return true;
  };

  const handleSaveDetails = () => {
    if (!validate()) return;
    const payload = buildPayload();

    if (isNew) {
      createSale.mutate(payload, {
        onSuccess: (res) => {
          const id = res.data?.id;
          toast.success("Sale created.");
          if (id && (dirtyProducts || selectedProductIds.length > 0)) {
            setProducts.mutate(
              { saleId: id, productIds: selectedProductIds },
              {
                onSuccess: () =>
                  router.replace(`/admin/${adminId}/sales/${id}`),
              },
            );
          } else if (id) {
            router.replace(`/admin/${adminId}/sales/${id}`);
          }
        },
        onError: () => toast.error("Could not create sale. Try again."),
      });
      return;
    }

    updateSale.mutate(
      { saleId: saleId!, payload },
      {
        onSuccess: () => toast.success("Changes saved."),
        onError: () => toast.error("Could not save. Try again."),
      },
    );
  };

  const handleSaveListings = () => {
    if (isNew) {
      toast.error("Save the sale details first.");
      setTab("details");
      return;
    }
    setProducts.mutate(
      { saleId: saleId!, productIds: selectedProductIds },
      {
        onSuccess: () => {
          setDirtyProducts(false);
          toast.success("Listings updated.");
        },
        onError: () => toast.error("Could not save listings."),
      },
    );
  };

  const handleQuickToggle = (enabled: boolean) => {
    setField("isEnabled", enabled);
    if (isNew) return;
    setEnabled.mutate(
      { saleId: saleId!, isEnabled: enabled },
      {
        onSuccess: () =>
          toast.success(enabled ? "Sale is now on." : "Sale is now off."),
        onError: () => toast.error("Could not update sale status."),
      },
    );
  };

  const handleCopySaleLink = async () => {
    if (!sale) return;
    const url = buildSaleShopAbsoluteUrl(sale);
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Sale link copied to clipboard");
    } catch {
      toast.error("Could not copy link. Try again.");
    }
  };

  const saving =
    createSale.isPending ||
    updateSale.isPending ||
    setProducts.isPending ||
    setEnabled.isPending;

  const sale = data?.data;
  const phase = sale?.phase ?? (form.isEnabled ? "upcoming" : "off");
  const scheduleEndMinDate = splitDatetimeLocal(form.startsAt)?.date;

  const tabs: { id: Tab; label: string }[] = [
    { id: "details", label: "Details" },
    { id: "listings", label: "Listings" },
    { id: "waitlist", label: "Waitlist" },
  ];

  if (!isNew && isLoading) {
    return <FormSkeleton />;
  }

  if (!isNew && isError) {
    return (
      <div className="p-8 text-center bg-white border border-gray-200 rounded-lg">
        <Paragraph1 className="text-red-600">Could not load this sale.</Paragraph1>
        <Link
          href={`/admin/${adminId}/sales`}
          className="inline-block mt-4 text-gray-700 underline text-sm"
        >
          Back to sales
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mb-6">
        <Link
          href={`/admin/${adminId}/sales`}
          className="inline-flex items-center gap-1 mb-3 text-gray-600 hover:text-gray-900 text-sm"
        >
          <ChevronLeft size={16} />
          All sales
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <Paragraph2 className="font-extrabold text-gray-900 text-2xl tracking-tight">
              {isNew ? "New sale" : form.internalName || "Edit sale"}
            </Paragraph2>
            {!isNew && sale ? (
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span
                  className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${phaseBadgeClass(phase)}`}
                >
                  {formatSalePhaseLabel(phase)}
                </span>
                <Paragraph1 className="text-gray-500 text-sm">
                  {sale.productCount} listings · {sale.waitlistCount} on
                  waitlist
                </Paragraph1>
              </div>
            ) : null}
          </div>
          {!isNew && sale ? (
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <a
                href={buildSaleShopHref(sale)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 text-sm hover:bg-gray-50"
              >
                Preview shop page
              </a>
              <button
                type="button"
                onClick={handleCopySaleLink}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 rounded-lg font-medium text-white text-sm"
              >
                <Copy size={16} />
                Copy sale link
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="bg-white mb-6 p-4 sm:p-5 border border-gray-200 rounded-lg">
        <ToggleRow
          label="Sale is on"
          description="Turn off anytime to pause the banner, shop access, and countdown without losing your settings."
          checked={form.isEnabled}
          onChange={handleQuickToggle}
          disabled={setEnabled.isPending}
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              tab === t.id
                ? "bg-gray-900 text-white"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "details" ? (
        <div className="space-y-6">
          <section className="bg-white p-5 sm:p-6 border border-gray-200 rounded-lg space-y-4">
            <h3 className="font-semibold text-gray-900">Basics</h3>
            <label className={`block ${saleFieldWrapClass}`}>
              <span className="text-sm font-medium text-gray-700">
                Internal name
              </span>
              <span className="block text-xs text-gray-500 mt-0.5">
                Only visible to admins (e.g. &quot;May Closet Drop&quot;)
              </span>
              <input
                type="text"
                value={form.internalName}
                onChange={(e) => setField("internalName", e.target.value)}
                className={saleInputClass}
              />
            </label>
            <label className={`block ${saleFieldWrapClass}`}>
              <span className="text-sm font-medium text-gray-700">
                Link slug (optional)
              </span>
              <span className="block text-xs text-gray-500 mt-0.5">
                Used in the shop URL. Leave blank to auto-generate.
              </span>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setField("slug", e.target.value)}
                placeholder="may-closet-drop"
                className={saleInputMonoClass}
              />
            </label>
          </section>

          <section className="bg-white p-5 sm:p-6 border border-gray-200 rounded-lg space-y-5">
            <div>
              <h3 className="font-semibold text-gray-900">Schedule</h3>
              <Paragraph1 className="mt-1 text-gray-500 text-sm">
                Choose when the sale opens and closes.
              </Paragraph1>
            </div>
            <div className="space-y-4">
              <div>
                <span className="text-sm font-medium text-gray-700">Starts</span>
                <SaleDateTimePicker
                  id="sale-starts-at"
                  value={form.startsAt}
                  onChange={(v) => setField("startsAt", v)}
                />
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Ends</span>
                <SaleDateTimePicker
                  id="sale-ends-at"
                  value={form.endsAt}
                  minDate={scheduleEndMinDate}
                  onChange={(v) => setField("endsAt", v)}
                />
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">
                  Earliest delivery
                  <span className="font-normal text-gray-500"> (optional)</span>
                </span>
                <Paragraph1 className="mt-0.5 text-gray-500 text-xs">
                  Earliest date renters can schedule delivery for sale items.
                </Paragraph1>
                <SaleDateTimePicker
                  id="sale-earliest-delivery"
                  value={form.earliestDeliveryAt ?? ""}
                  minDate={scheduleEndMinDate}
                  onChange={(v) => setField("earliestDeliveryAt", v)}
                />
              </div>
            </div>
          </section>

          <section className="bg-white p-5 sm:p-6 border border-gray-200 rounded-lg space-y-4">
            <h3 className="font-semibold text-gray-900">What shoppers see</h3>
            <label className={`block ${saleFieldWrapClass}`}>
              <span className="text-sm font-medium text-gray-700">
                Banner headline
              </span>
              <input
                type="text"
                value={form.headline}
                onChange={(e) => setField("headline", e.target.value)}
                placeholder="Shop the summer sale"
                className={saleInputClass}
              />
            </label>
            <div className={saleFieldWrapClass}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-medium text-gray-700">
                  Date line on banner
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (subheadlineManual) {
                      const line = formatSaleBannerDateLine(
                        form.startsAt,
                        form.endsAt,
                      );
                      if (line) setField("subheadline", line);
                      setSubheadlineManual(false);
                      return;
                    }
                    setSubheadlineManual(true);
                  }}
                  className="text-xs font-medium text-gray-600 underline hover:text-gray-900"
                >
                  {subheadlineManual
                    ? "Use schedule dates"
                    : "Write custom date line"}
                </button>
              </div>
              <span className="block text-xs text-gray-500 mt-0.5">
                {subheadlineManual
                  ? "Custom text shown under the banner headline."
                  : "Filled automatically from the schedule above."}
              </span>
              {subheadlineManual ? (
                <input
                  type="text"
                  value={form.subheadline ?? ""}
                  onChange={(e) => setField("subheadline", e.target.value)}
                  placeholder="June 1st - June 3rd"
                  className={saleInputClass}
                />
              ) : (
                <div className={saleReadonlyBoxClass}>
                  {formatSaleBannerDateLine(form.startsAt, form.endsAt) ||
                    "Set start and end dates above"}
                </div>
              )}
            </div>
            <label className={`block ${saleFieldWrapClass}`}>
              <span className="text-sm font-medium text-gray-700">
                Shop page title
              </span>
              <input
                type="text"
                value={form.shopTitle}
                onChange={(e) => setField("shopTitle", e.target.value)}
                placeholder="Summer Sale"
                className={saleInputClass}
              />
            </label>
            <label className={`block ${saleFieldWideWrapClass}`}>
              <span className="text-sm font-medium text-gray-700">
                Shop page description
              </span>
              <textarea
                value={form.shopDescription ?? ""}
                onChange={(e) => setField("shopDescription", e.target.value)}
                rows={2}
                placeholder="Limited pieces. Shop before they are gone."
                className={saleTextareaClass}
              />
            </label>
            <label className={`block ${saleFieldWideWrapClass}`}>
              <span className="text-sm font-medium text-gray-700">
                Message before sale opens
              </span>
              <span className="block text-xs text-gray-500 mt-0.5">
                Shown on product pages when shopping is not open yet.
              </span>
              <input
                type="text"
                value={form.preSaleMessage ?? ""}
                onChange={(e) => setField("preSaleMessage", e.target.value)}
                placeholder="Available from June 1st - June 3rd"
                className={saleInputClass}
              />
            </label>
            <label className={`block ${saleFieldWideWrapClass}`}>
              <span className="text-sm font-medium text-gray-700">
                Email subject when notifying waitlist
              </span>
              <input
                type="text"
                value={form.notifyEmailSubject ?? ""}
                onChange={(e) => setField("notifyEmailSubject", e.target.value)}
                placeholder={SHOP_SALE_NOTIFY_EMAIL_SUBJECT_PLACEHOLDER}
                className={saleInputClass}
              />
            </label>
            <label className={`block ${saleFieldWideWrapClass}`}>
              <span className="text-sm font-medium text-gray-700">
                Email message
              </span>
              <span className="block text-xs text-gray-500 mt-0.5">
                Plain text is fine. Blank lines start a new paragraph. A Shop now
                button is added automatically.
              </span>
              <textarea
                value={form.notifyEmailBody ?? ""}
                onChange={(e) => setField("notifyEmailBody", e.target.value)}
                rows={8}
                placeholder={SHOP_SALE_NOTIFY_EMAIL_BODY_PLACEHOLDER}
                className={saleTextareaMonoClass}
              />
            </label>
          </section>

          <section className="bg-white p-5 sm:p-6 border border-gray-200 rounded-lg">
            <h3 className="mb-2 font-semibold text-gray-900">Options</h3>
            <ToggleRow
              label="Show home banner"
              description="Display the countdown banner on the website."
              checked={form.bannerEnabled}
              onChange={(v) => setField("bannerEnabled", v)}
            />
            <ToggleRow
              label="Show countdown"
              description="Display days, hours, and minutes on the banner."
              checked={form.showCountdown}
              onChange={(v) => setField("showCountdown", v)}
            />
            <ToggleRow
              label="Let people shop"
              description="When off, the banner shows a join waitlist button instead of shop now."
              checked={form.shopAccessEnabled}
              onChange={(v) => setField("shopAccessEnabled", v)}
            />
            <ToggleRow
              label="Waitlist signups"
              description="Allow visitors to leave their email before the sale opens."
              checked={form.waitlistEnabled}
              onChange={(v) => setField("waitlistEnabled", v)}
            />
          </section>

          <div className="flex justify-end">
            <button
              type="button"
              disabled={saving}
              onClick={handleSaveDetails}
              className="bg-gray-900 hover:bg-gray-800 disabled:opacity-50 px-6 py-2.5 rounded-lg font-medium text-white text-sm"
            >
              {saving ? "Saving…" : isNew ? "Create sale" : "Save changes"}
            </button>
          </div>
        </div>
      ) : null}

      {tab === "listings" ? (
        <div className="space-y-6">
          <section className="bg-white p-5 sm:p-6 border border-gray-200 rounded-lg">
            <SaleItemPicker
              saleId={saleId}
              selectedIds={selectedProductIds}
              onChange={(ids) => {
                setSelectedProductIds(ids);
                setDirtyProducts(true);
              }}
            />
          </section>
          <div className="flex justify-end">
            <button
              type="button"
              disabled={saving || isNew}
              onClick={handleSaveListings}
              className="bg-gray-900 hover:bg-gray-800 disabled:opacity-50 px-6 py-2.5 rounded-lg font-medium text-white text-sm"
            >
              {setProducts.isPending ? "Saving…" : "Save listings"}
            </button>
          </div>
        </div>
      ) : null}

      {tab === "waitlist" && saleId ? (
        <SaleWaitlistCard
          saleId={saleId}
          waitlistEnabled={form.waitlistEnabled}
        />
      ) : null}

      {tab === "waitlist" && isNew ? (
        <div className="bg-white p-8 border border-gray-200 rounded-lg text-center">
          <Paragraph1 className="text-gray-600 text-sm">
            Create and save the sale first to see waitlist signups.
          </Paragraph1>
        </div>
      ) : null}
    </div>
  );
}
