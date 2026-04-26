// app/privacy/web/page.tsx
// (Works in Next.js App Router. For Pages Router, export this from pages/privacy/web.tsx)

export default function PrivacyPolicyWebPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
        Privacy Policy
      </h1>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          What Data Is Collected
        </h2>

        <h3 className="mt-6 text-base font-semibold text-gray-900 dark:text-white">
          Account-related data
        </h3>
        <ul className="mt-2 list-disc pl-6 text-gray-700 dark:text-gray-300">
          <li>Username</li>
          <li>Encrypted authentication credentials</li>
          <li>Donation History</li>
        </ul>

        <h3 className="mt-6 text-base font-semibold text-gray-900 dark:text-white">
          Preferences and settings
        </h3>
        <ul className="mt-2 list-disc pl-6 text-gray-700 dark:text-gray-300">
          <li>App configuration and user preference data</li>
        </ul>

        <h3 className="mt-6 text-base font-semibold text-gray-900 dark:text-white">
          Academic data
        </h3>
        <ul className="mt-2 list-disc pl-6 text-gray-700 dark:text-gray-300">
          <li>
            Academic data is retrieved from school systems via a proxy and is relayed to the user’s browser to provide the service.
          </li>
        </ul>

        <p className="mt-5 text-gray-700 dark:text-gray-300">
          Grade Durian does <strong>not</strong> store academic records, grades,
          or school-provided educational data long-term on its servers.
        </p>
      </section>

      <hr className="my-10 border-gray-200 dark:border-gray-800" />

      <section>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Data Storage &amp; Security
        </h2>

        <ul className="mt-3 list-disc pl-6 text-gray-700 dark:text-gray-300">
          <li>
            User preferences and settings are stored securely on Grade Durian&apos;s
            servers
          </li>
          <li>Authentication data is hashed or encrypted</li>
          <li>No plain-text passwords are stored</li>
          <li>
            Academic data is handled transiently and is
            not retained beyond what is necessary to fulfill user requests
          </li>
        </ul>
      </section>

      <hr className="my-10 border-gray-200 dark:border-gray-800" />

      <section>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Data Retention and Deletion
        </h2>

        <p className="mt-3 text-gray-700 dark:text-gray-300">
          User preference data is retained only to provide functionality and is
          automatically removed when a user resets their preferences or clears their browser data.
        </p>
      </section>
    </main>
  );
}
