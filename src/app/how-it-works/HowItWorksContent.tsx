"use client";

import {
  deliveryFlowSteps,
  listerFlowSteps,
  paymentsFlowSteps,
  shopperFlowSteps,
} from "@/data/howItWorksSteps";
import FAQSection from "./sections/FAQSection";
import FlowSection from "./sections/FlowSection";
import HowItWorks from "./sections/HowItWorks";

export default function HowItWorksContent() {
  return (
    <div>
      <HowItWorks />

      <FlowSection
        id="shoppers"
        label="For Shoppers"
        title={
          <>
            RENT OR BUY
            <br />
            WITHOUT THE COMMITMENT.
          </>
        }
        description="From browsing to return, every step happens on Relisted. No guesswork on availability or payment."
        steps={shopperFlowSteps}
        theme="dark"
        ctaText="Browse the Shop"
        ctaHref="/shop"
      />

      <FlowSection
        id="listers"
        label="For Listers"
        title={
          <>
            TURN YOUR CLOSET
            <br />
            INTO INCOME.
          </>
        }
        description="List for rent, resale, or both. Approve requests, fulfill orders, and withdraw earnings to your bank."
        steps={listerFlowSteps}
        theme="olive"
        ctaText="Start Listing"
        ctaMode="lister"
      />

      <FlowSection
        id="payments"
        label="Payments & Protection"
        title={
          <>
            PAY SAFELY.
            <br />
            STAY PROTECTED.
          </>
        }
        description="Your wallet, deposit, and ID verification work together so rentals and purchases stay simple and secure."
        steps={paymentsFlowSteps}
        theme="light"
        ctaText="Create Account"
        ctaHref="/auth/create-account"
      />

      <FlowSection
        id="delivery"
        label="Delivery & Returns"
        title={
          <>
            DELIVERED
            <br />
            ACROSS LAGOS.
          </>
        }
        description="Set your delivery and return windows at checkout. We coordinate logistics with trusted partners."
        steps={deliveryFlowSteps}
        theme="dark"
        ctaText="Find Your Next Fit"
        ctaHref="/shop"
      />

      <FAQSection />
    </div>
  );
}
