"use client";

import {
  CalendarDays,
  Check,
  ChevronLeft,
  Copy,
  LayoutGrid,
  Mail,
  Settings2,
  Tag,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import AdminPageHeader from "@/app/admin/components/AdminPageHeader";
import { FormSkeleton } from "@/common/ui/SkeletonLoaders";
import { Paragraph1 } from "@/common/ui/Text";
import type { ShopSaleFormPayload } from "@/lib/api/admin/shopSales";
import {
  buildSaleShopAbsoluteUrl,
  buildSaleShopHref,
} from "@/lib/api/shopSale";
import {
  useCreateShopSale,
  useSetShopSaleEnabled,
  useSetShopSaleProducts,
  useUpdateShopSale,
} from "@/lib/mutations/admin";
import { useAdminShopSaleDetail } from "@/lib/queries/admin/useShopSales";
import {
  datetimeLocalToIso,
  formatSaleBannerDateLine,
  formatSalePhaseLabel,
  isoToDatetimeLocal,
  phaseBadgeClass,
  splitDatetimeLocal,
} from "../lib/saleDateTime";
import {
  saleFieldWideWrapClass,
  saleFieldWrapClass,
  saleInputClass,
  saleInputMonoClass,
  saleReadonlyBoxClass,
  saleTextareaClass,
  saleTextareaMonoClass,
} from "../lib/saleFormStyles";
import {
  SHOP_SALE_NOTIFY_EMAIL_BODY_PLACEHOLDER,
  SHOP_SALE_NOTIFY_EMAIL_SUBJECT_PLACEHOLDER,
} from "../lib/shopSaleEmailDefaults";
import SaleDateTimePicker from "./SaleDateTimePicker";
import SaleItemPicker from "./SaleItemPicker";
import SaleWaitlistCard from "./SaleWaitlistCard";

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
    shopAccessEnabled: true,
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
    <div className="flex flex-col gap-3 border-b border-gray-100 py-4 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <Paragraph1 className="font-medium text-gray-900">{label}</Paragraph1>
        <Paragraph1 className="mt-0.5 max-w-2xl text-sm leading-snug text-gray-500">
          {description}
        </Paragraph1>
      </div>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(!checked)}
        aria-pressed={checked}
        aria-label={label}
        className={`relative inline-flex h-8 w-14 shrink-0 items-center self-start rounded-full transition-colors disabled:opacity-50 sm:self-center ${
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
    isNew ? null : (saleId ?? null),
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
    const subheadline = sale.subheadline?.trim() ?? "";
    setSubheadlineManual(Boolean(subheadline) && subheadline !== autoLine);
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
      toast.error("Give this campaign a name your team will recognize.");
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
          toast.success("Campaign created.");
          if (id && (dirtyProducts || selectedProductIds.length > 0)) {
            setProducts.mutate(
              { saleId: id, productIds: selectedProductIds },
              {
                onError: () => {
                  toast.error(
                    "Campaign created, but its listings could not be saved.",
                  );
                },
                onSettled: () =>
                  router.replace(`/admin/${adminId}/sales/${id}`),
              },
            );
          } else if (id) {
            router.replace(`/admin/${adminId}/sales/${id}`);
          }
        },
        onError: () => toast.error("Could not create campaign. Try again."),
      });
      return;
    }

    if (!saleId) {
      toast.error("Could not identify this campaign.");
      return;
    }

    updateSale.mutate(
      { saleId, payload },
      {
        onSuccess: () => toast.success("Changes saved."),
        onError: () => toast.error("Could not save. Try again."),
      },
    );
  };

  const handleSaveListings = () => {
    if (isNew) {
      toast.error("Save the campaign details first.");
      setTab("details");
      return;
    }
    if (!saleId) {
      toast.error("Could not identify this campaign.");
      return;
    }
    setProducts.mutate(
      { saleId, productIds: selectedProductIds },
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
    if (!saleId) return;
    setEnabled.mutate(
      { saleId, isEnabled: enabled },
      {
        onSuccess: () =>
          toast.success(
            enabled ? "Campaign is now on." : "Campaign is now off.",
          ),
        onError: () => toast.error("Could not update campaign status."),
      },
    );
  };

  const handleCopySaleLink = async () => {
    if (!sale) return;
    const url = buildSaleShopAbsoluteUrl(sale);
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Campaign link copied to clipboard");
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
        <Paragraph1 className="text-red-600">
          Could not load this campaign.
        </Paragraph1>
        <Link
          href={`/admin/${adminId}/sales`}
          className="inline-block mt-4 text-gray-700 underline text-sm"
        >
          Back to campaigns
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mb-6">
        <Link
          href={`/admin/${adminId}/sales`}
          className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
        >
          <ChevronLeft size={16} />
          All campaigns
        </Link>
        <AdminPageHeader
          className="!mb-0"
          title={isNew ? "New campaign" : form.internalName || "Edit campaign"}
          description={
            isNew
              ? "Set up the campaign and choose its listings."
              : !sale
                ? "Edit campaign details and listings."
                : `${sale.productCount} listings · ${sale.waitlistCount} on waitlist`
          }
          action={
            !isNew && sale ? (
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <span
                  className={`inline-flex h-10 items-center rounded-full px-3 text-xs font-medium ${phaseBadgeClass(phase)}`}
                >
                  {formatSalePhaseLabel(phase)}
                </span>
                <a
                  href={buildSaleShopHref(sale)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 items-center rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Preview
                </a>
                <button
                  type="button"
                  onClick={handleCopySaleLink}
                  className="inline-flex h-10 items-center gap-2 rounded-lg bg-gray-900 px-4 text-sm font-medium text-white transition-colors hover:bg-gray-800"
                >
                  <Copy size={16} />
                  Copy link
                </button>
              </div>
            ) : null
          }
        />
      </div>

      <section className="mb-6 rounded-2xl border border-gray-200 bg-white px-4 shadow-sm sm:px-5">
        <ToggleRow
          label="Campaign is on"
          description="Pause the campaign without losing its settings."
          checked={form.isEnabled}
          onChange={handleQuickToggle}
          disabled={setEnabled.isPending}
        />
      </section>

      <div className="mb-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              aria-pressed={tab === t.id}
              className={`shrink-0 border-b-2 px-5 py-3 text-sm font-medium transition-colors ${
                tab === t.id
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              {t.label}
              {t.id === "listings" && selectedProductIds.length > 0 ? (
                <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs tabular-nums text-gray-600">
                  {selectedProductIds.length}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      {tab === "details" ? (
        <div className="space-y-5">
          <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-2">
            <section className="space-y-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="mb-1 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                  <Tag size={16} aria-hidden="true" />
                </span>
                <h3 className="text-sm font-semibold text-gray-900">Basics</h3>
              </div>
              <label className={`block ${saleFieldWrapClass}`}>
                <span className="text-sm font-medium text-gray-700">
                  Internal name
                </span>
                <span className="mt-0.5 block text-xs text-gray-500">
                  Internal label for your team.
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
                <span className="mt-0.5 block text-xs text-gray-500">
                  Optional. Generated automatically if blank.
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

            <section className="space-y-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                  <CalendarDays size={16} aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    Schedule
                  </h3>
                  <Paragraph1 className="text-xs text-gray-500">
                    Set the campaign window.
                  </Paragraph1>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Starts
                  </span>
                  <SaleDateTimePicker
                    id="sale-starts-at"
                    value={form.startsAt}
                    onChange={(v) => setField("startsAt", v)}
                  />
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Ends
                  </span>
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
                    <span className="font-normal text-gray-500">
                      {" "}
                      (optional)
                    </span>
                  </span>
                  <Paragraph1 className="mt-0.5 text-gray-500 text-xs">
                    Earliest date renters can schedule delivery for campaign
                    items.
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
          </div>

          <section className="space-y-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                <LayoutGrid size={16} aria-hidden="true" />
              </span>
              <h3 className="text-sm font-semibold text-gray-900">
                Shopper-facing content
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
              <label className={`block ${saleFieldWrapClass}`}>
                <span className="text-sm font-medium text-gray-700">
                  Banner headline
                </span>
                <input
                  type="text"
                  value={form.headline}
                  onChange={(e) => setField("headline", e.target.value)}
                  placeholder="Shop the summer campaign"
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
                <span className="mt-0.5 block text-xs text-gray-500">
                  {subheadlineManual
                    ? "Shown below the headline."
                    : "Uses the schedule dates."}
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
                  placeholder="Summer Campaign"
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
                  Message before campaign opens
                </span>
                <span className="mt-0.5 block text-xs text-gray-500">
                  Shown before the campaign opens.
                </span>
                <input
                  type="text"
                  value={form.preSaleMessage ?? ""}
                  onChange={(e) => setField("preSaleMessage", e.target.value)}
                  placeholder="Available from June 1st - June 3rd"
                  className={saleInputClass}
                />
              </label>
              <details className="sm:col-span-2 rounded-xl border border-gray-200 bg-gray-50/50">
                <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 marker:hidden">
                  <Mail size={15} className="text-gray-500" aria-hidden="true" />
                  Customize waitlist email
                  <span className="text-xs font-normal text-gray-400">
                    Optional
                  </span>
                </summary>
                <div className="grid grid-cols-1 gap-4 border-t border-gray-200 p-4 sm:grid-cols-2">
                  <label className={`block ${saleFieldWrapClass}`}>
                    <span className="text-sm font-medium text-gray-700">
                      Email subject
                    </span>
                    <input
                      type="text"
                      value={form.notifyEmailSubject ?? ""}
                      onChange={(e) =>
                        setField("notifyEmailSubject", e.target.value)
                      }
                      placeholder={SHOP_SALE_NOTIFY_EMAIL_SUBJECT_PLACEHOLDER}
                      className={saleInputClass}
                    />
                  </label>
                  <label className={`block ${saleFieldWideWrapClass}`}>
                    <span className="text-sm font-medium text-gray-700">
                      Email message
                    </span>
                    <span className="mt-0.5 block text-xs text-gray-500">
                      Plain text. A Shop now button is added automatically.
                    </span>
                    <textarea
                      value={form.notifyEmailBody ?? ""}
                      onChange={(e) =>
                        setField("notifyEmailBody", e.target.value)
                      }
                      rows={6}
                      placeholder={SHOP_SALE_NOTIFY_EMAIL_BODY_PLACEHOLDER}
                      className={saleTextareaMonoClass}
                    />
                  </label>
                </div>
              </details>
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white px-4 shadow-sm sm:px-5">
            <div className="flex items-center gap-2 pt-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                <Settings2 size={16} aria-hidden="true" />
              </span>
              <h3 className="text-sm font-semibold text-gray-900">Options</h3>
            </div>
            <ToggleRow
              label="Show home banner"
              description="Show the campaign on the home page."
              checked={form.bannerEnabled}
              onChange={(v) => setField("bannerEnabled", v)}
            />
            <ToggleRow
              label="Show countdown"
              description="Show time remaining on the banner."
              checked={form.showCountdown}
              onChange={(v) => setField("showCountdown", v)}
            />
            <ToggleRow
              label="Let people shop"
              description="Allow visitors to shop campaign listings."
              checked={form.shopAccessEnabled}
              onChange={(v) => setField("shopAccessEnabled", v)}
            />
            <ToggleRow
              label="Waitlist signups"
              description="Let visitors sign up before launch."
              checked={form.waitlistEnabled}
              onChange={(v) => setField("waitlistEnabled", v)}
            />
          </section>

          <div className="sticky bottom-0 z-10 -mx-3 flex justify-end border-t border-gray-200 bg-white/95 px-3 py-3 shadow-[0_-8px_20px_-16px_rgba(15,23,42,0.35)] backdrop-blur sm:-mx-8 sm:px-8">
            <button
              type="button"
              disabled={saving}
              onClick={handleSaveDetails}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-gray-900 px-5 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving…" : isNew ? "Create campaign" : "Save changes"}
              {!saving && isNew ? <Check size={16} aria-hidden="true" /> : null}
            </button>
          </div>
        </div>
      ) : null}

      {tab === "listings" ? (
        <div className="space-y-5">
          <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
            <SaleItemPicker
              saleId={saleId}
              selectedIds={selectedProductIds}
              onChange={(ids) => {
                setSelectedProductIds(ids);
                setDirtyProducts(true);
              }}
            />
          </section>
          {isNew ? (
            <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <Paragraph1 className="text-sm text-gray-600">
                Save campaign details to publish this listing selection.
              </Paragraph1>
              <button
                type="button"
                onClick={() => setTab("details")}
                className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg bg-gray-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
              >
                Continue to details
              </button>
            </div>
          ) : (
            <div className="sticky bottom-0 z-10 -mx-3 flex justify-end border-t border-gray-200 bg-white/95 px-3 py-3 shadow-[0_-8px_20px_-16px_rgba(15,23,42,0.35)] backdrop-blur sm:-mx-8 sm:px-8">
              <button
                type="button"
                disabled={saving}
                onClick={handleSaveListings}
                className="inline-flex h-11 items-center justify-center rounded-lg bg-gray-900 px-5 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {setProducts.isPending ? "Saving…" : "Save listings"}
              </button>
            </div>
          )}
        </div>
      ) : null}

      {tab === "waitlist" && saleId ? (
        <SaleWaitlistCard
          saleId={saleId}
          waitlistEnabled={form.waitlistEnabled}
        />
      ) : null}

      {tab === "waitlist" && isNew ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <Paragraph1 className="text-gray-600 text-sm">
            Create and save the campaign first to see waitlist signups.
          </Paragraph1>
        </div>
      ) : null}
    </div>
  );
}
