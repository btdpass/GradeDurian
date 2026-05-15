import React, { useState, useEffect, useRef } from "react";
import { Spinner } from "flowbite-react";
import { useRouter } from "next/router";
import Head from "next/head";

interface ScheduleProps {
	client: any;
	createError: (message: string) => void;
}

const f = (v: any) => (Array.isArray(v) ? v[0] : v);
const parsePeriod = (p: any) => {
	const raw = String(f(p) ?? "");
	return /^\d+$/.test(raw) ? parseInt(raw) : raw;
};

const thCls = "py-3 px-6 text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 whitespace-nowrap";
const rowCls = (i: number) =>
	`border-b dark:border-gray-700 h-14 ${i % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-800"}`;
const tdCls = "py-3 px-6 whitespace-nowrap";
const tdBold = "py-3 px-6 font-medium text-gray-900 whitespace-nowrap dark:text-white";

function TableHead() {
	return (
		<>
			<colgroup>
				<col style={{ width: "180px" }} />
				<col style={{ width: "80px" }} />
				<col style={{ width: "260px" }} />
				<col style={{ width: "80px" }} />
				<col style={{ width: "180px" }} />
			</colgroup>
			<thead>
				<tr>
					<th scope="col" className={thCls}>Time</th>
					<th scope="col" className={thCls}>Period</th>
					<th scope="col" className={thCls}>Course Name</th>
					<th scope="col" className={thCls}>Room</th>
					<th scope="col" className={thCls}>Teacher</th>
				</tr>
			</thead>
		</>
	);
}

