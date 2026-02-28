import React from "react";
import { useOrders } from "@/lib/queries/renters/useOrders";

export default function RenterOrdersList() {
  const { data, isLoading, error } = useOrders();

  if (isLoading) return <div>Loading orders...</div>;
  if (error) return <div>Error loading orders.</div>;
  if (!data?.orders?.length) return <div>No orders found.</div>;

  return (
    <div className="space-y-4">
      {data.orders.map((order) => (
        <div key={order.id} className="border rounded p-4">
          <div className="font-bold">{order.itemName}</div>
          <div>Status: {order.status}</div>
          <div>
            Rental Period: {order.rentalStartDate} - {order.rentalEndDate}
          </div>
          <div>Total Price: ${order.totalPrice}</div>
        </div>
      ))}
    </div>
  );
}
