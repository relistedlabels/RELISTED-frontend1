import Link from "next/link";
import { Header1Plus, Paragraph1 } from "@/common/ui/Text";

export default function OfflinePage() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-6 py-16 text-center">
      <Header1Plus className="mb-3">You are offline</Header1Plus>
      <Paragraph1 className="mb-8 text-gray-600 leading-relaxed">
        Check your connection, then try again. Pages you opened recently may
        still be available.
      </Paragraph1>
      <Link
        href="/"
        className="inline-flex items-center justify-center rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
      >
        Back to home
      </Link>
    </main>
  );
}
