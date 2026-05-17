import React, { useState, useEffect } from "react";
import Head from "next/head";
import { Spinner } from "flowbite-react";
import { HiEye } from "react-icons/hi";
import { HiArrowDownTray } from "react-icons/hi2";

const base64toBlob = (base64Data: string) => {
	const sliceSize = 1024;
	const byteCharacters = atob(base64Data);
	const bytesLength = byteCharacters.length;
	const slicesCount = Math.ceil(bytesLength / sliceSize);
	const byteArrays = new Array(slicesCount);
	for (let sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
		const begin = sliceIndex * sliceSize;
		const end = Math.min(begin + sliceSize, bytesLength);
		const bytes = new Array(end - begin);
		for (let offset = begin, i = 0; offset < end; ++i, ++offset) {
			bytes[i] = byteCharacters[offset].charCodeAt(0);
		}
		byteArrays[sliceIndex] = new Uint8Array(bytes);
	}
	return new Blob(byteArrays, { type: "application/pdf" });
};

const openBase64NewTab = (base64Pdf: string): void => {
	const blob = base64toBlob(base64Pdf);
	if (typeof window === "undefined") return;
	const blobUrl = URL.createObjectURL(blob);
	const anchor = document.createElement("a");
	anchor.href = blobUrl;
	anchor.target = /iPhone|iPod/.test(navigator.userAgent) ? "_self" : "_blank";
	document.body.appendChild(anchor);
	anchor.click();
	document.body.removeChild(anchor);
	setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
};

const downloadBase64 = (base64Pdf: string, name: string): void => {
	const blob = base64toBlob(base64Pdf);
	if (typeof window === "undefined") return;
	const blobUrl = URL.createObjectURL(blob);
	const anchor = document.createElement("a");
	anchor.href = blobUrl;
	anchor.download = name || "document.pdf";
	document.body.appendChild(anchor);
	anchor.click();
	document.body.removeChild(anchor);
	setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
};

const parseName = (name: string): string =>
	new DOMParser().parseFromString(name, "text/html").documentElement.textContent;

interface DocumentsProps {
	client: any;
	createError: (message: string) => void;
}

export default function Documents({ client, createError }: DocumentsProps) {
	const [documents, setDocuments] = useState([]);
	const [loading, setLoading] = useState(true);
	const [fetching, setFetching] = useState<number | null>(null);

	useEffect(() => {
		try {
			if (client.loadedDocuments == undefined) {
				client.documents().then(([res]) => {
					res.forEach((doc) => {
						doc.file.comment = parseName(doc.file.comment);
						doc.file.type = parseName(doc.file.type);
					});
					setDocuments(res);
					client.loadedDocuments = res;
					setLoading(false);
				}).catch((error) => { createError(error.message); });
			} else {
				setDocuments(client.loadedDocuments);
				setLoading(false);
			}
		} catch {}
	}, [client]);

	const handleFetch = async (doc: any, i: number, download: boolean) => {
		setFetching(i);
		try {
			const result = await doc.get();
			if (download) downloadBase64(result[0].base64, doc.comment + ".pdf");
			else openBase64NewTab(result[0].base64);
		} catch {
			createError("Failed to load document");
		} finally {
			setFetching(null);
		}
	};

	const thCls = "py-3 px-6 text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 whitespace-nowrap";
	const rowCls = (i: number) => `h-14 border-b dark:border-gray-700 ${i % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-800"}`;
	const cell = "py-3 px-6 whitespace-nowrap";

	return (
		<div className="p-5 md:p-10 h-full flex-1">
			<Head><title>Documents - Grade Durian</title></Head>
			{loading ? (
				<div className="flex justify-center">
					<div style={{ color: "rgb(var(--primary-500))" }} className="[&_svg]:fill-primary-500">
						<Spinner size="xl" color="warning" />
					</div>
				</div>
			) : (
				<div className="w-full overflow-x-auto shadow-md rounded-lg border border-gray-200 dark:border-gray-700 [transition:none]">
					<table className="min-w-max w-full text-sm text-left text-gray-500 dark:text-gray-400">
						<thead>
							<tr>
								<th scope="col" className={thCls}>Date</th>
								<th scope="col" className={thCls}>Category</th>
								<th scope="col" className={thCls}>Document</th>
								<th scope="col" className={thCls}></th>
							</tr>
						</thead>
						<tbody>
							{documents.map((document: any, i: number) => (
								<tr key={i} className={rowCls(i)}>
									<td className={`${cell} text-gray-900 dark:text-white font-medium`}>
										{document.file.date.toLocaleDateString()}
									</td>
									<td className={cell}>{document.file.type}</td>
									<td className={cell}>{document.comment}</td>
									<td className="py-3 px-6 whitespace-nowrap">
										<div className="flex items-center justify-end gap-2">
											<button
												onClick={() => handleFetch(document, i, false)}
												disabled={fetching === i}
												title="View"
												className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary-500 dark:hover:text-primary-400 disabled:opacity-40 transition-colors"
											>
												<HiEye size="1.1rem" />
											</button>
											<button
												onClick={() => handleFetch(document, i, true)}
												disabled={fetching === i}
												title="Download"
												className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary-500 dark:hover:text-primary-400 disabled:opacity-40 transition-colors"
											>
												<HiArrowDownTray size="1.1rem" />
											</button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}
