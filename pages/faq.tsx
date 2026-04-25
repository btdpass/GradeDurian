import React, { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import DonationModal from "../components/DonationModal";

export default function FAQ({width,createError,donation,client}:any) {
	const router = useRouter();
	const view = router.query.refer as string;
	const [donationOpen,setDonationOpen] = useState(false);

	return (
		<div className="p-5 md:p-10 flex-1">
			<h1 className="font-bold text-center text-3xl dark:text-white pb-5">
				FAQ & Info
			</h1>
			<div className="space-y-4">
				<details
					className="group [&_summary::-webkit-details-marker]:hidden"
					open={view === "app"}
				>
					<summary className="flex items-center justify-between p-4 rounded-lg cursor-pointer bg-white dark:bg-gray-800 border dark:border-gray-700 dark:text-white">
						<h2 className="font-medium">Is Grade Durian an App?</h2>

						<svg
							className="ml-1.5 h-5 w-5 flex-shrink-0 transition duration-300 group-open:-rotate-180"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M19 9l-7 7-7-7"
							/>
						</svg>
					</summary>

					<p className="px-4 mt-4 leading-relaxed dark:text-white">
						Yes, Grade Durian is a PWA (Progessive Web App). <br />
						To Add Grade Durian to your Home Screen, follow these steps:
					</p>
					<p className="px-4 mt-4 leading-relaxed dark:text-white">
						<span className="flex gap-2 items-center">
							Apple iPhone/iPad
							<img className="h-4 inline-block" src={`${process.env.NEXT_PUBLIC_BASE_PATH}/assets/apple.png`} />
						</span>
					</p>
					<ul className="list-disc pl-10 dark:text-white">
						<li>Open Grade Durian in Safari</li>
						<li>Click on the Share button in the bottom bar</li>
						<li>Click on &quot;Add to Home Screen&quot;</li>
					</ul>
					<p className="px-4 mt-4 leading-relaxed dark:text-white">
						<span className="flex gap-2 items-center">
							Android
							<img className="h-4 inline-block" src={`${process.env.NEXT_PUBLIC_BASE_PATH}/assets/android.png`} />
						</span>
					</p>
					<ul className="list-disc ml-10 dark:text-white">
						<li>Open Grade Durian in Chrome</li>
						<li>Click on the 3 dots in the top right corner</li>
						<li>Click on &quot;Add to Home Screen&quot;</li>
					</ul>

					<p className="px-4 mt-4 leading-relaxed dark:text-white">
						<span className="flex gap-2 items-center">
							Personal Computer
							<img className="h-4 inline-block" src={`${process.env.NEXT_PUBLIC_BASE_PATH}/assets/pc.png`} />
						</span>
					</p>
					<ul className="list-disc ml-10 dark:text-white">
						<li>Open Grade Durian in Chrome</li>
						<li>Click on the 3 dots in the top right corner</li>
						<li>Click on &quot;Install Grade Durian&quot;</li>
					</ul>
				</details>

				<details className="group [&_summary::-webkit-details-marker]:hidden">
					<summary className="flex items-center justify-between p-4 rounded-lg cursor-pointer bg-white dark:bg-gray-800 border dark:border-gray-700 dark:text-white">
						<h2 className="font-medium">Is Grade Durian open source?</h2>
						<svg className="ml-1.5 h-5 w-5 flex-shrink-0 transition duration-300 group-open:-rotate-180" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
						</svg>
					</summary>
					<div className="px-4 mt-4 leading-relaxed dark:text-white space-y-3">
						<p>Yes! Grade Durian is fully open source. If you&apos;re curious about how anything works (including how your data is handled), you can read the code yourself on GitHub.</p>
						<p>
							<a href={`https://github.com/${process.env.NEXT_PUBLIC_GITHUB_REPO}`} target="_blank" rel="noreferrer" className="text-primary-500 underline font-medium">View the source code on GitHub</a>
						</p>
					</div>
				</details>

				<details className="group [&_summary::-webkit-details-marker]:hidden">
					<summary className="flex items-center justify-between p-4 rounded-lg cursor-pointer bg-white dark:bg-gray-800 border dark:border-gray-700 dark:text-white">
						<h2 className="font-medium">Does Grade Durian store my data?</h2>
						<svg className="ml-1.5 h-5 w-5 flex-shrink-0 transition duration-300 group-open:-rotate-180" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
						</svg>
					</summary>
					<div className="px-4 mt-4 leading-relaxed dark:text-white space-y-3">
						<p>Grade Durian takes your privacy seriously. Here&apos;s what you should know:</p>
						<ul className="list-disc pl-6 space-y-1">
							<li><strong>Your password is never stored.</strong> When you log in, your credentials are used only to fetch your data and are never saved anywhere on our end.</li>
							<li><strong>Your grades and academic records are never saved.</strong> They are fetched directly from your school&apos;s system, shown to you, and that&apos;s it. Nothing is kept on our servers.</li>
							<li>Your preferences like dark mode and your login info (if you choose to stay signed in) are saved <strong>only on your device</strong> in your browser. Nothing is sent to or stored on Grade Durian&apos;s servers.</li>
						</ul>
						<p>
							Want to know more?{" "}
							<Link href="/privacy/web" className="text-primary-500 underline font-medium">Read our full Privacy Policy</Link>.
						</p>
					</div>
				</details>

				{/* <details className="group [&_summary::-webkit-details-marker]:hidden">
					<summary className="flex items-center justify-between p-4 rounded-lg cursor-pointer bg-white dark:bg-gray-800 border dark:border-gray-700 dark:text-white">
						<h2 className="font-medium">
							How do I send feedback regarding Grade Durian?
						</h2>

						<svg
							className="ml-1.5 h-5 w-5 flex-shrink-0 transition duration-300 group-open:-rotate-180"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M19 9l-7 7-7-7"
							/>
						</svg>
					</summary>

					<p className="px-4 mt-4 leading-relaxed dark:text-white">
						To send feedback regarding Grade Durian, please email{" "}
						<a href="mailto:support@gradedurian" className="text-primary-500">
							support@gradedurian
						</a>
						.
					</p>
					<p className="px-4 mt-4 leading-relaxed dark:text-white">
						Or, feel free to join our {" "}
						<a href="https://discord.gg/nwRs8WcQGc" className="text-primary-500">
							Discord
						</a>
						!
					</p>
				</details>
				<details className="group [&_summary::-webkit-details-marker]:hidden">
					<summary className="flex items-center justify-between p-4 rounded-lg cursor-pointer bg-white dark:bg-gray-800 border dark:border-gray-700 dark:text-white">
						<h2 className="font-medium">
							Who&#39;s behind Grade Durian?
						</h2>

						<svg
							className="ml-1.5 h-5 w-5 flex-shrink-0 transition duration-300 group-open:-rotate-180"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M19 9l-7 7-7-7"
							/>
						</svg>
					</summary>

					<p className="px-4 mt-4 leading-relaxed dark:text-white">
					Grade Durian was originally created by Tinu Vanapamula, but in spring of 2024, Synergy made changes that broke Grade Durian. As a graduating senior, Tinu had other priorities.
					<br></br>
					My name is Jonathan Shapiro. I was a student at Whitman, and in summer 2024, I took it upon myself to restore the project.
					By September, I had things working again, and I&#39;ve been working on expanding and improving it ever since.
						<br></br>
						<br></br>
						You can contact me <a className="text-primary-500" href="https://instagram.com/j.shap06/">@J.shap06</a> on my personal insta, or reach out through the Grade Durian discord, insta, etc.
					</p>
				</details> */}
	 
			</div>
	 	</div>
	);
}
