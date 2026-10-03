"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle, Download, Eye, FileText } from "lucide-react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import DocumentModal from "./DocumentModal";

interface UserVerificationProps {
  user: any;
}

export default function UserVerification({ user }: UserVerificationProps) {
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const profile = user?.profile;
  const identityUpload = profile?.idDocumentUpload?.url
    ? profile.idDocumentUpload
    : profile?.ninUpload;
  const documentUrl = identityUpload?.url ?? "";
  const documentName = identityUpload?.name || "Uploaded identity document";
  const documentType = profile?.idDocumentType || "Identity document";
  const contentType = identityUpload?.type ?? "";
  const isImage =
    contentType.startsWith("image/") ||
    /\.(avif|gif|jpe?g|png|webp)(?:[?#]|$)/i.test(documentUrl);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <section className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6">
          <Paragraph1 className="mb-3 text-xs font-semibold uppercase text-gray-500">
            Admin verification
          </Paragraph1>
          <div className="flex items-center gap-2">
            {user?.isVerified ? (
              <CheckCircle className="h-5 w-5 text-green-700" aria-hidden />
            ) : (
              <AlertCircle className="h-5 w-5 text-amber-700" aria-hidden />
            )}
            <Paragraph3 className="text-lg font-bold text-gray-900">
              {user?.isVerified ? "Verified" : "Not verified"}
            </Paragraph3>
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6">
          <Paragraph1 className="mb-3 text-xs font-semibold uppercase text-gray-500">
            Profile review
          </Paragraph1>
          <div className="flex items-center gap-2">
            {profile?.isApproved ? (
              <CheckCircle className="h-5 w-5 text-green-700" aria-hidden />
            ) : (
              <AlertCircle className="h-5 w-5 text-amber-700" aria-hidden />
            )}
            <Paragraph3 className="text-lg font-bold text-gray-900">
              {profile?.isApproved ? "Approved" : "Pending"}
            </Paragraph3>
          </div>
        </section>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
              <FileText size={18} aria-hidden />
            </span>
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-gray-900">
                Uploaded identity document
              </h2>
              <p className="mt-1 break-all text-sm text-gray-500">
                {identityUpload
                  ? `${documentType} · ${documentName}`
                  : "No identity document has been uploaded."}
              </p>
            </div>
          </div>
          {identityUpload && documentUrl ? (
            <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => setIsDocumentModalOpen(true)}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-gray-300 px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                <Eye size={17} aria-hidden />
                View document
              </button>
              <a
                href={documentUrl}
                target="_blank"
                rel="noopener noreferrer"
                download={documentName}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 text-sm font-medium text-white transition hover:bg-gray-800"
              >
                <Download size={17} aria-hidden />
                Download
              </a>
            </div>
          ) : null}
        </div>

        {identityUpload && documentUrl ? (
          isImage ? (
            <button
              type="button"
              onClick={() => setIsDocumentModalOpen(true)}
              aria-label="View uploaded identity document"
              className="flex h-56 w-full items-center justify-center overflow-hidden rounded-xl bg-gray-50 p-3 sm:h-72"
            >
              <img
                src={documentUrl}
                alt={`${documentType} uploaded by ${user?.name || "user"}`}
                className="max-h-full max-w-full rounded-lg object-contain"
              />
            </button>
          ) : (
            <div className="flex min-h-28 items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <FileText className="h-8 w-8 shrink-0 text-gray-500" aria-hidden />
              <div className="min-w-0">
                <p className="break-all text-sm font-medium text-gray-900">
                  {documentName}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Open or download this file to review the uploaded document.
                </p>
              </div>
            </div>
          )
        ) : null}
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6">
        <h2 className="mb-4 text-base font-semibold text-gray-900">
          Personal information
        </h2>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Full name
            </dt>
            <dd className="mt-1 text-sm text-gray-700">{user?.name || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Email
            </dt>
            <dd className="mt-1 break-all text-sm text-gray-700">
              {user?.email || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Phone number
            </dt>
            <dd className="mt-1 text-sm text-gray-700">
              {profile?.phoneNumber || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              NIN
            </dt>
            <dd className="mt-1 text-sm text-gray-700">
              {profile?.nin || "—"}
            </dd>
          </div>
        </dl>
      </section>

      {identityUpload && documentUrl ? (
        <DocumentModal
          isOpen={isDocumentModalOpen}
          onClose={() => setIsDocumentModalOpen(false)}
          documentData={{
            title: "Identity document",
            documentType: documentType,
            fileName: documentName,
            contentType,
            url: documentUrl,
          }}
        />
      ) : null}
    </div>
  );
}
