import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { Spinner } from "flowbite-react";
import StudentVue from "studentvue";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

type ClientWithExtras = Awaited<ReturnType<typeof StudentVue.login>>["client"] & { guest?: boolean };

interface BannedProps {
    client: ClientWithExtras;
    loading: boolean;
    logout: () => void;
}

export default function Banned({ client, loading, logout }: BannedProps) {
    const router = useRouter();
    const reason = typeof router.query.reason === "string" ? router.query.reason : "";
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        if (!router.isReady || loading) return;

        if (!client || (client as any).guest) {
            router.replace("/login");
            return;
        }

        try {
            const hostname = new URL(client.district).hostname;
            fetch(`${apiUrl}/checkBan`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: client.username, hostname }),
            })
                .then((r) => r.json())
                .then((data) => {
                    if (!data.banned) router.replace("/grades");
                    else setChecking(false);
                })
                .catch(() => setChecking(false));
        } catch {
            setChecking(false);
        }
    }, [router.isReady, client, loading]);

    if (checking) {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <>
            <Head>
                <title>Account Suspended — Grade Durian</title>
            </Head>
            <div className="min-h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center px-4">
                <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-8 text-center">
                    <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 mx-auto mb-4">
                        <svg className="w-7 h-7 text-red-500 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                    </div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        Account Suspended
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Your account has been suspended from Grade Durian.
                    </p>
                    {reason && (
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl px-4 py-3 mb-4 text-left">
                            <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">Reason</p>
                            <p className="text-sm text-gray-700 dark:text-gray-200">{reason}</p>
                        </div>
                    )}
                    <button
                        onClick={logout}
                        className="mt-2 text-sm text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                    >
                        Back to login
                    </button>
                </div>
            </div>
        </>
    );
}
