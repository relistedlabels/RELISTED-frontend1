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
            Last updated: February 2026
          </Paragraph1>
        </div>
      </section>

      {/* Content Section */}
      <section className="w-full py-12 sm:py-20 px-4 sm:px-0">
        <div className="container mx-auto max-w-4xl space-y-8">
          {/* Introduction */}
          <div>
            <Header2 className="text-2xl font-bold mb-4">
              1. Agreement to Terms & RELISTED Labels Protection Framework
            </Header2>
            <Paragraph1 className="text-gray-700 leading-relaxed">
              These Terms and Conditions ("Terms", "Agreement") are an agreement
              between RELISTED Labels ("Company", "we", "us", "our") and you
              ("User", "you", "your"). By accessing and using the RELISTED
              Labels Labels website, mobile application, and all related
              services (collectively, the "Service"), you acknowledge that you
              have read, understood, and agree to be bound by all of the terms
              and conditions contained herein.
              <br />
              <br />
              RELISTED Labels is a peer-to-peer fashion rental platform
              supported by secure payment infrastructure powered by Wema Bank,
              logistics services provided by Topship, and comprehensive
              collateral protection to safeguard item value. Our protection
              framework ensures vendors maintain full ownership and control of
              their items, renters receive items that match their descriptions,
              and all transactions are secure and transparent.
              <br />
              <br />
              We reserve the right to make changes to these Terms at any time,
              with notice provided to users. If any provision is deemed invalid,
              that provision shall be severable and shall not affect the
              remaining terms.
            </Paragraph1>
          </div>

          {/* Use License */}
          <div>
            <Header2 className="text-2xl font-bold mb-4">
              2. Use License
            </Header2>
            <Paragraph1 className="text-gray-700 leading-relaxed mb-4">
              Permission is granted to temporarily download one copy of the
              materials (information or software) on RELISTED Labels's Service
              for personal, non-commercial transitory viewing only. This is the
              grant of a license, not a transfer of title, and under this
              license you may not:
            </Paragraph1>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2">
              <li>Modifying or copying the materials</li>
              <li>
                Using the materials for any commercial purpose or for any public
                display
              </li>
              <li>Attempting to decompile or reverse engineer any software</li>
              <li>Removing any copyright or other proprietary notations</li>
              <li>Transferring the materials to another person or "mirror"</li>
              <li>
                Using the materials for any illegal purpose or in violation of
                any regulations
              </li>
              <li>Accessing the materials through automated means</li>
              <li>
                Attempting to gain unauthorized access to any portion or feature
                of the Service
              </li>
            </ul>
          </div>

          {/* User Accounts */}
          <div>
            <Header2 className="text-2xl font-bold mb-4">
              3. User Accounts
            </Header2>
            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="font-semibold text-black mb-2">
                  Account Creation and Responsibility
                </h3>
                <Paragraph1>
                  When you create an account on RELISTED Labels, you agree to:
                </Paragraph1>
                <ul className="list-disc list-inside space-y-2 mt-2 ml-2">
                  <li>
                    Provide accurate, current, and complete information during
                    registration
                  </li>
                  <li>
                    Maintain the confidentiality of your account password and
                    login credentials
                  </li>
                  <li>
                    Accept responsibility for all activities that occur under
                    your account
                  </li>
                  <li>
                    Notify us immediately of any unauthorized use of your
                    account
                  </li>
                  <li>Be at least 18 years of age to use the Service</li>
                  <li>
                    Not create multiple accounts for fraudulent purposes or to
                    circumvent account restrictions
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-black mb-2">
                  Account Termination
                </h3>
                <Paragraph1>
                  We reserve the right to suspend or terminate your account at
                  any time for violation of these Terms, including but not
                  limited to: fraudulent activity, non-payment, violation of
                  community guidelines, or other conduct we deem inappropriate.
                </Paragraph1>
              </div>
            </div>
          </div>

          {/* Rental Terms */}
          <div>
            <Header2 className="text-2xl font-bold mb-4">
              4. Rental Terms & Collateral Protection
            </Header2>
            <div className="space-y-6 text-gray-700">
              <div>
                <h3 className="font-semibold text-black mb-2">
                  Rental Agreement
                </h3>
                <Paragraph1>
                  By renting an item (as a "Renter"), you enter into a rental
                  agreement with the vendor (\"Lister\"). RELISTED Labels
                  facilitates this transaction but is not a party to the rental
                  agreement itself. The rental terms, including duration, price,
                  and return conditions, are specified in the listing and
                  checkout process.
                </Paragraph1>
              </div>

              <div>
                <h3 className="font-semibold text-black mb-2">
                  Transparent Pricing
                </h3>
                <Paragraph1>
                  The full rental cost displayed at checkout includes:
                </Paragraph1>
                <ul className="list-disc list-inside space-y-2 mt-2 ml-2">
                  <li>
                    Vendor rental price (8-10% of item's original retail value)
                  </li>
                  <li>Platform service fee</li>
                  <li>Delivery fees via Topship</li>
                  <li>Professional dry cleaning cost</li>
                  <li>Applicable taxes</li>
                </ul>
                <Paragraph1 className="mt-3">
                  No additional hidden fees will be charged beyond those shown
                  during checkout.
                </Paragraph1>
              </div>

              <div>
                <h3 className="font-semibold text-black mb-2">
                  Collateral Deposit & Protection
                </h3>
                <Paragraph1>
                  To protect vendors from potential loss or damage, every rental
                  includes a collateral deposit:
                </Paragraph1>
                <ul className="list-disc list-inside space-y-2 mt-2 ml-2">
                  <li>
                    Collateral typically ranges from 60–80% of the item's
                    original retail value
                  </li>
                  <li>
                    Temporarily held during the rental period via secure Wema
                    Bank wallet
                  </li>
                  <li>
                    Released automatically after item return and inspection (if
                    no damage)
                  </li>
                  <li>
                    Deducted to cover repair or replacement costs if item is
                    damaged
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-black mb-2\">
                  Item Condition Standards
                </h3>
                <Paragraph1>
                  RELISTED Labels follows standard condition guidelines used
                  across fashion rental platforms:
                </Paragraph1>

                <h4 className="font-semibold text-black mt-4 mb-2\">
                  Acceptable Rental Wear:
                </h4>
                <Paragraph1>
                  Normal wear from responsible use is expected and does NOT
                  qualify as damage:
                </Paragraph1>
                <ul className="list-disc list-inside space-y-2 mt-2 ml-2">
                  <li>Light wrinkles</li>
                  <li>Minor fabric softening</li>
                  <li>Minimal signs of wear consistent with short-term use</li>
                </ul>

                <h4 className="font-semibold text-black mt-4 mb-2\">
                  Damage (Renter Liability):
                </h4>
                <Paragraph1>
                  Damage refers to any condition that affects the garment's
                  appearance, structure, or usability:
                </Paragraph1>
                <ul className="list-disc list-inside space-y-2 mt-2 ml-2">
                  <li>Permanent stains</li>
                  <li>Tears or rips</li>
                  <li>Broken zippers or closures</li>
                  <li>Missing embellishments or components</li>
                  <li>Burn marks</li>
                  <li>Stretching or deformation of the garment</li>
                </ul>
                <Paragraph1 className="mt-3">
                  If damage occurs, repair costs will be deducted from the
                  renter's collateral.
                </Paragraph1>

                <h4 className="font-semibold text-black mt-4 mb-2\">
                  Severe Damage or Loss (Total Collateral Forfeiture):
                </h4>
                <Paragraph1>
                  If an item is lost, not returned, or returned in unusable
                  condition, RELISTED Labels may deduct up to the full
                  collateral amount to compensate the vendor.
                </Paragraph1>
              </div>

              <div>
                <h3 className="font-semibold text-black mb-2\">
                  Late Return Policy
                </h3>
                <Paragraph1>
                  Items must be returned on the agreed rental end date through
                  the designated Topship logistics provider.
                </Paragraph1>
                <ul className="list-disc list-inside space-y-2 mt-2 ml-2">
                  <li>
                    10% of the collateral value will be deducted for each day
                    the item is overdue
                  </li>
                  <li>
                    This daily deduction continues until the item is returned OR
                    the collateral value is fully exhausted
                  </li>
                </ul>
                <Paragraph1 className="mt-3">
                  This policy protects vendors from lost rental opportunities
                  and delayed inventory availability.
                </Paragraph1>
              </div>

              <div>
                <h3 className="font-semibold text-black mb-2\">
                  Cancellation & Refund Policy
                </h3>
                <Paragraph1>
                  <strong>
                    Once a rental request is confirmed by the vendor and payment
                    is completed, the booking is considered final.
                  </strong>
                </Paragraph1>

                <h4 className="font-semibold text-black mt-3 mb-2\">
                  Cancellations:
                </h4>
                <Paragraph1>
                  RELISTED Labels does not allow cancellations after
                  confirmation and payment. This policy ensures vendors can
                  reliably plan inventory availability.
                </Paragraph1>

                <h4 className="font-semibold text-black mt-3 mb-2\">
                  Refund Eligibility:
                </h4>
                <Paragraph1>
                  Refunds may only be issued in these situations:
                </Paragraph1>
                <ul className="list-disc list-inside space-y-2 mt-2 ml-2">
                  <li>The item was never delivered</li>
                  <li>
                    The item arrives with significant damage that prevents it
                    from being worn
                  </li>
                  <li>
                    The item delivered is materially different from the listing
                  </li>
                </ul>
                <Paragraph1 className="mt-3">
                  <strong>
                    Refund requests must be submitted within 24 hours of
                    delivery.
                  </strong>
                  RELISTED Labels reserves the right to review all refund claims
                  before approval.
                </Paragraph1>
              </div>

              <div>
                <h3 className="font-semibold text-black mb-2\">
                  Shipping & Returns via Topship
                </h3>

                <h4 className="font-semibold text-black mt-3 mb-2\">
                  Delivery Process:
                </h4>
                <ol className="list-decimal list-inside space-y-2 mt-2 ml-2">
                  <li>Renter submits a rental request</li>
                  <li>Vendor confirms availability</li>
                  <li>Topship collects the item from the vendor</li>
                  <li>Item is delivered to the renter</li>
                </ol>

                <h4 className="font-semibold text-black mt-4 mb-2\">
                  Return Process:
                </h4>
                <ol className="list-decimal list-inside space-y-2 mt-2 ml-2">
                  <li>
                    At the end of rental period, renter returns item through
                    Topship
                  </li>
                  <li>Vendor confirms the item's condition upon return</li>
                  <li>
                    Renter's collateral is released if no issues are identified
                  </li>
                </ol>
                <Paragraph1 className="mt-3">
                  RELISTED Labels is not responsible for delays caused by
                  third-party logistics providers (Topship).
                </Paragraph1>
              </div>

              <div>
                <h3 className="font-semibold text-black mb-2\">
                  Cleaning & Garment Care
                </h3>
                <Paragraph1>
                  Professional dry cleaning is included within the rental cost
                  paid by the renter.
                </Paragraph1>
                <h4 className="font-semibold text-black mt-3 mb-2\">
                  Vendor Responsibilities:
                </h4>
                <ul className="list-disc list-inside space-y-2 mt-2 ml-2">
                  <li>Must arrange professional cleaning after each rental</li>
                  <li>
                    RELISTED Labels may recommend trusted cleaning partners, but
                    vendors may use preferred services
                  </li>
                </ul>

                <h4 className="font-semibold text-black mt-3 mb-2\">
                  Renter Responsibilities:
                </h4>
                <ul className="list-disc list-inside space-y-2 mt-2 ml-2">
                  <li>Handle garments with care during rental period</li>
                  <li>Avoid attempting to clean delicate items themselves</li>
                  <li>Return items in the condition received</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Lister Responsibilities */}
          <div>
            <Header2 className="text-2xl font-bold mb-4">
              5. Lister Responsibilities
            </Header2>
            <Paragraph1 className="text-gray-700 leading-relaxed mb-4">
              If you are a Lister (seller who rents out items), you agree to:
            </Paragraph1>
            <ul className="list-disc list-inside space-y-3 text-gray-700 ml-2">
              <li>Provide accurate descriptions and photos of rental items</li>
              <li>
                Ensure items are clean, functional, and in good working
                condition at the time of rental
              </li>
              <li>Disclose any defects or damage prior to rental</li>
              <li>
                Not misrepresent brand, condition, size, or other material
                characteristics
              </li>
              <li>
                Ship items promptly and provide tracking information to the
                Renter
              </li>
              <li>
                Handle returns promptly and refund deposits for items in
                acceptable condition
              </li>
              <li>
                Not solicit or conduct transactions outside the RELISTED Labels
                platform to avoid fees
              </li>
              <li>
                Maintain accurate and current contact information and respond to
                inquiries within 24 hours
              </li>
              <li>
                Not engage in fraudulent activity, price gouging, or deceptive
                practices
              </li>
              <li>
                Indemnify RELISTED Labels for damage claims exceeding rental
                price by the Renter
              </li>
            </ul>
          </div>

          {/* User Content */}
          <div>
            <Header2 className="text-2xl font-bold mb-4">
              6. User-Generated Content
            </Header2>
            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="font-semibold text-black mb-2">
                  Ownership and Rights
                </h3>
                <Paragraph1>
                  You retain all rights to content you create and upload to
                  RELISTED Labels (including product photos, descriptions, and
                  reviews). By uploading content, you grant RELISTED Labels a
                  worldwide, non-exclusive, royalty-free license to use,
                  reproduce, modify, and distribute your content for the
                  purposes of operating and promoting the Service.
                </Paragraph1>
              </div>

              <div>
                <h3 className="font-semibold text-black mb-2">
                  Prohibited Content
                </h3>
                <Paragraph1>You agree not to upload or post:</Paragraph1>
                <ul className="list-disc list-inside space-y-2 mt-2 ml-2">
                  <li>
                    Content that is defamatory, abusive, or threatening toward
                    others
                  </li>
                  <li>Sexually explicit or obscene content</li>
                  <li>
                    Content that infringes on intellectual property rights
                  </li>
                  <li>Spam, promotional content, or misleading information</li>
                  <li>
                    Content that violates any laws or regulations in your
                    jurisdiction
                  </li>
                  <li>Personal information of others without consent</li>
                  <li>Counterfeit or stolen items</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-black mb-2">
                  Content Moderation
                </h3>
                <Paragraph1>
                  We reserve the right to remove, edit, or refuse to publish any
                  content that violates these Terms or our community guidelines,
                  at our sole discretion. Repeated violations may result in
                  account suspension or termination.
                </Paragraph1>
              </div>
            </div>
          </div>

          {/* Intellectual Property */}
          <div>
            <Header2 className="text-2xl font-bold mb-4">
              7. Intellectual Property Rights
            </Header2>
            <Paragraph1 className="text-gray-700 leading-relaxed mb-4">
              The Service and its original content, features, and functionality
              are owned by RELISTED Labels, its licensors, or other providers of
              such material and are protected by international copyright,
              trademark, and other intellectual property laws.
            </Paragraph1>
            <div className="space-y-4 text-gray-700">
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>
                  You may not reproduce, distribute, or transmit any content
                  from the Service without our express written permission
                </li>
                <li>
                  The RELISTED Labels name, logo, and all related marks are
                  trademarks of RELISTED Labels
                </li>
                <li>
                  You may not use our trademarks in connection with your
                  business or products without prior written permission
                </li>
              </ul>
            </div>
          </div>

          {/* Limitation of Liability */}
          <div>
            <Header2 className="text-2xl font-bold mb-4">
              8. Limitation of Liability
            </Header2>
            <Paragraph1 className="text-gray-700 leading-relaxed mb-4">
              IN NO EVENT SHALL RELISTED LABELS, ITS DIRECTORS, EMPLOYEES, OR
              AGENTS BE LIABLE TO YOU FOR ANY DAMAGES, INCLUDING LOST PROFITS,
              LOST REVENUE, LOST DATA, OR OTHER CONSEQUENTIAL, DIRECT, INDIRECT,
              SPECIAL, PUNITIVE, OR INCIDENTAL DAMAGES RESULTING FROM:
            </Paragraph1>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2 mb-4">
              <li>Your use of or inability to use the Service</li>
              <li>Any conduct or content of any third party on the Service</li>
              <li>Any content obtained from the Service</li>
              <li>
                Unauthorized access to or alteration of your transmissions
              </li>
              <li>Statements or conduct of any third party on the Service</li>
              <li>Any other matter relating to the Service</li>
            </ul>
            <Paragraph1 className="text-gray-700 leading-relaxed">
              Some jurisdictions do not allow the exclusion of certain
              warranties or limitation of liability, so some of the above
              limitations may not apply to you. In such cases, our liability
              will be limited to the maximum extent permitted by law.
            </Paragraph1>
          </div>

          {/* Disclaimers */}
          <div>
            <Header2 className="text-2xl font-bold mb-4">
              9. Disclaimers
            </Header2>
            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="font-semibold text-black mb-2">
                  "AS IS" Disclaimer
                </h3>
                <Paragraph1>
                  The Service is provided on an "AS IS" and "AS AVAILABLE"
                  basis. RELISTED Labels makes no representations or warranties
                  of any kind, express or implied, regarding the Service,
                  including but not limited to: accuracy, reliability,
                  completeness, fitness for a particular purpose, or
                  non-infringement.
                </Paragraph1>
              </div>

              <div>
                <h3 className="font-semibold text-black mb-2">
                  No Guarantee of Availability
                </h3>
                <Paragraph1>
                  We do not guarantee that the Service will be uninterrupted,
                  error-free, secure, or free of viruses or other harmful
                  components. We are not liable for any downtime, data loss, or
                  system failures.
                </Paragraph1>
              </div>

              <div>
                <h3 className="font-semibold text-black mb-2">
                  Third-Party Content
                </h3>
                <Paragraph1>
                  RELISTED Labels does not control or endorse any content
                  provided by third parties, including Listers and other Users.
                  We are not responsible for the accuracy, quality, or legality
                  of such content.
                </Paragraph1>
              </div>
            </div>
          </div>

          {/* Dispute Resolution */}
          <div>
            <Header2 className="text-2xl font-bold mb-4">
              10. Dispute Resolution
            </Header2>
            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="font-semibold text-black mb-2">
                  Dispute Process
                </h3>
                <Paragraph1>
                  In the event of a dispute between you and another User
                  (Renter/Lister), or between you and RELISTED Labels, we
                  encourage you to first attempt to resolve the matter directly
                  with the other party. If direct resolution is unsuccessful,
                  you may submit a formal dispute to RELISTED Labels.
                </Paragraph1>
              </div>

              <div>
                <h3 className="font-semibold text-black mb-2">
                  Informal Resolution
                </h3>
                <Paragraph1>
                  Before pursuing formal legal action, you agree to attempt to
                  resolve the dispute through informal resolution by contacting
                  our support team at relistedlabels.contact@gmail.com. We will
                  attempt to facilitate a resolution within 14 days.
                </Paragraph1>
              </div>

              <div>
                <h3 className="font-semibold text-black mb-2">
                  Binding Arbitration
                </h3>
                <Paragraph1>
                  If the dispute cannot be resolved informally, both parties
                  agree to submit to binding arbitration in accordance with the
                  rules of the American Arbitration Association (AAA). The
                  arbitration will take place in the jurisdiction where RELISTED
                  Labels is headquartered. Each party will bear its own
                  attorney's fees and costs, except as provided by law.
                </Paragraph1>
              </div>

              <div>
                <h3 className="font-semibold text-black mb-2">
                  Class Action Waiver
                </h3>
                <Paragraph1>
                  You agree that any arbitration or legal action shall be
                  conducted on an individual basis and not as a class action,
                  class arbitration, or any other representative action. You
                  waive the right to participate in any class-wide lawsuit or
                  class arbitration against RELISTED Labels.
                </Paragraph1>
              </div>
            </div>
          </div>

          {/* Indemnification */}
          <div>
            <Header2 className="text-2xl font-bold mb-4">
              11. Indemnification
            </Header2>
            <Paragraph1 className="text-gray-700 leading-relaxed">
              You agree to indemnify, defend, and hold harmless RELISTED Labels
              and its officers, directors, employees, and agents from any and
              all claims, damages, losses, costs, and expenses (including
              reasonable attorney's fees) arising from or related to:
            </Paragraph1>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2 mt-4">
              <li>Your use of the Service</li>
              <li>
                Your violation of these Terms or any applicable laws or
                regulations
              </li>
              <li>Your infringement of any third-party rights</li>
              <li>Your user-generated content</li>
              <li>
                Your actions, conduct, or violations of others' rights while
                using the Service
              </li>
            </ul>
          </div>

          {/* Governing Law */}
          <div>
            <Header2 className="text-2xl font-bold mb-4">
              12. Governing Law and Jurisdiction
            </Header2>
            <Paragraph1 className="text-gray-700 leading-relaxed">
              These Terms and Conditions shall be governed by and construed in
              accordance with the laws of [Your Jurisdiction], without regard to
              its conflict of law provisions. You agree that any legal action or
              proceeding arising under these Terms shall be exclusively brought
              in the courts located in [Your Jurisdiction], and you hereby
              consent to the jurisdiction and venue of such courts.
            </Paragraph1>
          </div>

          {/* Entire Agreement */}
          <div>
            <Header2 className="text-2xl font-bold mb-4">
              13. Entire Agreement
            </Header2>
            <Paragraph1 className="text-gray-700 leading-relaxed">
              These Terms and Conditions, together with our Privacy Policy and
              any other policies or guidelines we publish, constitute the entire
              agreement between you and RELISTED Labels regarding your use of
              the Service. If any provision is found to be unenforceable, the
              remaining provisions shall continue in full force and effect.
            </Paragraph1>
          </div>

          {/* Severability */}
          <div>
            <Header2 className="text-2xl font-bold mb-4">
              14. Severability
            </Header2>
            <Paragraph1 className="text-gray-700 leading-relaxed">
              If any term, clause, or provision of these Terms is held to be
              invalid or unenforceable by a court of competent jurisdiction,
              such term shall be limited or eliminated to the minimum extent
              necessary, and the remaining provisions shall continue in full
              force and effect to the maximum extent permitted by law.
            </Paragraph1>
          </div>

          {/* Waiver */}
          <div>
            <Header2 className="text-2xl font-bold mb-4">15. Waiver</Header2>
            <Paragraph1 className="text-gray-700 leading-relaxed">
              The failure of RELISTED to enforce any right or provision of these
              Terms shall not constitute a waiver of that right or provision.
              Any waiver by RELISTED must be in writing and signed by an
              authorized representative.
            </Paragraph1>
          </div>

          {/* Contact Us */}
          <div className="bg-gray-100 p-6 rounded-lg">
            <Header2 className="text-2xl font-bold mb-4">
              16. Contact Us
            </Header2>
            <Paragraph1 className="text-gray-700 leading-relaxed">
              If you have any questions about these Terms and Conditions or need
              support, please reach out to us:
            </Paragraph1>
            <div className="mt-4 space-y-4 text-gray-700">
              <div>
                <p className="font-semibold text-black mb-2">
                  Support & General Inquiries:
                </p>
                <p>
                  <strong>Email:</strong> relistedlabels.contact@gmail.com
                </p>
              </div>
              <div>
                <p className="font-semibold text-black mb-2">Location:</p>
                <p>Lagos, Nigeria</p>
              </div>
              <p className="text-sm text-gray-600 mt-4">
                We aim to respond to all inquiries within 24–48 hours.
              </p>
            </div>
          </div>

          {/* Last Update */}
          <div className="border-t border-gray-200 pt-8 text-center text-gray-600">
            <p className="text-sm">
              Last updated: February 3, 2026
              <br />© 2026 RELISTED. All rights reserved.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
