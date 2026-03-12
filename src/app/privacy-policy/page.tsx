"use client";

import { Header1Plus, Header2, Paragraph1 } from "@/common/ui/Text";
import React from "react";

export default function PrivacyPolicy() {
  return (
    <div className="w-full bg-white">
      {/* Hero Section */}
      <section className="w-full bg-black text-white pt-20 py-12 sm:py-20 px-4 sm:px-0">
        <div className="container mx-auto">
          <Header1Plus className="text-3xl sm:text-4xl tracking-wide uppercase mb-4">
            Privacy Policy
          </Header1Plus>
          <Paragraph1 className="text-gray-300">
            Last updated: March 2026
          </Paragraph1>
        </div>
      </section>

      {/* Content Section */}
      <section className="w-full py-12 sm:py-20 px-4 sm:px-0">
        <div className="container mx-auto max-w-4xl space-y-8">
          {/* Introduction */}
          <div>
            <Header2 className="text-2xl font-bold mb-4">
              Privacy Policy
            </Header2>
            <Paragraph1 className="text-gray-700 leading-relaxed mb-4">
              Relisted Labels respects and protects the privacy of its users.
            </Paragraph1>
          </div>

          {/* Information We Collect */}
          <div>
            <Header2 className="text-2xl font-bold mb-4">
              Information We Collect
            </Header2>
            <Paragraph1 className="text-gray-700 leading-relaxed mb-4">
              We may collect the following information:
            </Paragraph1>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2">
              <li>Name</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>Delivery address</li>
              <li>Transaction history</li>
              <li>Device and browser data</li>
            </ul>
          </div>

          {/* How We Use Information */}
          <div>
            <Header2 className="text-2xl font-bold mb-4">
              How We Use Information
            </Header2>
            <Paragraph1 className="text-gray-700 leading-relaxed mb-4">
              Collected data is used to:
            </Paragraph1>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2">
              <li>Process rentals and payments</li>
              <li>Coordinate deliveries</li>
              <li>Provide customer support</li>
              <li>Improve platform performance</li>
              <li>Prevent fraud and abuse</li>
            </ul>
          </div>

          {/* Data Sharing */}
          <div>
            <Header2 className="text-2xl font-bold mb-4">Data Sharing</Header2>
            <Paragraph1 className="text-gray-700 leading-relaxed mb-4">
              We may share necessary information with trusted partners
              including:
            </Paragraph1>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2 mb-4">
              <li>Logistics providers (Topship)</li>
              <li>Payment processing systems (Wema Bank)</li>
            </ul>
            <Paragraph1 className="text-gray-700 leading-relaxed">
              Relisted Labels does not sell personal user data.
            </Paragraph1>
          </div>

          {/* Data Security */}
          <div>
            <Header2 className="text-2xl font-bold mb-4">Data Security</Header2>
            <Paragraph1 className="text-gray-700 leading-relaxed">
              We implement industry-standard security measures to protect user
              information from unauthorized access or misuse.
            </Paragraph1>
          </div>

          {/* User Rights */}
          <div>
            <Header2 className="text-2xl font-bold mb-4">User Rights</Header2>
            <Paragraph1 className="text-gray-700 leading-relaxed mb-4">
              Users may request to:
            </Paragraph1>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2 mb-4">
              <li>Access their personal data</li>
              <li>Correct inaccurate information</li>
              <li>Delete their accounts</li>
            </ul>
            <Paragraph1 className="text-gray-700 leading-relaxed">
              Requests can be submitted through customer support.
            </Paragraph1>
          </div>

          {/* Contact Us */}
          <div className="bg-gray-100 p-6 rounded-lg">
            <Header2 className="text-2xl font-bold mb-4">Contact Us</Header2>
            <Paragraph1 className="text-gray-700 leading-relaxed mb-4">
              If you have any questions about this Privacy Policy or to exercise
              your data rights, please contact us:
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
