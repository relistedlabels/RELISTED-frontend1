"use client";

import { Header1Plus, Header2, Paragraph1 } from "@/common/ui/Text";
import React from "react";

export default function PrivacyPolicy() {
  return (
    <div className="w-full bg-white">
      {/* Hero Section */}
      <section className="w-full bg-black text-white py-12 sm:py-20 px-4 sm:px-0">
        <div className="container mx-auto">
          <Header1Plus className="text-3xl sm:text-4xl tracking-wide uppercase mb-4">
            Privacy Policy
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
            <Header2 className="text-2xl font-bold mb-4">Introduction</Header2>
            <Paragraph1 className="text-gray-700 leading-relaxed">
              RELISTED ("we", "us", "our", or "Company") operates the RELISTED
              website and mobile application (collectively, the "Service").
              <br />
              <br />
              This page informs you of our policies regarding the collection,
              use, and disclosure of personal data when you use our Service and
              the choices you have associated with that data. We use your data
              to provide and improve the Service. By using the Service, you
              agree to the collection and use of information in accordance with
              this policy.
            </Paragraph1>
          </div>

          {/* Information Collection */}
          <div>
            <Header2 className="text-2xl font-bold mb-4">
              1. Information Collection and Use
            </Header2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Types of Data Collected
                </h3>
                <div className="space-y-4 text-gray-700">
                  <div>
                    <h4 className="font-semibold text-black mb-1">
                      Personal Data:
                    </h4>
                    <Paragraph1>
                      While using our Service, we may ask you to provide us with
                      certain personally identifiable information that can be
                      used to contact or identify you ("Personal Data"). This
                      may include, but is not limited to:
                    </Paragraph1>
                    <ul className="list-disc list-inside mt-2 space-y-1 text-gray-700 ml-2">
                      <li>Email address</li>
                      <li>First name and last name</li>
                      <li>Phone number</li>
                      <li>Address, State, Province, ZIP/Postal code, City</li>
                      <li>Cookies and Usage Data</li>
                      <li>
                        Payment information (processed securely via third-party
                        providers)
                      </li>
                      <li>
                        Profile information (size preferences, style interests,
                        rental history)
                      </li>
                      <li>
                        Uploaded photos (for product listings or profile
                        pictures)
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-black mb-1">
                      Usage Data:
                    </h4>
                    <Paragraph1>
                      We may also collect information on how the Service is
                      accessed and used ("Usage Data"). This may include
                      information such as:
                    </Paragraph1>
                    <ul className="list-disc list-inside mt-2 space-y-1 text-gray-700 ml-2">
                      <li>
                        Computer's Internet Protocol address (e.g. IP address)
                      </li>
                      <li>Browser type and version</li>
                      <li>
                        Pages you visit and the time and date of your visits
                      </li>
                      <li>The time spent on those pages</li>
                      <li>Device identifiers</li>
                      <li>Operating system and platform</li>
                      <li>Referral sources</li>
                      <li>Links clicked and search queries</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-black mb-1">
                      Location Data:
                    </h4>
                    <Paragraph1>
                      We may collect and process information about your precise
                      or approximate location (with your permission) to provide
                      location-based services such as personalized shopping
                      recommendations and delivery options.
                    </Paragraph1>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Use of Data */}
          <div>
            <Header2 className="text-2xl font-bold mb-4">
              2. Use of Data
            </Header2>
            <Paragraph1 className="text-gray-700 leading-relaxed mb-4">
              RELISTED uses the collected data for various purposes:
            </Paragraph1>
            <ul className="list-disc list-inside space-y-3 text-gray-700 ml-2">
              <li>To provide and maintain the Service</li>
              <li>To notify you about changes to our Service</li>
              <li>
                To allow you to participate in interactive features of our
                Service when you choose to do so
              </li>
              <li>To provide customer care and support</li>
              <li>
                To gather analysis or valuable information so that we can
                improve the Service
              </li>
              <li>To monitor the usage of the Service</li>
              <li>
                To detect, prevent and address technical issues and fraudulent
                activity
              </li>
              <li>
                To send promotional communications (with your consent),
                including updates about new products, special offers, and other
                information
              </li>
              <li>To process rental transactions and payments</li>
              <li>To verify identity and prevent fraud</li>
              <li>To comply with legal and regulatory requirements</li>
            </ul>
          </div>

          {/* Security of Data */}
          <div>
            <Header2 className="text-2xl font-bold mb-4">
              3. Security of Data
            </Header2>
            <Paragraph1 className="text-gray-700 leading-relaxed">
              The security of your data is important to us, but remember that no
              method of transmission over the Internet or method of electronic
              storage is 100% secure. While we strive to use commercially
              acceptable means to protect your Personal Data, we cannot
              guarantee its absolute security.
              <br />
              <br />
              We implement appropriate technical and organizational measures to
              protect your personal data, including:
            </Paragraph1>
            <ul className="list-disc list-inside space-y-3 text-gray-700 ml-2 mt-4">
              <li>
                Encryption of data in transit using SSL/TLS protocols and at
                rest
              </li>
              <li>Secure password storage using industry-standard hashing</li>
              <li>Regular security audits and vulnerability assessments</li>
              <li>Access controls and authentication mechanisms</li>
              <li>
                Confidentiality agreements with our employees and partners
              </li>
              <li>Incident response procedures for potential data breaches</li>
            </ul>
          </div>

          {/* Disclosure of Data */}
          <div>
            <Header2 className="text-2xl font-bold mb-4">
              4. Disclosure of Data
            </Header2>
            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="font-semibold text-black mb-2">
                  Business Transfers
                </h3>
                <Paragraph1>
                  If RELISTED is involved in a merger, acquisition or asset
                  sale, your Personal Data may be transferred as part of that
                  transaction. We will provide notice before your Personal Data
                  becomes subject to a different Privacy Policy.
                </Paragraph1>
              </div>

              <div>
                <h3 className="font-semibold text-black mb-2">
                  By Law Requirement
                </h3>
                <Paragraph1>
                  Under certain circumstances, RELISTED may be required to
                  disclose your Personal Data if required to do so by law or in
                  response to valid requests by public authorities (e.g. court
                  order or government agency).
                </Paragraph1>
              </div>

              <div>
                <h3 className="font-semibold text-black mb-2">
                  Service Providers
                </h3>
                <Paragraph1>
                  We may employ third party companies and individuals to
                  facilitate our Service ("Service Providers"), to provide the
                  Service on our behalf, to perform Service-related services or
                  to assist us in analyzing how our Service is used. These third
                  parties have access to your Personal Data only to perform
                  these tasks on our behalf and are obligated not to disclose or
                  use it for any other purpose. Service providers include
                  payment processors, hosting providers, analytics services, and
                  shipping/logistics partners.
                </Paragraph1>
              </div>

              <div>
                <h3 className="font-semibold text-black mb-2">
                  Other Users and Public
                </h3>
                <Paragraph1>
                  When you create a listing or public profile, certain
                  information (such as your name, profile picture, and listings)
                  may be visible to other users and the public.
                </Paragraph1>
              </div>
            </div>
          </div>

          {/* Cookies */}
          <div>
            <Header2 className="text-2xl font-bold mb-4">5. Cookies</Header2>
            <Paragraph1 className="text-gray-700 leading-relaxed mb-4">
              We use cookies and similar tracking technologies to track activity
              on our Service and hold certain information. Cookies are files
              with small amount of data which may include an anonymous unique
              identifier.
            </Paragraph1>
            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="font-semibold text-black mb-2">
                  Types of Cookies We Use:
                </h3>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>
                    <strong>Essential Cookies:</strong> Required for the
                    functioning of the Service
                  </li>
                  <li>
                    <strong>Performance Cookies:</strong> Help us understand how
                    you use the Service
                  </li>
                  <li>
                    <strong>Functional Cookies:</strong> Remember your
                    preferences
                  </li>
                  <li>
                    <strong>Advertising Cookies:</strong> Display personalized
                    advertisements
                  </li>
                </ul>
              </div>
              <div>
                <Paragraph1>
                  You can instruct your browser to refuse all cookies or to
                  indicate when a cookie is being sent. However, if you do not
                  accept cookies, you may not be able to use some portions of
                  our Service.
                </Paragraph1>
              </div>
            </div>
          </div>

          {/* Your Rights */}
          <div>
            <Header2 className="text-2xl font-bold mb-4">
              6. Your Rights
            </Header2>
            <Paragraph1 className="text-gray-700 leading-relaxed mb-4">
              You have the right to access, correct, or delete your Personal
              Data. You also have the right to restrict our use of your data or
              object to processing. To exercise these rights, please contact us
              using the information provided in the Contact Us section below.
            </Paragraph1>
            <div className="space-y-3 text-gray-700">
              <div>
                <h3 className="font-semibold text-black mb-2">GDPR Rights</h3>
                <Paragraph1>
                  If you are a resident of the European Union, you have certain
                  data protection rights under the General Data Protection
                  Regulation (GDPR):
                </Paragraph1>
                <ul className="list-disc list-inside space-y-2 mt-2 ml-2">
                  <li>Right to be informed</li>
                  <li>Right of access to your personal data</li>
                  <li>Right to rectification of inaccurate data</li>
                  <li>Right to erasure ("right to be forgotten")</li>
                  <li>Right to restrict processing</li>
                  <li>Right to data portability</li>
                  <li>Right to object</li>
                  <li>Rights related to automated decision-making</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-black mb-2">
                  CCPA Rights (California Residents)
                </h3>
                <Paragraph1>
                  If you are a California resident, you have the following
                  rights:
                </Paragraph1>
                <ul className="list-disc list-inside space-y-2 mt-2 ml-2">
                  <li>Right to know what personal information is collected</li>
                  <li>
                    Right to know whether personal information is sold/shared
                  </li>
                  <li>Right to delete personal information collected</li>
                  <li>
                    Right to opt-out of the sale/sharing of personal information
                  </li>
                  <li>Right to correct inaccurate personal information</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Data Retention */}
          <div>
            <Header2 className="text-2xl font-bold mb-4">
              7. Data Retention
            </Header2>
            <Paragraph1 className="text-gray-700 leading-relaxed">
              We will retain your Personal Data only for as long as necessary to
              provide our Service and to comply with our legal obligations. The
              retention period may vary depending on the type of data and the
              purpose for which we process it.
              <br />
              <br />
              For example:
            </Paragraph1>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2 mt-4">
              <li>
                Account data: Retained for the duration of your membership
              </li>
              <li>
                Transaction data: Retained for 7 years for tax and legal
                compliance
              </li>
              <li>Marketing communications: Retained until you unsubscribe</li>
              <li>
                Cookies: Typically deleted when browser is closed or after
                specified period
              </li>
              <li>
                User-generated content: Retained for the duration of the
                account, unless deleted by user
              </li>
            </ul>
          </div>

          {/* Third-Party Links */}
          <div>
            <Header2 className="text-2xl font-bold mb-4">
              8. Third-Party Links
            </Header2>
            <Paragraph1 className="text-gray-700 leading-relaxed">
              Our Service may contain links to other sites that are not operated
              by us. If you click on a third party link, you will be directed to
              that third party's site. We strongly advise you to review the
              Privacy Policy of every site you visit.
              <br />
              <br />
              We have no control over and assume no responsibility for the
              content, privacy policies or practices of any third party sites or
              services.
            </Paragraph1>
          </div>

          {/* Children's Privacy */}
          <div>
            <Header2 className="text-2xl font-bold mb-4">
              9. Children's Privacy
            </Header2>
            <Paragraph1 className="text-gray-700 leading-relaxed">
              Our Service is not addressed to anyone under the age of 13
              ("Children"). We do not knowingly collect personally identifiable
              information from children under 13. If we become aware that a
              child under 13 has provided us with Personal Data, we immediately
              delete such information from our servers. If you are a parent or
              guardian and you are aware that your child has provided us with
              Personal Data, please contact us immediately.
            </Paragraph1>
          </div>

          {/* Changes to This Privacy Policy */}
          <div>
            <Header2 className="text-2xl font-bold mb-4">
              10. Changes to This Privacy Policy
            </Header2>
            <Paragraph1 className="text-gray-700 leading-relaxed">
              We may update our Privacy Policy from time to time. We will notify
              you of any changes by posting the new Privacy Policy on this page
              and updating the "effective date" at the top of this Privacy
              Policy.
              <br />
              <br />
              You are advised to review this Privacy Policy periodically for any
              changes. Changes to this Privacy Policy are effective when they
              are posted on this page.
            </Paragraph1>
          </div>

          {/* Contact Us */}
          <div className="bg-gray-100 p-6 rounded-lg">
            <Header2 className="text-2xl font-bold mb-4">
              11. Contact Us
            </Header2>
            <Paragraph1 className="text-gray-700 leading-relaxed">
              If you have any questions about this Privacy Policy, please
              contact us at:
            </Paragraph1>
            <div className="mt-4 space-y-2 text-gray-700">
              <p>
                <strong>Email:</strong> privacy@relisted.com
              </p>
              <p>
                <strong>Address:</strong> RELISTED, [Your Address], [City],
                [Country]
              </p>
              <p>
                <strong>Phone:</strong> +1 (XXX) XXX-XXXX
              </p>
              <p className="text-sm text-gray-600 mt-4">
                We will respond to your request within 30 days of receiving it.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
