"use client";

import { useParams } from "next/navigation";
import SaleEditor from "../components/SaleEditor";

export default function NewSalePage() {
  const params = useParams();
  const adminId = params.id as string;
  return <SaleEditor adminId={adminId} />;
}
