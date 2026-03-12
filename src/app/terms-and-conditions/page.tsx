"use client";

import { Header1Plus, Header2, Paragraph1 } from "@/common/ui/Text";
import React from "react";

export default function TermsAndConditions() {
  return (
    <div className="w-full bg-white">
      {/* Hero Section */}
      <section className="w-full bg-black text-white py-12 pt-20 sm:py-20 px-4 sm:px-0">
        <div className="container mx-auto">
          <Header1Plus className="text-3xl sm:text-4xl tracking-wide uppercase mb-4">
            Terms and Conditions
          </Header1Plus>
          <Paragraph1 className="text-gray-300">
            Last updated: March 2026
          </Paragraph1>
        </div>
      </section>

      {/* Content Section */}
      <section className="w-full py-12 sm:py-20 px-4 sm:px-0">
        <div className="container mx-auto max-w-4xl space-y-8">
          {/* Relisted Protection Overview */}
          <div>
            <Header2 className="text-2xl font-bold mb-4">
              Relisted Protection
            </Header2>
            <Paragraph1 className="text-gray-700 leading-relaxed mb-4">
              Relisted Labels is designed to make peer-to-peer fashion rental
              secure, transparent, and reliable for both vendors and renters.
            </Paragraph1>
            <Paragraph1 className="text-gray-700 leading-relaxed mb-4">
              Our protection framework ensures that:
            </Paragraph1>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2 mb-4">
              <li>
                Vendors maintain full ownership and control of their items
              </li>
              <li>Renters receive items that match their descriptions</li>
              <li>Payments and collateral are securely handled</li>
              <li>
                Deliveries and returns are managed through trusted logistics
                partners
              </li>
            </ul>
            <Paragraph1 className="text-gray-700 leading-relaxed mb-4">
              Transactions on Relisted Labels are supported by:
            </Paragraph1>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2 mb-4">
              <li>Secure payment infrastructure powered by Wema Bank</li>
              <li>Logistics services provided by Topship</li>
              <li>Collateral protection to safeguard item value</li>
            </ul>
            <Paragraph1 className="text-gray-700 leading-relaxed">
              This protection policy applies to all users of the Relisted Labels
              platform.
            </Paragraph1>
          </div>

          {/* Lister Protection */}
          <div>
            <Header2 className="text-2xl font-bold mb-4">
              Lister Protection (For Vendors)
            </Header2>
            <Paragraph1 className="text-gray-700 leading-relaxed mb-4">
              Relisted Labels ensures vendors can earn from their collections
              and pieces while maintaining full control of their items.
            </Paragraph1>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-black mb-3">
                  Ownership and Listing Control
                </h3>
                <Paragraph1 className="text-gray-700 leading-relaxed mb-3">
                  Vendors retain full ownership of all listed items.
                </Paragraph1>
                <Paragraph1 className="text-gray-700 leading-relaxed mb-3">
                  Vendors can:
                </Paragraph1>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2 mb-3">
                  <li>Set rental pricing</li>
                  <li>Choose availability dates</li>
                  <li>Set collateral amounts</li>
                  <li>Accept or decline rental requests</li>
                  <li>Remove items from the platform at any time</li>
                </ul>
                <Paragraph1 className="text-gray-700 leading-relaxed">
                  Relisted Labels does not take ownership of any vendor
                  inventory.
                </Paragraph1>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-black mb-3">
                  Collateral Protection
                </h3>
                <Paragraph1 className="text-gray-700 leading-relaxed mb-3">
                  To protect vendors from potential loss or damage, every
                  listing may include a collateral deposit set by the vendor.
                </Paragraph1>
                <Paragraph1 className="text-gray-700 leading-relaxed mb-3">
                  Collateral typically ranges between:{" "}
                  <strong>60–80% of the item's original retail value.</strong>
                </Paragraph1>
                <Paragraph1 className="text-gray-700 leading-relaxed mb-3">
                  This collateral is:
                </Paragraph1>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2">
                  <li>Temporarily held during the rental period</li>
                  <li>Released once the item is returned and inspected</li>
                  <li>
                    Used to cover repair or replacement costs if necessary
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-black mb-3">
                  Secure Payments
                </h3>
                <Paragraph1 className="text-gray-700 leading-relaxed mb-3">
                  All transactions are processed through a secure wallet
                  infrastructure powered by Wema Bank.
                </Paragraph1>
                <Paragraph1 className="text-gray-700 leading-relaxed">
                  Vendor earnings are protected until:
                </Paragraph1>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2">
                  <li>The rental period ends</li>
                  <li>The item is successfully returned</li>
                  <li>The item condition is verified</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-black mb-3">
                  Vendor Responsibilities
                </h3>
                <Paragraph1 className="text-gray-700 leading-relaxed mb-3">
                  Vendors must:
                </Paragraph1>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2 mb-3">
                  <li>Provide accurate descriptions and images</li>
                  <li>List authentic items only</li>
                  <li>Ensure garments are in rentable condition</li>
                  <li>Inspect items upon return</li>
                  <li>Arrange professional cleaning after rentals</li>
                </ul>
                <Paragraph1 className="text-gray-700 leading-relaxed">
                  Failure to meet these standards may result in listing removal
                  or account suspension.
                </Paragraph1>
              </div>
            </div>
          </div>

          {/* Renter Protection */}
          <div>
            <Header2 className="text-2xl font-bold mb-4">
              Renter Protection
            </Header2>
            <Paragraph1 className="text-gray-700 leading-relaxed mb-4">
              Relisted Labels aims to ensure renters receive a reliable and
              transparent rental experience.
            </Paragraph1>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-black mb-3">
                  Accurate Listings
                </h3>
                <Paragraph1 className="text-gray-700 leading-relaxed mb-3">
                  Vendors must ensure that:
                </Paragraph1>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2 mb-3">
                  <li>Photos represent the actual item</li>
                  <li>The item description reflects its real condition</li>
                  <li>The item is authentic and wearable</li>
                </ul>
                <Paragraph1 className="text-gray-700 leading-relaxed">
                  If a renter receives an item that significantly differs from
                  its listing, they should report the issue to Relisted Labels
                  support immediately.
                </Paragraph1>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-black mb-3">
                  Transparent Pricing
                </h3>
                <Paragraph1 className="text-gray-700 leading-relaxed mb-3">
                  The full rental cost displayed at checkout includes:
                </Paragraph1>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2 mb-3">
                  <li>Vendor rental price</li>
                  <li>Platform service fee</li>
                  <li>Delivery fees</li>
                  <li>Dry cleaning cost</li>
                  <li>Applicable taxes</li>
                </ul>
                <Paragraph1 className="text-gray-700 leading-relaxed">
                  No additional hidden fees will be charged beyond those shown
                  during checkout.
                </Paragraph1>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-black mb-3">
                  Secure Transactions
                </h3>
                <Paragraph1 className="text-gray-700 leading-relaxed mb-3">
                  Payments and collateral deposits are securely processed
                  through the Relisted Labels platform.
                </Paragraph1>
                <Paragraph1 className="text-gray-700 leading-relaxed">
                  Collateral is automatically released after the item is
                  returned and verified.
                </Paragraph1>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-black mb-3">
                  Item Condition Standards
                </h3>
                <Paragraph1 className="text-gray-700 leading-relaxed mb-3">
                  To ensure fairness for both renters and vendors, Relisted
                  Labels follows standard condition guidelines commonly used by
                  fashion rental platforms.
                </Paragraph1>

                <h4 className="font-semibold text-black mb-2">
                  Acceptable Rental Wear
                </h4>
                <Paragraph1 className="text-gray-700 leading-relaxed mb-3">
                  Normal wear from responsible use is expected. Examples
                  include:
                </Paragraph1>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2 mb-3">
                  <li>Light wrinkles</li>
                  <li>Minor fabric softening</li>
                  <li>Minimal signs of wear consistent with short-term use</li>
                </ul>
                <Paragraph1 className="text-gray-700 leading-relaxed mb-4">
                  These do not qualify as damage.
                </Paragraph1>

                <h4 className="font-semibold text-black mb-2">Damage</h4>
                <Paragraph1 className="text-gray-700 leading-relaxed mb-3">
                  Damage refers to any condition that affects the garment's
                  appearance, structure, or usability. Examples include:
                </Paragraph1>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2 mb-3">
                  <li>Permanent stains</li>
                  <li>Tears or rips</li>
                  <li>Broken zippers or closures</li>
                  <li>Missing embellishments</li>
                  <li>Burn marks</li>
                  <li>Stretching or deformation of the garment</li>
                </ul>
                <Paragraph1 className="text-gray-700 leading-relaxed mb-4">
                  If damage occurs, repair costs may be deducted from the
                  renter's collateral.
                </Paragraph1>

                <h4 className="font-semibold text-black mb-2">
                  Severe Damage or Loss (Total Collateral Forfeiture)
                </h4>
                <Paragraph1 className="text-gray-700 leading-relaxed">
                  If an item is lost, not returned, or returned in unusable
                  condition, Relisted Labels may deduct up to the full
                  collateral amount to compensate the vendor.
                </Paragraph1>
              </div>
            </div>
          </div>

          {/* Late Return Policy */}
          <div>
            <Header2 className="text-2xl font-bold mb-4">
              Late Return Policy
            </Header2>
            <Paragraph1 className="text-gray-700 leading-relaxed mb-3">
              Items must be returned on the agreed rental end date through the
              designated logistics provider.
            </Paragraph1>
            <Paragraph1 className="text-gray-700 leading-relaxed mb-3">
              If an item is returned late:
            </Paragraph1>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2 mb-3">
              <li>
                10% of the collateral value will be deducted for each day the
                item is overdue.
              </li>
              <li>
                This deduction continues daily until the item is returned, or
                the collateral value is fully exhausted.
              </li>
            </ul>
            <Paragraph1 className="text-gray-700 leading-relaxed">
              This policy protects vendors from lost rental opportunities and
              delayed inventory availability.
            </Paragraph1>
          </div>

          {/* Shipping & Returns */}
          <div>
            <Header2 className="text-2xl font-bold mb-4">
              Shipping &amp; Returns
            </Header2>
            <Paragraph1 className="text-gray-700 leading-relaxed mb-4">
              Relisted Labels partners with Topship to manage logistics.
            </Paragraph1>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-black mb-3">
                  Delivery Process
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-2 mb-3">
                  <li>A renter submits a rental request.</li>
                  <li>The vendor confirms availability.</li>
                  <li>Topship collects the item from the vendor.</li>
                  <li>The item is delivered to the renter.</li>
                </ol>
                <Paragraph1 className="text-gray-700 leading-relaxed">
                  Delivery timelines depend on location and logistics schedules.
                </Paragraph1>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-black mb-3">
                  Return Process
                </h3>
                <Paragraph1 className="text-gray-700 leading-relaxed mb-3">
                  At the end of the rental period:
                </Paragraph1>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2 mb-3">
                  <li>The renter returns the item through Topship.</li>
                  <li>The vendor confirms the item's condition upon return.</li>
                  <li>
                    The renter's collateral is released if no issues are
                    identified.
                  </li>
                </ul>
                <Paragraph1 className="text-gray-700 leading-relaxed">
                  Relisted Labels is not responsible for delays caused by
                  third-party logistics providers (Topship).
                </Paragraph1>
              </div>
            </div>
          </div>

          {/* Cleaning & Garment Care */}
          <div>
            <Header2 className="text-2xl font-bold mb-4">
              Cleaning &amp; Garment Care
            </Header2>
            <Paragraph1 className="text-gray-700 leading-relaxed mb-4">
              Dry cleaning is included within the rental cost paid by the
              renter.
            </Paragraph1>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-black mb-2">
                  Vendor Responsibilities
                </h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2">
                  <li>
                    Vendors must arrange professional cleaning after each
                    rental.
                  </li>
                  <li>
                    Relisted Labels may recommend trusted cleaning partners, but
                    vendors are free to use their preferred services.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-black mb-2">
                  Renter Responsibilities
                </h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2">
                  <li>Renters should handle garments with care</li>
                  <li>Avoid attempting to clean delicate items themselves</li>
                  <li>Return items in the condition received</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Cancellation & Refund Policy */}
          <div>
            <Header2 className="text-2xl font-bold mb-4">
              Cancellation &amp; Refund Policy
            </Header2>
            <Paragraph1 className="text-gray-700 leading-relaxed mb-4">
              <strong>
                Once a rental request is confirmed by the vendor and payment is
                completed, the booking is considered final.
              </strong>
            </Paragraph1>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-black mb-2">Cancellations</h3>
                <Paragraph1 className="text-gray-700 leading-relaxed">
                  Relisted Labels does not allow cancellations after
                  confirmation and payment. This policy ensures vendors can
                  reliably plan inventory availability.
                </Paragraph1>
              </div>

              <div>
                <h3 className="font-semibold text-black mb-2">
                  Refund Eligibility
                </h3>
                <Paragraph1 className="text-gray-700 leading-relaxed mb-3">
                  Refunds may only be issued in the following situations:
                </Paragraph1>
                <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-2 mb-3">
                  <li>The item was never delivered.</li>
                  <li>
                    The item arrives with significant damage that prevents it
                    from being worn.
                  </li>
                  <li>
                    The item delivered is materially different from the listing.
                  </li>
                </ol>
                <Paragraph1 className="text-gray-700 leading-relaxed">
                  <strong>
                    Refund requests must be submitted within 24 hours of
                    delivery.
                  </strong>
                  Relisted Labels reserves the right to review all refund claims
                  before approval.
                </Paragraph1>
              </div>
            </div>
          </div>

          {/* Pricing Guidelines */}
          <div>
            <Header2 className="text-2xl font-bold mb-4">
              Pricing Guidelines
            </Header2>
            <Paragraph1 className="text-gray-700 leading-relaxed mb-3">
              While vendors are free to determine pricing, Relisted Labels
              recommends:
            </Paragraph1>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-black mb-2">
                Daily Rental Price:
              </h3>
              <Paragraph1 className="text-gray-700 leading-relaxed mb-4">
                <strong>8–10% of the item's original retail value.</strong>
              </Paragraph1>

              <h4 className="font-semibold text-black mb-2">Example:</h4>
              <ul className="space-y-1 text-gray-700 ml-4">
                <li>Retail Value: 240,000</li>
                <li>Rental Fee (10%): 24,000</li>
              </ul>

              <Paragraph1 className="text-gray-700 leading-relaxed mt-4">
                This structure balances accessibility for renters with
                profitability for vendors.
              </Paragraph1>
            </div>
          </div>

          {/* Contact Us */}
          <div className="bg-gray-100 p-6 rounded-lg">
            <Header2 className="text-2xl font-bold mb-4">Contact Us</Header2>
            <Paragraph1 className="text-gray-700 leading-relaxed mb-4">
              If you have any questions about these Terms and Conditions or need
              support, please reach out to us:
            </Paragraph1>
            <div className="space-y-3 text-gray-700">
              <p>
                <strong>Email:</strong> relistedlabels.contact@gmail.com
              </p>
              <p>
                <strong>Location:</strong> Lagos, Nigeria
              </p>
              <p className="text-sm text-gray-600 mt-4">
                We aim to respond to all inquiries within 24–48 hours.
              </p>
            </div>
          </div>

          {/* Last Update */}
          <div className="border-t border-gray-200 pt-8 text-center text-gray-600">
            <p className="text-sm">
              Last updated: March 2026
              <br />© 2026 RELISTED. All rights reserved.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
