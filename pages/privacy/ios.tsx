import React from "react";

export default function PrivacyPolicyIOSPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-3xl font-semibold tracking-tight dark:text-white">
        Privacy Policy (iOS App)
      </h1>

      <p className="mt-4 text-base text-gray-700 dark:text-gray-300">
        <strong>
          This Privacy Policy applies only to the Grade Durian iOS app.
        </strong>
      </p>

      <section className="mt-8">
        <h2 className="text-xl font-semibold dark:text-white">
          What Data Is Collected
        </h2>

        <h3 className="mt-5 text-base font-semibold dark:text-white">
          Analytics and behavioral data
        </h3>
        <ul className="mt-2 list-disc pl-6 text-gray-700 dark:text-gray-300">
          <li>A device-generated UUID</li>
          <li>Behavioral events</li>
        </ul>

        <h3 className="mt-5 text-base font-semibold dark:text-white">
          Account-related data
        </h3>
        <ul className="mt-2 list-disc pl-6 text-gray-700 dark:text-gray-300">
          <li>A hashed user identifier</li>
          <li>
            Encrypted authentication-related data used solely to associate and
            authenticate user preferences
          </li>
        </ul>

        <h3 className="mt-5 text-base font-semibold dark:text-white">
          Preferences and settings
        </h3>
        <ul className="mt-2 list-disc pl-6 text-gray-700 dark:text-gray-300">
          <li>App configuration and user preference data</li>
        </ul>

        <h3 className="mt-5 text-base font-semibold dark:text-white">
          Advertising data
        </h3>
        <ul className="mt-2 list-disc pl-6 text-gray-700 dark:text-gray-300">
          <li>
            Grade Durian displays mobile ads served by Google (Google AdMob /
            Google Mobile Ads)
          </li>
          <li>
            Google may collect device identifiers, IP address, and behavioral
            signals to serve personalized ads, subject to your ATT (App Tracking
            Transparency) consent
          </li>
          <li>
            Google&apos;s data practices are governed by the{" "}
            <strong>Google Privacy Policy</strong> and its AdMob terms; Grade
            Melon does not control or receive this data
          </li>
        </ul>

        <p className="mt-5 text-gray-700 dark:text-gray-300">
          Grade Durian does <strong>not</strong> store academic records, grades,
          or school-provided educational data on its servers. Academic data is
          exchanged{" "}
          <strong>
            directly between the user’s device and the school’s Synergy/Edupoint
            systems
          </strong>{" "}
          and is{" "}
          <strong>
            not transmitted to, processed by, or stored on Grade Durian’s servers
          </strong>
          .
        </p>
      </section>

      <hr className="my-10 border-gray-200 dark:border-gray-800" />

      <section>
        <h2 className="text-xl font-semibold dark:text-white">
          Data Storage &amp; Security
        </h2>
        <ul className="mt-3 list-disc pl-6 text-gray-700 dark:text-gray-300">
          <li>
            User preferences and settings are stored securely on Grade Durian’s
            servers
          </li>
          <li>All identifiers are hashed or encrypted</li>
          <li>No plain-text credentials are stored</li>
          <li>
            Academic data retrieved from school systems is processed locally on
            the user’s device
          </li>
          <li>
            Grade Durian’s servers do not proxy, log, or inspect academic data
            requests
          </li>
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold dark:text-white">
          Data Retention and Deletion
        </h2>
        <p className="mt-3 text-gray-700 dark:text-gray-300">
          User preference data is retained only to provide app functionality and
          may be deleted when a user resets their preferences or by request
          at{" "}
          <a className="underline" href="mailto:support@gradedurian">
            support@gradedurian
          </a>
          .
        </p>

        <p className="mt-4 text-gray-700 dark:text-gray-300">
          Analytics data is aggregated and cannot be traced back to individual
          users. It therefore cannot be isolated or deleted.
        </p>
      </section>
    </main>
  );
}
