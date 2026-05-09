import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ orderId: string }>;
};

export default async function RenterOrderDeepLinkPage({ params }: PageProps) {
  const { orderId } = await params;
  const encodedOrderId = encodeURIComponent(orderId);
  redirect(`/renters/orders?orderId=${encodedOrderId}`);
}
