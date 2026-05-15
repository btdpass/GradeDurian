import React, { useState, useEffect, useMemo } from "react";
import Head from "next/head";
import { Spinner } from "flowbite-react";
import { Bar } from "react-chartjs-2";
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend,
} from "chart.js";
import {
	Attendance as AttendanceType,
	parseBarData,
	chartOptions,
	parsePeriods,
	preSort
} from "../utils/attendance";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";

ChartJS.register(CategoryScale, LinearScale, BarElement, Legend, Title, Tooltip);

interface AttendanceProps {
	client: any;
	createError: (message: string) => void;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const CAT_COLORS: Record<string, string> = { Absence: "#ef4444", Tardy: "#f97316", "Early Out": "#eab308", Activity: "#22c55e" };

export default function Attendance({ client, createError }: AttendanceProps) {
	const [loading, setLoading] = useState(true);
	const [data, setData] = useState<AttendanceType>();
	const [barData, setBarData] = useState<any>();
	const [view, setView] = useState<"calendar" | "list" | "summary">("calendar");
	const [calMonth, setCalMonth] = useState(() => {
		const d = new Date(); d.setDate(1); return d; // starts at current month
	});

	useEffect(() => {
		try {
			// Invalidate cache if iconName is missing (pre-patch data)
			if (client.loadedAttendance?.[0]?.absences?.[0]?.periods?.[0]?.iconName === undefined) {
				client.loadedAttendance = undefined;
			}
			if (!client.loadedAttendance) {
				client.attendance().then(([res]) => {
					res.absences = preSort(res.absences);
					// Log any icon names we haven't catalogued yet
					const seen = new Set(["icon_unexcused.gif","icon_unxtardy.gif","icon_tardy.gif","icon_excused.gif","icon_activity.gif",""]);
					res.absences.forEach(a => a.periods.forEach((p: any) => {
						if (!seen.has(p.iconName)) console.log('[New icon]', p.name, '→', p.iconName);
					}));
					setData(res);
					const temp = parseBarData(res?.absences);
					setBarData(temp);
					client.loadedAttendance = [res, temp];
					setLoading(false);
				}).catch(error => { createError(error.message); });
			} else {
				setData(client.loadedAttendance[0]);
				setBarData(client.loadedAttendance[1]);
				setLoading(false);
			}
		} catch {}
	}, [client]);

	// Map date string → absences for quick lookup
	const absenceByDay = useMemo(() => {
		const map = new Map<string, any[]>();
		if (!data?.absences) return map;
		for (const a of data.absences) {
			const key = a.date.toDateString();
			if (!map.has(key)) map.set(key, []);
			map.get(key).push(a);
		}
		return map;
	}, [data]);

	const PALETTE = ["#ef4444","#f97316","#eab308","#22c55e","#3b82f6","#a855f7","#ec4899","#14b8a6"];

	// Assign a stable color per absence type — sorted alphabetically so order never changes
	const typeColor = useMemo(() => {
		const map: Record<string, string> = {};
		if (!data?.absences) return map;
		const types = new Set<string>();
		for (const a of data.absences) for (const p of a.periods) if (p.name) types.add(p.name);
		[...types].sort().forEach((name, idx) => { map[name] = PALETTE[idx % PALETTE.length]; });
		return map;
	}, [data]);

	const now = new Date();
	const isCurrentMonth = calMonth.getFullYear() === now.getFullYear() && calMonth.getMonth() === now.getMonth();
	const prevMonth = () => { const d = new Date(calMonth); d.setMonth(d.getMonth() - 1); setCalMonth(d); };
	const nextMonth = () => { if (isCurrentMonth) return; const d = new Date(calMonth); d.setMonth(d.getMonth() + 1); setCalMonth(d); };

	// Build calendar grid — always 42 cells (6 rows), with prev/next month overflow dates
	const calDays = useMemo(() => {
		const year = calMonth.getFullYear();
		const month = calMonth.getMonth();
		const firstDay = new Date(year, month, 1).getDay();
		const daysInMonth = new Date(year, month + 1, 0).getDate();
		const cells: { date: Date; currentMonth: boolean }[] = [];
		for (let d = firstDay - 1; d >= 0; d--) cells.push({ date: new Date(year, month, -d), currentMonth: false });
		for (let d = 1; d <= daysInMonth; d++) cells.push({ date: new Date(year, month, d), currentMonth: true });
		let next = 1;
		while (cells.length < 42) cells.push({ date: new Date(year, month + 1, next++), currentMonth: false });
		return cells;
	}, [calMonth]);

	// Use IconName from Synergy XML — same source as Synergy's own website
	const getCategory = (iconName: string, name = "") => {
		const ic = (iconName ?? "").toLowerCase();
		const n = name.toLowerCase();
		// Activity checked first — its names/icons can contain "early" (e.g. early release activity)
		if (ic.includes("activity") || n.includes("activity")) return "Activity";
		if (ic.includes("early") || ic.includes("dismissal") || n.includes("early") || n.includes("dismissal")) return "Early Out";
		if (ic.includes("tardy") || n.includes("tardy") || n.includes("tdy")) return "Tardy";
		return "Absence";
	};

	const getExcused = (iconName: string, name = ""): "Excused" | "Unexcused" | null => {
		const ic = (iconName ?? "").toLowerCase();
		// Unexcused: "unexcused" full word or "unx" abbreviation
		if (ic.includes("unexcused") || ic.includes("unx")) return "Unexcused";
		// Excused: explicit "excused" word, or tardy icon with no unexcused marker
		if (ic.includes("excused")) return "Excused";
		if (ic.includes("tardy")) return "Excused"; // icon_tardy.gif = excused; unexcused tardy uses icon_unxtardy.gif
		if (ic.includes("activity")) return "Excused"; // icon_activity.gif = always excused
		// Fallback to name (e.g. "Tardy Exc - Teacher", "Do Not Call - Unexc")
		const n = (name ?? "").toLowerCase();
		if (n.includes("unexc")) return "Unexcused";
		if (n.includes(" exc") || n.includes("exc ") || n.includes("-exc") || n.includes("exc-")) return "Excused";
		return null;
	};

	// Semester key: schoolYear * 10 + sem (e.g. 20241 = 2024-25 S1, 20242 = 2024-25 S2)
	const getSemesterKey = (date: Date): number => {
		const m = date.getMonth() + 1;
		const y = date.getFullYear();
		const schoolYear = m >= 8 ? y : y - 1;
		const sem = (m >= 8 || m === 1) ? 1 : 2;
		return schoolYear * 10 + sem;
	};
	const semesterLabel = (key: number): string => `Semester ${key % 10}`;

	const semesters = useMemo(() => {
		if (!data?.absences) return [];
		const keys = new Set<number>();
		for (const a of data.absences) keys.add(getSemesterKey(a.date));
		return [...keys].sort((a, b) => b - a); // newest first
	}, [data]);

	const [selectedSem, setSelectedSem] = useState<number | null>(null);
	const activeSem = selectedSem ?? semesters[0] ?? null;

	// Stats for the selected semester
	const summaryStats = useMemo(() => {
		const byCategory: Record<string, number> = { Absence: 0, Tardy: 0, "Early Out": 0, Activity: 0 };
		const byCatExcused: Record<string, { Excused: number; Unexcused: number }> = {
			Absence: { Excused: 0, Unexcused: 0 },
			Tardy: { Excused: 0, Unexcused: 0 },
			"Early Out": { Excused: 0, Unexcused: 0 },
			Activity: { Excused: 0, Unexcused: 0 },
		};
		type PeriodStats = {
			absEx: number; absUnex: number;
			tardyEx: number; tardyUnex: number;
			earlyEx: number; earlyUnex: number;
			activity: number;
			total: number;
		};
		const byPeriod: Record<string, PeriodStats> = {};
		if (!data?.absences) return { byCategory, byCatExcused, byPeriod, totalDays: 0 };
		let totalDays = 0;
		for (const a of data.absences) {
			if (activeSem !== null && getSemesterKey(a.date) !== activeSem) continue;
			totalDays++;
			for (const p of a.periods) {
				if (p.name) {
					const cat = getCategory(p.iconName ?? "", p.name);
					byCategory[cat] = (byCategory[cat] ?? 0) + 1;
					const ex = getExcused(p.iconName ?? "", p.name ?? "");
					if (ex && byCatExcused[cat]) byCatExcused[cat][ex]++;
				}
				if (p.period != null) {
					const key = String(p.period);
					if (!byPeriod[key]) byPeriod[key] = { absEx: 0, absUnex: 0, tardyEx: 0, tardyUnex: 0, earlyEx: 0, earlyUnex: 0, activity: 0, total: 0 };
					const cat = getCategory(p.iconName ?? "", p.name ?? "");
					const ex = getExcused(p.iconName ?? "", p.name ?? "");
					if (cat === "Absence") { if (ex === "Excused") byPeriod[key].absEx++; else byPeriod[key].absUnex++; }
					else if (cat === "Tardy") { if (ex === "Excused") byPeriod[key].tardyEx++; else byPeriod[key].tardyUnex++; }
					else if (cat === "Early Out") { if (ex === "Excused") byPeriod[key].earlyEx++; else byPeriod[key].earlyUnex++; }
					else if (cat === "Activity") byPeriod[key].activity++;
					byPeriod[key].total++;
				}
			}
		}
		return { byCategory, byCatExcused, byPeriod, totalDays };
	}, [data, activeSem]);


	return (
		<div className="flex-1 p-5 md:p-10">
			<Head><title>Attendance - Grade Durian</title></Head>
			{loading ? (
				<div className="flex justify-center">
					<div style={{ color: "rgb(var(--primary-500))" }} className="[&_svg]:fill-primary-500"><Spinner size="xl" color="warning" /></div>
				</div>
			) : (
				<div className="w-full space-y-5">
					{/* View selector */}
					<select
						value={view}
						onChange={(e) => setView(e.target.value as any)}
						className="h-11 mb-0 block w-full p-2 text-sm text-gray-900 bg-white rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
					>
						<option value="calendar">Calendar</option>
						<option value="list">History</option>
						<option value="summary">Summary</option>
					</select>

					{/* Summary view */}
					{view === "summary" && (
						<div className="space-y-4">
							{/* Semester selector */}
							{semesters.length > 0 && (
								<div className="flex gap-2 flex-wrap">
									{semesters.map(key => (
										<button key={key} onClick={() => setSelectedSem(key)}
											className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${activeSem === key ? "bg-primary-500 border-primary-500 text-white" : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"}`}>
											{semesterLabel(key)}
										</button>
									))}
								</div>
							)}

							{/* Days affected — top */}
							<div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 px-5 py-4 flex items-center gap-4 shadow-md [transition:none]">
								<span className="text-3xl font-bold text-gray-900 dark:text-white">{summaryStats.totalDays}</span>
								<span className="text-sm font-medium text-gray-500 dark:text-gray-400">Days Affected</span>
							</div>

							{/* Category breakdown */}
							<div className="w-full overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 shadow-md [transition:none]">
								{[
									{ label: "Absences", cat: "Absence" },
									{ label: "Tardies", cat: "Tardy" },
									{ label: "Early Outs", cat: "Early Out" },
									{ label: "Activities", cat: "Activity" },
								].map(({ label, cat }) => ({ label, cat, color: CAT_COLORS[cat] }))
								.filter(({ cat }) => (summaryStats.byCategory[cat] ?? 0) > 0)
								.map(({ label, cat, color }, idx) => {
									const total = summaryStats.byCategory[cat] ?? 0;
									const ex = summaryStats.byCatExcused[cat] ?? { Excused: 0, Unexcused: 0 };
									return (
										<div key={cat} className={`flex items-center justify-between px-5 py-3 ${idx > 0 ? "border-t border-gray-100 dark:border-gray-700" : ""} bg-white dark:bg-gray-900`}>
											<div className="flex items-center gap-3">
												<span className="text-xl font-bold w-8 text-right" style={{ color }}>{total}</span>
												<span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
											</div>
											<div className="flex gap-3 text-xs font-medium">
												{ex.Excused > 0 && <span className="text-green-500">{ex.Excused} excused</span>}
												{ex.Unexcused > 0 && <span className="text-red-500">{ex.Unexcused} unexcused</span>}
											</div>
										</div>
									);
								})}
							</div>

							{/* Per-period breakdown */}
							{Object.keys(summaryStats.byPeriod).length > 0 && (
								<div className="w-full shadow-md rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden [transition:none]">
								<div className="overflow-x-auto">
								<table className="min-w-max w-full text-sm text-left text-gray-500 dark:text-gray-400">
									<thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
										<tr>
											<th className="py-3 px-4">Period</th>
											<th className="py-3 px-4" style={{ color: CAT_COLORS["Absence"] }}>Absences</th>
											<th className="py-3 px-4" style={{ color: CAT_COLORS["Tardy"] }}>Tardies</th>
											<th className="py-3 px-4" style={{ color: CAT_COLORS["Early Out"] }}>Early Out</th>
											<th className="py-3 px-4" style={{ color: CAT_COLORS["Activity"] }}>Activities</th>
										</tr>
									</thead>
									<tbody>
										{Object.entries(summaryStats.byPeriod)
											.sort(([a], [b]) => Number(a) - Number(b))
											.map(([period, s], i) => {
												const cell = (unex: number, ex: number) => (unex + ex) === 0 ? <span className="text-gray-400">—</span> : (
													<div className="flex flex-col text-xs font-medium leading-tight">
														{unex > 0 && <span className="text-red-500">{unex} unexcused</span>}
														{ex > 0 && <span className="text-green-500">{ex} excused</span>}
													</div>
												);
												return (
													<tr key={period} className={`border-b dark:border-gray-700 ${i % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-800"}`}>
														<td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{period}</td>
														<td className="py-3 px-4">{cell(s.absUnex, s.absEx)}</td>
														<td className="py-3 px-4">{cell(s.tardyUnex, s.tardyEx)}</td>
														<td className="py-3 px-4">{cell(s.earlyUnex, s.earlyEx)}</td>
														<td className="py-3 px-4">{s.activity ? <span className="text-xs font-medium text-green-600 dark:text-green-400">{s.activity} excused</span> : <span className="text-gray-400">—</span>}</td>
													</tr>
												);
											})}
									</tbody>
								</table>
								</div>
								</div>
							)}
						</div>
					)}

					{/* Calendar view */}
					{view === "calendar" && (
						<div className="w-full rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-md [transition:none]">
							{/* Month nav */}
							<div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
								<button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300">
									<HiChevronLeft size="1.2rem" />
								</button>
								<p className="font-semibold text-gray-900 dark:text-white">
									{MONTHS[calMonth.getMonth()]} {calMonth.getFullYear()}
								</p>
								<button onClick={nextMonth} disabled={isCurrentMonth} className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed">
									<HiChevronRight size="1.2rem" />
								</button>
							</div>
							{/* Day headers */}
							<div className="grid grid-cols-7 bg-gray-50 dark:bg-gray-700">
								{DAYS.map(d => (
									<div key={d} className="py-2 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{d}</div>
								))}
							</div>
							{/* Calendar cells */}
							<div className="grid grid-cols-7 bg-white dark:bg-gray-900">
								{calDays.map(({ date: day, currentMonth }, i) => {
									const key = day.toDateString();
									const dayAbsences = currentMonth ? (absenceByDay.get(key) ?? []) : [];
									const isToday = day.toDateString() === new Date().toDateString();
									// Group by category + excused for dots
									const dots: { label: string; color: string; opacity: number }[] = [];
									const seen = new Set<string>();
									dayAbsences.forEach(a => a.periods.forEach((p: any) => {
										const cat = getCategory(p.iconName ?? "", p.name ?? "");
										const ex = getExcused(p.iconName ?? "", p.name ?? "");
										// Early out: single dot, dim only if excused
										const key2 = cat === "Early Out" ? "Early Out" : `${cat}-${ex ?? "unknown"}`;
										if (!seen.has(key2)) {
											seen.add(key2);
											const opacity = ex === "Excused" ? 0.5 : 1;
											const label = cat === "Early Out" ? "Early Out" : `${cat}${ex ? ` (${ex})` : ""}`;
											dots.push({ label, color: CAT_COLORS[cat] ?? "#6b7280", opacity });
										}
									}));
									const hasUnexcusedAbsence = dayAbsences.some(a => a.periods.some((p: any) =>
										getExcused(p.iconName ?? "", p.name ?? "") === "Unexcused"
									));
									return (
										<div key={i} className={`border-t border-r border-gray-100 dark:border-gray-800 h-20 p-1.5 overflow-hidden ${!currentMonth ? "" : hasUnexcusedAbsence ? "bg-gray-50 dark:bg-gray-800" : ""}`}>
												{day.getDate() === 1 ? (
												<span className={`text-xs font-medium leading-none ${currentMonth ? "text-gray-700 dark:text-gray-300" : "text-gray-300 dark:text-gray-600"}`}>
													{MONTHS[day.getMonth()].slice(0, 3)} 1
												</span>
											) : (
												<span className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full ${isToday ? "bg-primary-500 text-white" : currentMonth ? "text-gray-700 dark:text-gray-300" : "text-gray-300 dark:text-gray-600"}`}>
													{day.getDate()}
												</span>
											)}
											{dots.length > 0 && (
												<div className="mt-1 flex flex-wrap gap-0.5">
													{dots.map((dot, di) => (
														<span key={di} title={dot.label} className="w-2 h-2 rounded-full flex-shrink-0"
															style={{ backgroundColor: dot.color, opacity: dot.opacity }} />
													))}
												</div>
											)}
											{dots.length > 0 && (
												<p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 leading-tight truncate">
													{dots[0].label}
												</p>
											)}
										</div>
									);
								})}
							</div>
							{/* Legend */}
							<div className="flex flex-wrap gap-4 px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
								{(["Absence","Tardy","Early Out","Activity"] as string[]).map(cat => ({ cat, color: CAT_COLORS[cat] })).map(({ cat, color }) => (
									<div key={cat} className="flex items-center gap-1">
										<span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
										<span className="text-xs text-gray-600 dark:text-gray-300">{cat}</span>
									</div>
								))}
							</div>
						</div>
					)}

					{/* List view — one card/table per day */}
					{view === "list" && (
						<div className="space-y-4">
							{[...(data?.absences ?? [])]
								.sort((a, b) => b.date.getTime() - a.date.getTime())
								.map((absence, i) => {
									const sorted = [...absence.periods].sort((a, b) => a.period - b.period);
									return (
										<div key={i} className="w-full rounded-lg border border-gray-200 dark:border-gray-700 shadow-md overflow-hidden [transition:none]">
											{/* Day header */}
											<div className="px-5 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
												<p className="font-semibold text-gray-900 dark:text-white text-sm">
													{absence.date.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
												</p>
												{absence.reason && (
													<span className="text-xs text-gray-500 dark:text-gray-400">{absence.reason}</span>
												)}
											</div>
											<div className="overflow-x-auto">
											<table className="w-full text-sm text-left text-gray-500 dark:text-gray-400" style={{ tableLayout: "fixed", minWidth: "580px" }}>
												<colgroup>
													<col style={{ width: "60px" }} />
													<col style={{ width: "180px" }} />
													<col style={{ width: "140px" }} />
													<col style={{ width: "100px" }} />
													<col style={{ width: "100px" }} />
												</colgroup>
												<thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
													<tr>
														<th className="py-2 px-5">Period</th>
														<th className="py-2 px-5">Course</th>
														<th className="py-2 px-5">Type</th>
														<th className="py-2 px-5">Category</th>
														<th className="py-2 px-5">Status</th>
													</tr>
												</thead>
												<tbody>
													{sorted.map((p, j) => {
														const cat = getCategory(p.iconName ?? "", p.name ?? "");
														const ex = getExcused(p.iconName ?? "", p.name ?? "");
														const catColor = CAT_COLORS[cat] ?? "#6b7280";
														return (
															<tr key={j} className={`h-12 border-b border-gray-100 dark:border-gray-700 ${j % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-800"}`}>
																<td className="py-2 px-5">{p.period}</td>
																<td className="py-2 px-5 truncate">{p.course || "—"}</td>
																<td className="py-2 px-5 truncate" style={{ color: typeColor[p.name] || "#6b7280" }}>{p.name || "—"}</td>
																<td className="py-2 px-5 font-medium whitespace-nowrap" style={{ color: catColor }}>{cat}</td>
																<td className="py-2 px-5 font-medium whitespace-nowrap">
																	{ex === "Excused" && <span className="text-green-500">Excused</span>}
																	{ex === "Unexcused" && <span className="text-red-500">Unexcused</span>}
																	{!ex && <span className="text-gray-400">—</span>}
																</td>
															</tr>
														);
													})}
												</tbody>
											</table>
											</div>
										</div>
									);
								})}
						</div>
					)}
				</div>
			)}
		</div>
	);
}
