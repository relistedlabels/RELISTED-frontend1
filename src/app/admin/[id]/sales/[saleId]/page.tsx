"use client";

import { useParams } from "next/navigation";
import SaleEditor from "../components/SaleEditor";

export default function EditSalePage() {
  const params = useParams();
  const adminId = params.id as string;
  const saleId = params.saleId as string;
  return <SaleEditor adminId={adminId} saleId={saleId} />;
}
