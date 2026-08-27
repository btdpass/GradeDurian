import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import Head from "next/head";
import { Spinner } from "flowbite-react";
import StudentVue from "studentvue";
import { HiPencil } from "react-icons/hi";
import { processLogoUpload } from "../utils/imageUtils";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

type Ban = {
    username: string;
    hostname: string;
    reason: string;
    bannedAt: string;
};

type KnownUser = {
    username: string;
    hostname: string;
};

type AdminTheme = {
    id: string;
    name: string;
    primaryColor: string;
    siteTitle: string;
    preset: boolean;
    active: boolean;
    customLogo: string;
};

type ClientWithExtras = Awaited<ReturnType<typeof StudentVue.login>>["client"] & {
    guest?: boolean;
};

type District = {
    name: string;
    parentVueUrl: string;
    address: string;
};

interface AdminProps {
    client: ClientWithExtras;
    createError: (msg: string) => void;
    districts: District[];
}

const BLANK_THEME: AdminTheme = { id: "", name: "", primaryColor: "#e9bb42", siteTitle: "", preset: true, active: false, customLogo: "" };

type ConfirmState = { message: string; confirmLabel: string; danger: boolean; onConfirm: () => void } | null;

function ConfirmModal({ state, onClose }: { state: ConfirmState; onClose: () => void }) {
    if (!state) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={onClose}>
            <div className="absolute inset-0 bg-black/40 dark:bg-black/60" />
            <div className="relative w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6" onClick={e => e.stopPropagation()}>
                <p className="text-sm text-gray-700 dark:text-gray-200 mb-5 text-center">{state.message}</p>
                <div className="flex gap-3">
                    <button onClick={onClose}
                        className="flex-1 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        Cancel
                    </button>
                    <button onClick={() => { onClose(); state.onConfirm(); }}
                        className={`flex-1 py-2 rounded-xl text-sm font-medium text-white transition-colors ${state.danger ? "bg-red-500 hover:bg-red-600" : "bg-primary-500 hover:bg-primary-600"}`}>
                        {state.confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function AdminPanel({ client, createError, districts = [] }: AdminProps) {
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [tab, setTab] = useState<"themes" | "bans" | "whitelist">("themes");

    const [adminThemes, setAdminThemes] = useState<AdminTheme[]>([]);
    const [editingTheme, setEditingTheme] = useState<AdminTheme | null>(null);
    const [themeSaving, setThemeSaving] = useState(false);
    const logoInputRef = useRef<HTMLInputElement>(null);

    const [bans, setBans] = useState<Ban[]>([]);
    const [knownUsers, setKnownUsers] = useState<KnownUser[]>([]);
    const [userSearch, setUserSearch] = useState("");
    const [selectedUser, setSelectedUser] = useState<KnownUser | null>(null);
    const [banReason, setBanReason] = useState("");
    const [banSaving, setBanSaving] = useState(false);
    const [userPickerOpen, setUserPickerOpen] = useState(false);

    const [confirmState, setConfirmState] = useState<ConfirmState>(null);
    const confirm = (message: string, confirmLabel: string, danger: boolean, onConfirm: () => void) =>
        setConfirmState({ message, confirmLabel, danger, onConfirm });

    const [whitelistEnabled, setWhitelistEnabled] = useState(false);
    const [whitelist, setWhitelist] = useState<KnownUser[]>([]);
    const [wlSearch, setWlSearch] = useState("");
    const [wlPickerOpen, setWlPickerOpen] = useState(false);
    const [wlSelectedUser, setWlSelectedUser] = useState<KnownUser | null>(null);
    const [wlSaving, setWlSaving] = useState(false);
    const [wlManualMode, setWlManualMode] = useState(false);
    const [wlManualUsername, setWlManualUsername] = useState("");
    const [wlManualHostname, setWlManualHostname] = useState("md-mcps-psv.edupoint.com");

    const [banManualMode, setBanManualMode] = useState(false);
    const [banManualUsername, setBanManualUsername] = useState("");
    const [banManualHostname, setBanManualHostname] = useState("md-mcps-psv.edupoint.com");

    const districtOptions = districts
        .map((d) => { try { return { name: d.name, hostname: new URL(d.parentVueUrl).hostname }; } catch { return null; } })
        .filter((d): d is { name: string; hostname: string } => !!d && !!d.hostname)
        .filter((d, i, arr) => arr.findIndex(x => x.hostname === d.hostname) === i);

    const getAuth = useCallback(() => {
        if (!client || (client as any).guest) return null;
        try {
            return { username: client.username, hostname: new URL(client.district).hostname };
        } catch { return null; }
    }, [client]);

    const loadThemes = useCallback(async (auth: { username: string; hostname: string }) => {
        const res = await fetch(`${apiUrl}/admin/getThemes`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify(auth),
        }).then((r) => r.json());
        if (res.themes) setAdminThemes(res.themes);
    }, []);

    const loadBans = useCallback(async (auth: { username: string; hostname: string }) => {
        const res = await fetch(`${apiUrl}/admin/getBans`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify(auth),
        }).then((r) => r.json());
        if (res.bans) setBans(res.bans);
    }, []);

    const loadWhitelist = useCallback(async (auth: { username: string; hostname: string }) => {
        const res = await fetch(`${apiUrl}/admin/getWhitelist`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify(auth),
        }).then((r) => r.json());
        if (typeof res.enabled === "boolean") setWhitelistEnabled(res.enabled);
        if (res.users) setWhitelist(res.users as KnownUser[]);
    }, []);

    const loadUsers = useCallback(async (auth: { username: string; hostname: string }) => {
        const res = await fetch(`${apiUrl}/admin/getUsers`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify(auth),
        }).then((r) => r.json());
        if (res.users) setKnownUsers(res.users as KnownUser[]);
    }, []);

    useEffect(() => {
        const auth = getAuth();
        if (!auth) { setLoading(false); return; }
        fetch(`${apiUrl}/admin/checkAccess`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify(auth),
        })
            .then((r) => r.json())
            .then((data) => {
                setIsAdmin(data.admin);
                if (data.admin) return Promise.all([loadThemes(auth), loadBans(auth), loadUsers(auth), loadWhitelist(auth)]);
            })
            .catch(() => setIsAdmin(false))
            .finally(() => setLoading(false));
    }, [client]);

    const saveThemes = async (themes: AdminTheme[]) => {
        const auth = getAuth();
        if (!auth) return;
        setThemeSaving(true);
        try {
            await fetch(`${apiUrl}/admin/setThemes`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...auth, themes }),
            });
            setAdminThemes(themes);
        } catch {
            createError("Failed to save themes");
        } finally {
            setThemeSaving(false);
        }
    };

    const commitTheme = async () => {
        if (!editingTheme || !editingTheme.name.trim()) return;
        const theme: AdminTheme = {
            ...editingTheme,
            id: editingTheme.id || `admin_${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`,
            name: editingTheme.name.trim(),
            siteTitle: editingTheme.siteTitle.trim() || editingTheme.name.trim(),
            preset: true, active: false,
        };
        const existing = adminThemes.findIndex(t => t.id === theme.id);
        const updated = existing >= 0
            ? adminThemes.map(t => t.id === theme.id ? theme : t)
            : [...adminThemes, theme];
        await saveThemes(updated);
        setEditingTheme(null);
    };

    const removeTheme = async (id: string) => {
        await saveThemes(adminThemes.filter((t) => t.id !== id));
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        e.target.value = "";
        const { dataUrl, dominantColor } = await processLogoUpload(file, editingTheme?.primaryColor ?? "#e9bb42");
        setEditingTheme(prev => prev ? { ...prev, customLogo: dataUrl, primaryColor: dominantColor } : prev);
    };

    const bannedSet = useMemo(() =>
        new Set(bans.map(b => `${b.username}:${b.hostname}`)),
        [bans]
    );

    const adminKeys = useMemo(() => {
        const auth = getAuth();
        if (!auth) return new Set<string>();
        // Hide the logged-in admin from the picker (can't ban yourself or other admins)
        return new Set([`${auth.username}:${auth.hostname}`]);
    }, [client]);

    const filteredUsers = useMemo(() => {
        const q = userSearch.toLowerCase();
        return knownUsers.filter(u =>
            !adminKeys.has(`${u.username}:${u.hostname}`) &&
            (u.username.toLowerCase().includes(q) || u.hostname.toLowerCase().includes(q))
        );
    }, [knownUsers, userSearch, adminKeys]);

    const whitelistedSet = useMemo(() =>
        new Set(whitelist.map(u => `${u.username}:${u.hostname}`)),
        [whitelist]
    );

    const filteredWlUsers = useMemo(() => {
        const q = wlSearch.toLowerCase();
        return knownUsers.filter(u =>
            !adminKeys.has(`${u.username}:${u.hostname}`) &&
            !whitelistedSet.has(`${u.username}:${u.hostname}`) &&
            (u.username.toLowerCase().includes(q) || u.hostname.toLowerCase().includes(q))
        );
    }, [knownUsers, wlSearch, adminKeys, whitelistedSet]);

    const toggleWhitelist = async (enabled: boolean) => {
        const auth = getAuth();
        if (!auth) return;
        await fetch(`${apiUrl}/admin/setWhitelistEnabled`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...auth, enabled }),
        });
        setWhitelistEnabled(enabled);
    };

    const addToWhitelist = async () => {
        const auth = getAuth();
        if (!auth || !wlSelectedUser) return;
        setWlSaving(true);
        try {
            await fetch(`${apiUrl}/admin/addToWhitelist`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...auth, targetUsername: wlSelectedUser.username, targetHostname: wlSelectedUser.hostname }),
            });
            setWhitelist(prev => [...prev, { ...wlSelectedUser, addedAt: new Date().toISOString() } as any]);
            setWlSelectedUser(null);
            setWlSearch("");
        } catch {
            createError("Failed to add to whitelist");
        } finally {
            setWlSaving(false);
        }
    };

    const removeFromWhitelist = async (targetUsername: string, targetHostname: string) => {
        const auth = getAuth();
        if (!auth) return;
        await fetch(`${apiUrl}/admin/removeFromWhitelist`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...auth, targetUsername, targetHostname }),
        });
        setWhitelist(prev => prev.filter(u => !(u.username === targetUsername && u.hostname === targetHostname)));
    };

    const districtName = (hostname: string) =>
        districtOptions.find(d => d.hostname === hostname)?.name ?? hostname;

    const addBan = async () => {
        const auth = getAuth();
        if (!auth || !selectedUser) return;
        setBanSaving(true);
        try {
            const res = await fetch(`${apiUrl}/admin/banUser`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...auth,
                    targetUsername: selectedUser.username,
                    targetHostname: selectedUser.hostname,
                    reason: banReason.trim(),
                }),
            }).then((r) => r.json());
            if (res.error) { createError(res.error); return; }
            const newEntry: Ban = {
                username: selectedUser.username,
                hostname: selectedUser.hostname,
                reason: banReason.trim(),
                bannedAt: new Date().toISOString(),
            };
            setBans(prev => [...prev.filter(b => !(b.username === newEntry.username && b.hostname === newEntry.hostname)), newEntry]);
            setSelectedUser(null);
            setBanReason("");
            setUserSearch("");
        } catch {
            createError("Failed to ban user");
        } finally {
            setBanSaving(false);
        }
    };

    const unbanUser = async (targetUsername: string, targetHostname: string) => {
        const auth = getAuth();
        if (!auth) return;
        await fetch(`${apiUrl}/admin/unbanUser`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...auth, targetUsername, targetHostname }),
        });
        setBans(prev => prev.filter(b => !(b.username === targetUsername && b.hostname === targetHostname)));
    };

    const inputCls = "w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500";

    return (
        <>
            <ConfirmModal state={confirmState} onClose={() => setConfirmState(null)} />
            <Head><title>Admin - Grade Durian</title></Head>
            <div className="w-full p-5 md:p-10">
                {loading && <div className="flex justify-center mt-16"><Spinner size="lg" /></div>}

                {!loading && !client && (
                    <div className="text-center mt-16 text-gray-500 dark:text-gray-400">Please log in to access the admin panel.</div>
                )}
                {!loading && client && !isAdmin && (
                    <div className="text-center mt-16 text-gray-500 dark:text-gray-400">
                        <p className="text-lg font-semibold text-red-500 dark:text-red-400 mb-2">Access Denied</p>
                        <p>Your account does not have admin privileges.</p>
                    </div>
                )}

                {!loading && isAdmin && (
                    <>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Admin Panel</h1>

                        {/* Tabs */}
                        <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
                            {(["themes", "bans", "whitelist"] as const).map((t) => (
                                <button key={t} onClick={() => setTab(t)}
                                    className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${tab === t ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"}`}>
                                    {t === "themes" ? `Themes (${adminThemes.length})` : t === "bans" ? `Bans (${bans.length})` : "Whitelist"}
                                </button>
                            ))}
                        </div>

                        <div className="min-h-[520px]">
                        {/* Themes Tab */}
                        {tab === "themes" && (
                            <div className="space-y-3">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Admin themes appear as preset options for all users alongside Durian and Melon.
                                </p>

                                {adminThemes.length === 0 && !editingTheme && (
                                    <p className="text-sm text-gray-400 dark:text-gray-500 italic">No custom themes yet.</p>
                                )}

                                {adminThemes.map((theme) => (
                                    <div key={theme.id} className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                                        {theme.customLogo
                                            ? <img src={theme.customLogo} alt={theme.name} className="w-6 h-6 rounded object-contain flex-shrink-0" />
                                            : <span className="inline-block w-5 h-5 rounded-full border border-gray-300 dark:border-gray-600 flex-shrink-0" style={{ backgroundColor: theme.primaryColor }} />
                                        }
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{theme.name}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{theme.siteTitle} · {theme.primaryColor}</p>
                                        </div>
                                        <button onClick={() => setEditingTheme(theme)} className="text-sm font-medium px-3 py-1 rounded-lg text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">Edit</button>
                                        <button onClick={() => confirm(`Remove "${theme.name}"?`, "Remove", true, () => removeTheme(theme.id))} className="text-sm font-medium px-3 py-1 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">Remove</button>
                                    </div>
                                ))}

                                {editingTheme ? (
                                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 space-y-3">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {editingTheme.id ? "Edit Theme" : "Add Theme"}
                                        </p>
                                        <div>
                                            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Name</label>
                                            <input type="text" value={editingTheme.name} onChange={(e) => setEditingTheme(p => ({ ...p, name: e.target.value }))} placeholder="Durian" className={inputCls} />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Color</label>
                                            <label className="flex items-center justify-between px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 cursor-pointer">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-sm text-gray-900 dark:text-white">{editingTheme.primaryColor}</span>
                                                    <HiPencil size="0.8rem" className="text-gray-400 dark:text-gray-500" />
                                                </div>
                                                <div className="w-6 h-6 rounded border border-gray-300 overflow-hidden flex-shrink-0" style={{ backgroundColor: editingTheme.primaryColor }}>
                                                    <input type="color" className="opacity-0 w-full h-full cursor-pointer" value={editingTheme.primaryColor}
                                                        onChange={(e) => setEditingTheme(p => ({ ...p, primaryColor: e.target.value }))} />
                                                </div>
                                            </label>
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Site Title <span className="text-gray-400">(defaults to name)</span></label>
                                            <input type="text" value={editingTheme.siteTitle} onChange={(e) => setEditingTheme(p => ({ ...p, siteTitle: e.target.value }))} placeholder={editingTheme.name || "Grade Durian"} className={inputCls} />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Logo</label>
                                            <label className="flex items-center justify-between px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 cursor-pointer">
                                                <span className="text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
                                                    Upload image <HiPencil size="0.8rem" className="text-gray-400 dark:text-gray-500" />
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    {editingTheme.customLogo
                                                        ? <>
                                                            <img src={editingTheme.customLogo} alt={editingTheme.name} className="w-6 h-6 rounded object-contain" />
                                                            <button type="button" onClick={(e) => { e.preventDefault(); setEditingTheme(p => ({ ...p, customLogo: "" })); }}
                                                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xs">✕</button>
                                                          </>
                                                        : <span className="text-sm text-gray-400 dark:text-gray-500">Default</span>
                                                    }
                                                    <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                                                </div>
                                            </label>
                                        </div>
                                        <div className="flex gap-2 pt-1">
                                            <button onClick={() => setEditingTheme(null)} className="flex-1 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                                Cancel
                                            </button>
                                            <button onClick={commitTheme} disabled={!editingTheme.name.trim() || themeSaving}
                                                className="flex-1 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors">
                                                {themeSaving ? "Saving…" : (editingTheme.id ? "Save" : "Add Theme")}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button onClick={() => setEditingTheme({ ...BLANK_THEME })}
                                        className="w-full py-2 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 text-sm font-medium hover:border-primary-400 hover:text-primary-500 dark:hover:border-primary-500 dark:hover:text-primary-400 transition-colors">
                                        + Add Theme
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Bans Tab */}
                        {tab === "bans" && (
                            <div className="space-y-3">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Banned users see a suspension page after logging in.
                                </p>

                                {bans.length === 0 && (
                                    <p className="text-sm text-gray-400 dark:text-gray-500 italic">No banned users.</p>
                                )}
                                {bans.map((ban) => (
                                    <div key={`${ban.username}:${ban.hostname}`} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium font-mono text-gray-900 dark:text-white">{ban.username}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{districtName(ban.hostname)}</p>
                                                {ban.reason && <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">Reason: {ban.reason}</p>}
                                                {ban.bannedAt && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{new Date(ban.bannedAt).toLocaleString()}</p>}
                                            </div>
                                            <button onClick={() => confirm(`Unban ${ban.username}?`, "Unban", false, () => unbanUser(ban.username, ban.hostname))} className="flex-shrink-0 text-sm font-medium px-3 py-1 rounded-lg text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors">Unban</button>
                                        </div>
                                    </div>
                                ))}

                                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 space-y-3">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">Ban User</p>

                                    {/* User picker */}
                                    {selectedUser ? (
                                        <div className="flex items-center justify-between px-3 py-2 rounded-lg border border-primary-400 dark:border-primary-600 bg-primary-50 dark:bg-primary-900/20">
                                            <div>
                                                <p className="text-sm font-mono font-medium text-gray-900 dark:text-white">{selectedUser.username}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{districtName(selectedUser.hostname)}</p>
                                            </div>
                                            <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xs px-2">✕</button>
                                        </div>
                                    ) : banManualMode ? (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <label className="block text-xs text-gray-500 dark:text-gray-400">Manual entry</label>
                                                <button onClick={() => { setBanManualMode(false); setBanManualUsername(""); setBanManualHostname("md-mcps-psv.edupoint.com"); }} className="text-xs text-primary-500 hover:text-primary-600">Search known users</button>
                                            </div>
                                            <input
                                                type="text"
                                                value={banManualUsername}
                                                onChange={(e) => setBanManualUsername(e.target.value)}
                                                placeholder="Username"
                                                className={inputCls}
                                            />
                                            <select
                                                value={banManualHostname}
                                                onChange={(e) => setBanManualHostname(e.target.value)}
                                                className={inputCls}
                                            >
                                                <option value="">Select county / district…</option>
                                                {districtOptions.map((d) => (
                                                    <option key={d.hostname} value={d.hostname}>{d.name}</option>
                                                ))}
                                            </select>
                                            <button
                                                onClick={() => { if (banManualUsername.trim() && banManualHostname) { setSelectedUser({ username: banManualUsername.trim(), hostname: banManualHostname }); setBanManualMode(false); setBanManualUsername(""); setBanManualHostname("md-mcps-psv.edupoint.com"); } }}
                                                disabled={!banManualUsername.trim() || !banManualHostname}
                                                className="w-full py-1.5 rounded-lg border border-primary-400 dark:border-primary-600 text-primary-600 dark:text-primary-400 text-sm font-medium hover:bg-primary-50 dark:hover:bg-primary-900/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                                                Confirm
                                            </button>
                                        </div>
                                    ) : (
                                        <div>
                                            <div className="flex items-center justify-between mb-1">
                                                <label className="block text-xs text-gray-500 dark:text-gray-400">Select user</label>
                                                <button onClick={() => setBanManualMode(true)} className="text-xs text-primary-500 hover:text-primary-600">Enter manually</button>
                                            </div>
                                            <input
                                                type="text"
                                                value={userSearch}
                                                onChange={(e) => setUserSearch(e.target.value)}
                                                onFocus={() => setUserPickerOpen(true)}
                                                onBlur={() => setTimeout(() => setUserPickerOpen(false), 150)}
                                                placeholder="Search by username or district…"
                                                className={inputCls}
                                            />
                                            {userPickerOpen && (
                                                <div className="mt-1 max-h-48 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-sm">
                                                    {filteredUsers.length === 0 ? (
                                                        <p className="px-3 py-2 text-sm text-gray-400 dark:text-gray-500">
                                                            {knownUsers.length === 0 ? "No users have logged in yet." : "No users found."}
                                                        </p>
                                                    ) : (
                                                        filteredUsers.map((u) => {
                                                            const isBanned = bannedSet.has(`${u.username}:${u.hostname}`);
                                                            return (
                                                                <button
                                                                    key={`${u.username}:${u.hostname}`}
                                                                    onMouseDown={(e) => e.preventDefault()}
                                                                    onClick={() => { setSelectedUser(u); setUserSearch(""); setUserPickerOpen(false); }}
                                                                    disabled={isBanned}
                                                                    className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed border-b border-gray-100 dark:border-gray-700 last:border-0"
                                                                >
                                                                    <div>
                                                                        <p className="text-sm font-mono text-gray-900 dark:text-white">{u.username}</p>
                                                                        <p className="text-xs text-gray-500 dark:text-gray-400">{districtName(u.hostname)}</p>
                                                                    </div>
                                                                    {isBanned && <span className="text-xs text-red-400 font-medium">Banned</span>}
                                                                </button>
                                                            );
                                                        })
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Reason (optional)</label>
                                        <input type="text" value={banReason} onChange={(e) => setBanReason(e.target.value)} placeholder="Violation of terms of service" className={inputCls} />
                                    </div>
                                    <button
                                        onClick={() => confirm(`Ban ${selectedUser?.username}?${banReason ? ` Reason: "${banReason}"` : ""}`, "Ban User", true, addBan)}
                                        disabled={!selectedUser || banSaving}
                                        className="w-full py-2 rounded-lg bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors">
                                        {banSaving ? "Banning…" : "Ban User"}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Whitelist Tab */}
                        {tab === "whitelist" && (
                            <div className="space-y-3">
                                {/* Toggle */}
                                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">Whitelist Only Mode</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                            {whitelistEnabled ? "Only whitelisted users can log in." : "All users can log in."}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => confirm(whitelistEnabled ? "Disable whitelist-only mode?" : "Enable whitelist-only mode? Users not on the list will be blocked.", whitelistEnabled ? "Disable" : "Enable", whitelistEnabled, () => toggleWhitelist(!whitelistEnabled))}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${whitelistEnabled ? "bg-primary-500" : "bg-gray-300 dark:bg-gray-600"}`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${whitelistEnabled ? "translate-x-6" : "translate-x-1"}`} />
                                    </button>
                                </div>

                                {whitelistEnabled && (
                                    <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3">
                                        Admins are always allowed in regardless of whitelist.
                                    </p>
                                )}

                                {/* Whitelisted users */}
                                {whitelist.length === 0 && (
                                    <p className="text-sm text-gray-400 dark:text-gray-500 italic">No whitelisted users yet.</p>
                                )}
                                {whitelist.map((u) => (
                                    <div key={`${u.username}:${u.hostname}`} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 flex items-center justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium font-mono text-gray-900 dark:text-white">{u.username}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{districtName(u.hostname)}</p>
                                        </div>
                                        <button onClick={() => confirm(`Remove ${u.username} from whitelist?`, "Remove", true, () => removeFromWhitelist(u.username, u.hostname))} className="flex-shrink-0 text-sm font-medium px-3 py-1 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">Remove</button>
                                    </div>
                                ))}

                                {/* Add to whitelist */}
                                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 space-y-3">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">Add User</p>
                                    {wlSelectedUser ? (
                                        <div className="flex items-center justify-between px-3 py-2 rounded-lg border border-primary-400 dark:border-primary-600 bg-primary-50 dark:bg-primary-900/20">
                                            <div>
                                                <p className="text-sm font-mono font-medium text-gray-900 dark:text-white">{wlSelectedUser.username}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{districtName(wlSelectedUser.hostname)}</p>
                                            </div>
                                            <button onClick={() => setWlSelectedUser(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xs px-2">✕</button>
                                        </div>
                                    ) : wlManualMode ? (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <label className="block text-xs text-gray-500 dark:text-gray-400">Manual entry</label>
                                                <button onClick={() => { setWlManualMode(false); setWlManualUsername(""); setWlManualHostname("md-mcps-psv.edupoint.com"); }} className="text-xs text-primary-500 hover:text-primary-600">Search known users</button>
                                            </div>
                                            <input
                                                type="text"
                                                value={wlManualUsername}
                                                onChange={(e) => setWlManualUsername(e.target.value)}
                                                placeholder="Username"
                                                className={inputCls}
                                            />
                                            <select
                                                value={wlManualHostname}
                                                onChange={(e) => setWlManualHostname(e.target.value)}
                                                className={inputCls}
                                            >
                                                <option value="">Select county / district…</option>
                                                {districtOptions.map((d) => (
                                                    <option key={d.hostname} value={d.hostname}>{d.name}</option>
                                                ))}
                                            </select>
                                            <button
                                                onClick={() => { if (wlManualUsername.trim() && wlManualHostname) { setWlSelectedUser({ username: wlManualUsername.trim(), hostname: wlManualHostname }); setWlManualMode(false); setWlManualUsername(""); setWlManualHostname("md-mcps-psv.edupoint.com"); } }}
                                                disabled={!wlManualUsername.trim() || !wlManualHostname}
                                                className="w-full py-1.5 rounded-lg border border-primary-400 dark:border-primary-600 text-primary-600 dark:text-primary-400 text-sm font-medium hover:bg-primary-50 dark:hover:bg-primary-900/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                                                Confirm
                                            </button>
                                        </div>
                                    ) : (
                                        <div>
                                            <div className="flex items-center justify-between mb-1">
                                                <label className="block text-xs text-gray-500 dark:text-gray-400">Select user</label>
                                                <button onClick={() => setWlManualMode(true)} className="text-xs text-primary-500 hover:text-primary-600">Enter manually</button>
                                            </div>
                                            <input
                                                type="text"
                                                value={wlSearch}
                                                onChange={(e) => setWlSearch(e.target.value)}
                                                onFocus={() => setWlPickerOpen(true)}
                                                onBlur={() => setTimeout(() => setWlPickerOpen(false), 150)}
                                                placeholder="Search by username or district…"
                                                className={inputCls}
                                            />
                                            {wlPickerOpen && (
                                                <div className="mt-1 max-h-48 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-sm">
                                                    {filteredWlUsers.length === 0 ? (
                                                        <p className="px-3 py-2 text-sm text-gray-400 dark:text-gray-500">
                                                            {knownUsers.length === 0 ? "No users have logged in yet." : "No users found."}
                                                        </p>
                                                    ) : (
                                                        filteredWlUsers.map((u) => (
                                                            <button
                                                                key={`${u.username}:${u.hostname}`}
                                                                onMouseDown={(e) => e.preventDefault()}
                                                                onClick={() => { setWlSelectedUser(u); setWlSearch(""); setWlPickerOpen(false); }}
                                                                className="w-full flex items-start px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-0"
                                                            >
                                                                <div>
                                                                    <p className="text-sm font-mono text-gray-900 dark:text-white">{u.username}</p>
                                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{districtName(u.hostname)}</p>
                                                                </div>
                                                            </button>
                                                        ))
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    <button
                                        onClick={() => confirm(`Add ${wlSelectedUser?.username} to the whitelist?`, "Add", false, addToWhitelist)}
                                        disabled={!wlSelectedUser || wlSaving}
                                        className="w-full py-2 rounded-lg bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors">
                                        {wlSaving ? "Adding…" : "Add to Whitelist"}
                                    </button>
                                </div>
                            </div>
                        )}
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
