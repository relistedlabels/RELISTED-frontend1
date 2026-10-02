import Image from "next/image";

interface AdminBrandProps {
  className?: string;
}

export default function AdminBrand({ className = "" }: AdminBrandProps) {
  return (
    <div className={`flex min-w-0 shrink-0 items-center gap-3 ${className}`}>
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-black p-2.5">
        <Image
          src="/images/logo.svg"
          alt=""
          width={34}
          height={27}
          className="block h-auto w-8 translate-x-0.5 object-contain"
        />
      </span>
      <div className="min-w-0">
        <p className="whitespace-nowrap text-[13px] font-bold leading-tight tracking-wide text-gray-900">
          RELISTED LABELS
        </p>
        <p className="whitespace-nowrap text-[11px] leading-tight text-gray-500">
          Admin Dashboard
        </p>
      </div>
    </div>
  );
}