export default function Schedule({ client, createError }: ScheduleProps) {
	const [loading, setLoading] = useState(true);
	const [schedule, setSchedule] = useState<any>();
	const [term, setTerm] = useState<any>();
	const [today, setToday] = useState(true);
	const cache = useRef<Record<string, any>>({});

	useEffect(() => {
		try {
			const isToday = term === undefined || term === "today";
			const cacheKey = isToday ? "today" : String(term);

			// Cache hit — apply immediately
			if (cache.current[cacheKey] !== undefined) {
				const cached = cache.current[cacheKey];
				setSchedule(cached);
				if (isToday && cached.today === false) { setToday(false); setTerm(cached.termIndex); }
				setLoading(false);
				return;
			}

			// Pre-fetched today schedule
			if (isToday && client.loadedSchedule) {
				const res = client.loadedSchedule;
				cache.current["today"] = res;
				setSchedule(res);
				if (res.today === false) { setToday(false); setTerm(res.termIndex); }
				setLoading(false);
				return;
			}

			// Fetch
			setLoading(true);
			client.schedule(isToday ? undefined : term).then(([res]: any) => {
				cache.current[cacheKey] = res;
				if (isToday) {
					client.loadedSchedule = res;
					if (res.today === false) { setToday(false); setTerm(res.termIndex); }
				}
				setSchedule(res);
				setLoading(false);
			}).catch((err: any) => { createError(err.message); setLoading(false); });
		} catch {}
	}, [client, term]);

	// Pre-fetch all terms in the background once the initial schedule is loaded
	useEffect(() => {
		if (!schedule?.terms) return;
		for (const t of schedule.terms) {
			const key = String(t.termIndex);
			if (cache.current[key]) continue;
			client.schedule(t.termIndex).then(([res]: any) => {
				cache.current[key] = res;
			}).catch(() => {});
		}
	}, [schedule]);

	function update(e: any) {
		const val = e.target.value;
		if (val === "today") { setToday(true); setTerm("today"); }
		else { setToday(false); setTerm(parseInt(val)); }
	}

	function matchClass(todayClass: any) {
		const period = parseInt(f(todayClass.period));
		const match = schedule.mainClasses.find((c: any) => parseInt(c.period) === period);
		return {
			name: match ? match.name : f(todayClass.name),
			teacher: match ? match.teacher : f(todayClass.teacher),
		};
	}

	const filteredMain = schedule?.today?.main?.filter((c: any) => f(c.start) !== f(c.end)) ?? [];
	const filteredCon  = schedule?.today?.con?.filter((c: any) => f(c.start) !== f(c.end)) ?? [];

	return (
		<div className="p-5 md:p-10 h-full flex-1">
			<Head><title>Schedule - Grade Durian</title></Head>
			{loading ? (
				<div className="flex justify-center">
					<div style={{ color: "rgb(var(--primary-500))" }} className="[&_svg]:fill-primary-500">
						<Spinner size="xl" color="warning" />
					</div>
				</div>
			) : (
				<div className="w-full">
					<select
						value={today ? "today" : term}
						onChange={update}
						className="h-11 mb-5 block w-full p-2 text-sm text-gray-900 bg-white rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
					>
						{schedule.today && <option value="today">Today</option>}
						{schedule?.terms?.map((t: any) => (
							<option key={t.termIndex} value={t.termIndex}>{t.termName}</option>
						))}
					</select>

					<div className="w-full overflow-x-auto shadow-md rounded-lg border border-gray-200 dark:border-gray-700">
						<table className="w-full text-sm text-left text-gray-500 dark:text-gray-400" style={{ tableLayout: "fixed", minWidth: "780px" }}>
							<TableHead />
							<tbody>
								{/* Today view */}
								{today && filteredMain.map((c: any, i: number) => {
									const { name, teacher } = matchClass(c);
									return (
										<tr key={i} className={rowCls(i)}>
											<td className={tdBold}>{f(c.start)} – {f(c.end)}</td>
											<td className={tdCls}>{parsePeriod(c.period)}</td>
											<td className={tdCls}>{name}</td>
											<td className={tdCls}>{f(c.room)}</td>
											<td className={tdCls}>{teacher}</td>
										</tr>
									);
								})}
								{today && schedule.today.con && (
									<>
										<tr>
											<td colSpan={5} className={`${rowCls(filteredMain.length)} font-bold pl-4 text-lg text-gray-900 dark:text-white`}>
												{schedule.conClasses?.conName}:
											</td>
										</tr>
										{filteredCon.map((c: any, i: number) => {
											const ri = filteredMain.length + 1 + i;
											return (
												<tr key={ri} className={rowCls(ri)}>
													<td className={tdBold}>{f(c.start)} – {f(c.end)}</td>
													<td className={tdCls}>{parsePeriod(c.period)}</td>
													<td className={tdCls}>{f(c.name)}</td>
													<td className={tdCls}>{f(c.room)}</td>
													<td className={tdCls}>{f(c.teacher)}</td>
												</tr>
											);
										})}
									</>
								)}

								{/* Term view */}
								{!today && schedule.mainClasses?.map(({ period, name, room, teacher }: any, i: number) => (
									<tr key={i} className={rowCls(i)}>
										<td className={`${tdCls} text-gray-400 dark:text-gray-600`}>—</td>
										<td className={tdCls}>{parsePeriod(period)}</td>
										<td className={tdCls}>{name}</td>
										<td className={tdCls}>{room}</td>
										<td className={tdCls}>{teacher}</td>
									</tr>
								))}
								{!today && schedule.conClasses && (
									<>
										<tr>
											<td colSpan={5} className={`${rowCls(schedule.mainClasses.length)} font-bold pl-4 text-lg text-gray-900 dark:text-white`}>
												{schedule.conClasses.conName}:
											</td>
										</tr>
										{schedule.conClasses.map(({ period, name, room, teacher }: any, i: number) => {
											const ri = schedule.mainClasses.length + 1 + i;
											return (
												<tr key={ri} className={rowCls(ri)}>
													<td className={`${tdCls} text-gray-400 dark:text-gray-600`}>—</td>
													<td className={tdCls}>{parsePeriod(period)}</td>
													<td className={tdCls}>{name}</td>
													<td className={tdCls}>{room}</td>
													<td className={tdCls}>{teacher}</td>
												</tr>
											);
										})}
									</>
								)}
							</tbody>
						</table>
					</div>
				</div>
			)}
		</div>
	);
}
