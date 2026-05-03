import {
  CheckCircle,
  Truck,
  Package,
  ArrowRight,
  Clock,
  Home,
  RotateCcw,
  ShoppingBag,
  DollarSign,
  AlertTriangle,
  Scale,
  Bell,
} from "lucide-react";
import type { NotificationType } from "@/lib/api/notifications";

export interface NotificationIconConfig {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}

export const getNotificationIcon = (
  type: NotificationType,
): NotificationIconConfig => {
  switch (type) {
    case "ORDER_CONFIRMED":
      return {
        icon: CheckCircle,
        color: "text-green-600",
        bgColor: "bg-green-100",
      };
    case "SHIPMENT_DISPATCHED":
      return {
        icon: Truck,
        color: "text-blue-600",
        bgColor: "bg-blue-100",
      };
    case "RETURN_DISPATCHED":
      return {
        icon: RotateCcw,
        color: "text-purple-600",
        bgColor: "bg-purple-100",
      };
    case "RETURN_PICKUP_SCHEDULED":
      return {
        icon: Clock,
        color: "text-purple-700",
        bgColor: "bg-purple-100",
      };
    case "SHIPMENT_IN_TRANSIT":
      return {
        icon: ArrowRight,
        color: "text-indigo-600",
        bgColor: "bg-indigo-100",
      };
    case "RETURN_IN_TRANSIT":
      return {
        icon: Package,
        color: "text-orange-600",
        bgColor: "bg-orange-100",
      };
    case "SHIPMENT_DELIVERED":
      return {
        icon: Home,
        color: "text-green-600",
        bgColor: "bg-green-100",
      };
    case "RETURN_CONFIRMED":
      return {
        icon: CheckCircle,
        color: "text-teal-600",
        bgColor: "bg-teal-100",
      };
    case "RENTAL_REQUEST":
      return {
        icon: ShoppingBag,
        color: "text-blue-600",
        bgColor: "bg-blue-100",
      };
    case "RENTAL_APPROVED":
      return {
        icon: CheckCircle,
        color: "text-green-600",
        bgColor: "bg-green-100",
      };
    case "RENTAL_REJECTED":
      return {
        icon: AlertTriangle,
        color: "text-red-600",
        bgColor: "bg-red-100",
      };
    case "PAYMENT_RECEIVED":
      return {
        icon: DollarSign,
        color: "text-green-600",
        bgColor: "bg-green-100",
      };
    case "DISPUTE_OPENED":
      return {
        icon: AlertTriangle,
        color: "text-red-600",
        bgColor: "bg-red-100",
      };
    case "DISPUTE_RESOLVED":
      return {
        icon: Scale,
        color: "text-green-600",
        bgColor: "bg-green-100",
      };
    case "RETURN_INITIATED":
      return {
        icon: RotateCcw,
        color: "text-orange-600",
        bgColor: "bg-orange-100",
      };
    case "SYSTEM":
    default:
      return {
        icon: Bell,
        color: "text-gray-600",
        bgColor: "bg-gray-100",
      };
  }
};

export const getNotificationTitle = (type: NotificationType): string => {
  switch (type) {
    case "ORDER_CONFIRMED":
      return "Order Confirmed";
    case "SHIPMENT_DISPATCHED":
      return "Your rental is on its way!";
    case "RETURN_DISPATCHED":
      return "Return scheduled for dispatch";
    case "RETURN_PICKUP_SCHEDULED":
      return "Return pickup scheduled";
    case "SHIPMENT_IN_TRANSIT":
      return "Your rental is in transit!";
    case "RETURN_IN_TRANSIT":
      return "Return pickup in progress";
    case "SHIPMENT_DELIVERED":
      return "Your rental has been delivered!";
    case "RETURN_CONFIRMED":
      return "Return confirmed";
    case "RENTAL_REQUEST":
      return "New Rental Request";
    case "RENTAL_APPROVED":
      return "Rental Approved";
    case "RENTAL_REJECTED":
      return "Rental Rejected";
    case "PAYMENT_RECEIVED":
      return "Payment Received";
    case "DISPUTE_OPENED":
      return "Dispute Opened";
    case "DISPUTE_RESOLVED":
      return "Dispute Resolved";
    case "RETURN_INITIATED":
      return "Return Initiated";
    case "SYSTEM":
    default:
      return "System Notification";
  }
};
