import React, { useState, useEffect, useMemo } from "react";
import { Spinner } from "flowbite-react";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import { TbRefresh, TbMathSymbols } from "react-icons/tb";
import {
	parseGrades,
	Grades as GradesType,parseDate,findCurrentPeriod,getCache,Cache,calcFinal,
	initalizeFinals2,
	ordinalSuffix,
	calculateGPA,
	updateGPA,
	excludeGPA,
	SchoolsListType,
} from "../../utils/grades";
import { Modal } from "flowbite-react";
import ClientOnly from "../../components/ClientOnly";
import { motion } from "framer-motion";
import { BsGearWideConnected } from "react-icons/bs";
import SettingsModal from "../../components/settingsModal"
import type { Theme } from "../_app";
import StudentVue from "studentvue";
import {getGradebooks} from "../../utils/soap"
import { HiArrowCircleLeft, HiArrowCircleRight } from "react-icons/hi";
import {grades as sample}	 from "../../utils/sample"
import DonationModal from "../../components/DonationModal";

type ClientWithExtras = Awaited<ReturnType<typeof StudentVue.login>>["client"] & {
	guest?: boolean;
	loadedSchedule?: any;
};

interface GradesProps {
	client: ClientWithExtras;
	grades: Cache;
	setGrades: (grades: Cache) => void;
	mp: number;
	setMP: (period: number) => void;
	createError:(message:string)=>void;
	setTime:(time:number)=>void;
	timestamp:number;
	width:any;
	modalBg:boolean;
	setModalBg:(b:boolean)=>void;
	settingsModal:boolean;
	setSettingsModal:(b:boolean)=>void;
	schoolsList:SchoolsListType[],
    setSchoolsList:any
    schoolIndex:number,
    setSchoolIndex:any,
	donation:false | {userhash:string,date:number,type:string}
	showCountdown:boolean;
	setShowCountdown:(v:boolean)=>void;
	highlightColor:string|null;
	setHighlightColor:(v:string|null)=>void;
	siteTitle:string;
	customLogo:string;
	setCustomLogo:(v:string)=>void;
	setSiteTitle:(v:string)=>void;
	originalGradingScale:any;
	onColorPreview?:(hex:string, ignoreCustomLogo?:boolean)=>void;
	themes?: Theme[];
	setThemes?: (t: Theme[]) => void;
	applyTheme?: (t: Theme) => void;
}


export default function Grades({
	client,
	grades,
	setGrades,
	mp,
	setMP,
	createError,
	setTime,
	timestamp,
	width,modalBg,setModalBg,setSettingsModal,settingsModal,schoolsList,setSchoolsList,schoolIndex,setSchoolIndex,donation,showCountdown,setShowCountdown,highlightColor,setHighlightColor,siteTitle,setSiteTitle,customLogo,setCustomLogo,originalGradingScale,onColorPreview,themes,setThemes,applyTheme
}: GradesProps) {
	const router = useRouter();
	const [loading,setLoading]=useState(!Boolean(grades))
	
	const [defaultView, setDefaultView] = useState("card");
	//const [period, setMP] = useState<number>();
	const [gpaModal, setGpaModal] = useState(false);
	useEffect(() => {
		document.body.style.overflow = gpaModal ? 'hidden' : '';
		return () => { document.body.style.overflow = ''; };
	}, [gpaModal]);
	const view = (router.query.view as string) || defaultView;
	const [countdown, setCountdown] = useState<{period: number, label: string, ms: number} | null>(null);
	const [countdownTick, setCountdownTick] = useState<{label: string, ms: number} | null>(null);

	const [scheduleLoaded, setScheduleLoaded] = useState(false);

	useEffect(() => {
		if (!client || client.guest) return;
		if (client.loadedSchedule?.today) {
			setScheduleLoaded(true);
		} else {
			client.schedule().then(([res]) => {
				client.loadedSchedule = res;
				setScheduleLoaded(true);
			}).catch(() => {});
		}
	}, [client]);

	useEffect(() => {
		function parseTime(val: any): Date {
			const d = new Date();
			const str = String(val).trim();
			const [time, meridiem] = str.split(' ');
			let [h, m] = time.split(':').map(Number);
			if (meridiem === 'PM' && h !== 12) h += 12;
			if (meridiem === 'AM' && h === 12) h = 0;
			d.setHours(h, m, 0, 0);
			return d;
		}
		function tick() {
			const today = client?.loadedSchedule?.today;
			if (!today) { setCountdown(null); return; }
			const all = [...(today.main || []), ...(today.con || [])];
			const now = new Date(); //now.setHours(9); // TEST
			const active = all.find(c => {
				const s = parseTime(Array.isArray(c.start) ? c.start[0] : c.start);
				const e = parseTime(Array.isArray(c.end) ? c.end[0] : c.end);
				return now >= s && now <= e;
			});
			const fmtDiff = (ms: number) => {
				const h = Math.floor(ms / 3600000);
				const m = Math.floor((ms % 3600000) / 60000);
				const s = Math.floor((ms % 60000) / 1000);
				if (h > 0) return `${h}h ${m}m`;
				if (m > 0) return `${m}m ${s}s`;
				return `${s}s`;
			};
			const getName = (c: any) => Array.isArray(c.name) ? c.name[0] : c.name;
			const getEnd = (c: any) => parseTime(Array.isArray(c.end) ? c.end[0] : c.end);

			if (!active) { setCountdown(null); setCountdownTick(null); return; }
			const end = all
				.filter(c => getName(c) === getName(active))
				.reduce((latest, c) => { const e = getEnd(c); return e > latest ? e : latest; }, getEnd(active));
			const diff = Math.max(0, end.getTime() - now.getTime());
			const p = Array.isArray(active.period) ? active.period[0] : active.period;
			const period = parseInt(p);
			setCountdown(prev => prev?.period === period ? prev : { period, label: `${fmtDiff(diff)}`, ms: diff });
			setCountdownTick({ label: `${fmtDiff(diff)}`, ms: diff });
		}
		tick();
		const id = setInterval(tick, 1000);
		return () => clearInterval(id);
	}, [scheduleLoaded]);

	//@ts-ignore
	const mcps=client?.district=="https://md-mcps-psv.edupoint.com/Service/PXPCommunication.asmx"
	const isMediumOrLarger = width >= 768;

	const formatPeriods = (ps: number[]) =>
		ps.filter(p => !isNaN(p)).length > 1
			? ps.filter(p => !isNaN(p)).join("-")
			: String(ps.find(p => !isNaN(p)) ?? ps[0]);
	const currentMP = grades ? findCurrentPeriod(grades) : -1;
	const urgencyClass = (ms: number, base: string) => {
		if (ms < 60000) return 'bg-red-500 dark:bg-red-600 text-white';
		if (ms < 300000) return 'bg-yellow-400 dark:bg-yellow-500 text-gray-900';
		return base;
	};
	const countdownMatchesCourse = (coursePeriods: number[]) =>
		!!countdown && mp === currentMP && coursePeriods.includes(countdown.period);

	useEffect(() => {
		if (localStorage.getItem("defaultView") !== null) {
			setDefaultView(localStorage.getItem("defaultView"));
		}
	}, []);

	useEffect(() => {
		if (router.query.view !== undefined) {
			setDefaultView(router.query.view as string);
			localStorage.setItem("defaultView", router.query.view as string);
		}
	}, [router.query.view]);


	useEffect(() => {
	if (router.query.session_id !== undefined || router.query.session_id2 !== undefined) {
	//	createError("Thank you for your donation!")

	}
}, [router.query.session_id, router.query.session_id2]);
	


	useEffect(() => {
		try {

		} catch {
			if (localStorage.getItem("remember") === "false") {
				}
		}
	}, [client]);

	function update(p: number,getFresh=false){
		if(client.guest){
			const m = structuredClone(grades)
			m[mp] = sample[mp]
			setGrades(m)

			return}
		setLoading(true);

		if(getFresh){
			if(grades[0].periods[p].name.toLowerCase().includes("interim")&&mcps){
				var second;
				var secondIndex;
				client.gradebook(p+1,schoolsList ? schoolsList[schoolIndex].gu : null).then(([res,extra])=>{
					res.gradingScale=extra?.gradingScale
					const parsed=parseGrades(res,grades[0].settings)
					second=parsed;
					secondIndex=p+1;
					part2()
				}).catch((err) => {
				console.error("Gradebook fetch failed:", err);
				createError(err.message);
				setLoading(false);
			});
				
			}else{
				client.gradebook(p-1,schoolsList ? schoolsList[schoolIndex].gu : null).then(([res,extra])=>{
					res.gradingScale=extra?.gradingScale
					const parsed=parseGrades(res,grades[0].settings)
					second=parsed;
					secondIndex=p-1;
					part2()
				}).catch((err) => {
				console.error("Gradebook fetch failed:", err);
				createError(err.message);
				setLoading(false);
			});
	
			}

		const part2= ()=>client
			.gradebook(p,schoolsList ? schoolsList[schoolIndex].gu : null)
			.then(([res,extra]) => {
				res.gradingScale=extra?.gradingScale
				const parsed=parseGrades(res,grades[0].settings)
				const temp=structuredClone(grades)
				temp[p]=parsed;
				for(let i=0;i<temp[p].courses.length;i++){
					temp[p].courses[i].settings=grades[p].courses[i].settings
				}

				if(second){
					temp[secondIndex]=second
						for(let i=0;i<temp[secondIndex].courses.length;i++){
					temp[secondIndex].courses[i].settings=grades[secondIndex].courses[i].settings
				}
				}
				setGrades(temp)
				setMP(p);
				setLoading(false);
			
			})
			.catch((err) => {
				console.error("Gradebook fetch failed:", err);
				createError(err.message);
				setLoading(false);
			});

		}else{
			setMP(p)
			setLoading(false)
		}


	};

	
	useEffect(() => {
		if (gpaModal) {
			//@ts-ignore
			const clone = structuredClone(grades)
			clone[mp]=calculateGPA(grades?.[mp])
			setGrades(clone)
		}
	}, [gpaModal]);

	const changeWeights = (e, i: number) => {
		//@ts-ignore
		const clone = structuredClone(grades)
		clone[mp]=updateGPA(clone[mp], i, e.target.checked);
		setGrades(clone)
	};

	const changeExcluded = (e, i: number) => {
		//@ts-ignore
		const clone = structuredClone(grades)
		clone[mp]=excludeGPA(clone[mp], i, e.target.checked);
		setGrades(clone)
	};
	



	const interimWiseComparison = (cat1,cat2) => {
	cat1=structuredClone(cat1)
	cat2=structuredClone(cat2)
	if(grades[0].periods[cat1.mp].name.toLowerCase().includes("interim")){
		cat1.mp+=1
	}
	if(grades[0].periods[cat2.mp].name.toLowerCase().includes("interim")){
		cat2.mp+=1
	}
	return cat1.mp==cat2.mp
	}

	const hasFinals = grades?.[mp]?.courses.some((course)=>course.settings.finals.show)

	const hasSemester = grades?.[mp]?.courses.some(({settings})=>{
	if(!settings?.finals?.isSemester){
	const semesters=settings?.finals?.semesters
	const semCats=semesters.map(semester=>semester.categories)
	var indexX=semCats.findIndex(categories=>categories.some(category=>interimWiseComparison(category,{mp:mp})))
	return indexX!=-1}
											
	})


	function switchSchool(increment){
		if((schoolIndex==0&&increment<0)||(schoolIndex==schoolsList.length-1&&increment>0)){return}
		else{
		const index=schoolIndex+increment
		const school=schoolsList[index]
		const listCopy=structuredClone(schoolsList)
		listCopy[schoolIndex].cache=structuredClone(grades)
		listCopy[schoolIndex].mp=mp
		setSchoolsList(listCopy)
		setGrades(school.cache)
		setMP(school.mp)
		setSchoolIndex(index)
		}
	}





	return (
		<motion.div 
		className="p-5 md:p-10 md:flex-1">
			<Head>
				<title>Gradebook - Grade Durian</title>
			</Head>



			{
			<ClientOnly><Modal show={gpaModal} onClose={() => setGpaModal(false)} size="3xl">
				<Modal.Header className="dark:bg-gray-800 dark:border-gray-700">GPA Calculator</Modal.Header>
				<Modal.Body className="p-0 dark:bg-gray-800">
					{/* Summary bar */}
					<div className="flex gap-8 px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
						<div>
							<p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Unweighted GPA</p>
							<p className="text-2xl font-bold text-gray-900 dark:text-white">{grades?.[mp]?.gpa.toFixed(2)}</p>
						</div>
						<div>
							<p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Weighted GPA</p>
							<p className="text-2xl font-bold text-primary-500">{grades?.[mp]?.wgpa.toFixed(2)}</p>
						</div>
					</div>
					{/* Table */}
					<div className="overflow-x-auto">
						<table className="min-w-max w-full text-sm text-left text-gray-500 dark:text-gray-400">
							<thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
								<tr>
									<th className="py-3 px-4">Course</th>
									<th className="py-3 px-4">Grade</th>
									<th className="py-3 px-4">AP/Weighted</th>
									<th className="py-3 px-4">Include</th>
								</tr>
							</thead>
							<tbody>
								{grades?.[mp]?.courses.map((course, i) => {
									const included = !course.excluded;
									const rowBase = `h-12 border-b dark:border-gray-700 transition-colors ${included ? (i % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-800") : "opacity-30"}`;
									return (
										<tr key={i} className={rowBase}>
											<td className="py-2 px-4 text-gray-900 dark:text-white font-medium">{course.name}</td>
											<td className="py-2 px-4 whitespace-nowrap">
												<span style={{ color: course.grade.color?.includes("#") ? course.grade.color : undefined }}
													className={`font-bold text-${course.grade.color}-400`}>
													{course.grade.letter}
													{!isNaN(course.grade.raw) && ` (${course.grade.raw}%)`}
												</span>
											</td>
											<td className="py-2 px-4">
												<label className="relative inline-flex items-center cursor-pointer">
													<input type="checkbox" checked={!!course.weighted} className="sr-only peer"
														onChange={(e) => changeWeights(e, i)} disabled={!included} />
													<div className="w-9 h-5 bg-gray-200 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600 peer-focus:ring-2 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800" />
												</label>
											</td>
											<td className="py-2 px-4">
												<label className="relative inline-flex items-center cursor-pointer">
													<input type="checkbox" checked={included} className="sr-only peer"
														onChange={(e) => { const clone = structuredClone(grades); clone[mp] = excludeGPA(clone[mp], i, !e.target.checked); setGrades(clone); }} />
													<div className="w-9 h-5 bg-gray-200 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600 peer-focus:ring-2 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800" />
												</label>
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				</Modal.Body>
				<Modal.Footer className="dark:bg-gray-800 dark:border-gray-700">
					<button onClick={() => setGpaModal(false)}
						className="rounded-lg bg-gray-500 p-2 px-3 text-sm md:text-base text-white hover:bg-gray-600 focus:outline-none focus:ring-4 focus:ring-gray-300 dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-800 transition-colors duration-200">
						Close
					</button>
				</Modal.Footer>
			</Modal></ClientOnly>
			}

			

			{loading ? (
				<div className="flex justify-center">
					<div style={{color:"rgb(var(--primary-500))"}} className="[&_svg]:fill-primary-500"><Spinner size="xl" color="warning" /></div>
				</div>
			) : (
				<div>
					<ClientOnly><SettingsModal
				client={client}
				index={-1}
				showModal={settingsModal}
				setShowModal={(bool)=>{setSettingsModal(bool);setModalBg(bool)}}
				grades={grades}
				setGrades={setGrades}
				mp={mp}
				createError={createError}
				isMediumOrLarger={isMediumOrLarger}
				showCountdown={showCountdown}
				setShowCountdown={setShowCountdown}
				highlightColor={highlightColor}
				setHighlightColor={setHighlightColor}
				siteTitle={siteTitle}
				customLogo={customLogo}
				setCustomLogo={setCustomLogo}
				setSiteTitle={setSiteTitle}
				originalGradingScale={originalGradingScale}
				onColorPreview={onColorPreview}
				themes={themes}
				setThemes={setThemes}
				applyTheme={applyTheme}
			/></ClientOnly>

						<ClientOnly><DonationModal width={width} createError={createError} donation={donation} client={client}/></ClientOnly>

							{!loading && schoolsList && <div className="flex justify-between flex-shrink w-full pb-3 md:-mt-9">
				<button disabled={schoolIndex==0} className="dark:text-white disabled:opacity-50 disabled:dark:opacity-50 text-lg" onClick={()=>switchSchool(-1)}><HiArrowCircleLeft size={25}/></button>
				<p className="dark:text-white font-semibold truncate text-ellipsis px-2">{schoolsList[schoolIndex].name}</p>
				<button disabled={schoolIndex==schoolsList.length-1} className="dark:text-white disabled:opacity-50 disabled:dark:opacity-50 text-lg" onClick={()=>switchSchool(1)}><HiArrowCircleRight size={25}/></button>
			</div>}

					<div style={{}} className="flex gap-2 mb-5">
						<button
							type="button"
							onClick={() => update(mp,true)}
							className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm p-2.5 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
						>
							<TbRefresh size={"1.3rem"} />
						</button>
						<select
							id="periods"
							onChange={(e) => update(parseInt(e.target.value))}
							value={mp}
							className="block w-full p-2 text-sm text-gray-900 bg-white rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
						>
							{grades[mp]?.periods.map((period) => {
	
								return(
								<option value={period.index} key={period.index}//
								>
									{`${period.name} (${parseDate(period.date)})`}
								</option>
							)})}
						</select>

						<button
							type="button"
							onClick={() => setGpaModal(true)}
							className="bg-primary-500 border border-primary-500 focus:outline-none hover:bg-primary-600 focus:ring-4 focus:ring-primary-200 font-medium rounded-lg text-sm p-2.5 dark:bg-primary-600 text-white dark:hover:bg-primary-700 dark:focus:ring-primary-400"
						>
							<TbMathSymbols size={"1.3rem"} />
						</button>

						
	{!isMediumOrLarger	&& <button
							onClick={()=>{setSettingsModal(true);setModalBg(true)}}

							>
							<BsGearWideConnected
							className="md:text-3xl hover:text-gray-400 dark:hover:text-gray-400 dark:text-gray-200 text-gray-600"
							size={30}
							/>
						</button>}
					</div>
					{view === "card" && (
						<div className="grid gap-5 2col:grid-cols-2 3col:grid-cols-3 4col:grid-cols-4 items-stretch w-full">
							{(()=>{
								return (grades?.[mp]?.courses.map(({ name, period, periods, grade, teacher, settings,layoutID}, i) => {
								var semesterGrade
								if(!settings?.finals?.isSemester){
								var finalGrade=settings?.finals?.show ? calcFinal(settings.finals.categories,grades) : undefined
								const semesters=settings?.finals?.semesters
								const semCats=semesters.map(semester=>semester.categories)
								var indexX=semCats.findIndex(categories=>categories.some(category=>interimWiseComparison(category,{mp:mp})))
								semesterGrade=indexX!=-1 ? (settings?.finals?.semesters[indexX].show ? (calcFinal(settings?.finals?.semesters[indexX].categories,grades)) : undefined):undefined
								
							}else{
								finalGrade=undefined
								indexX=settings.finals.semesters.findIndex(semester=>semester!=undefined)
								const semester=settings?.finals?.semesters[indexX]     
								const isNow=semester.categories.some(category=>interimWiseComparison(category,{mp:mp}))
								semesterGrade=isNow ? calcFinal(semester.categories,grades) : undefined
						
								}

				
							return(
								<div className="flex justify-center w-full" key={i}>
									<Link href={`/grades/${layoutID}`} legacyBehavior>
									<motion.div
										layout="preserve-aspect"
										layoutId={`card-${layoutID}`}
										whileHover={{ scale: 1.03, boxShadow: "0 6px 20px rgba(0,0,0,0.1)" }}
										transition={{ duration: 0.12, ease: "easeOut", layout: { type: "spring", stiffness: 120, damping: 20, mass: 0.5 } }}
										style={countdownMatchesCourse(periods) && highlightColor ? {borderColor:`rgb(var(--primary-500)/0.35)`}:{}}
										className={`relative h-full flex flex-col justify-between w-full gap-2 md:gap-5 p-4 sm:p-6 rounded-lg shadow-md cursor-pointer border transition-colors duration-500 ${countdownMatchesCourse(periods) && highlightColor ? 'bg-gray-50 dark:bg-gray-900' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}
									>
										<div
											className="absolute inset-0 rounded-lg pointer-events-none transition-opacity duration-500"
											style={{
												backgroundImage: `linear-gradient(rgb(var(--primary-500)/0.15),rgb(var(--primary-500)/0.15))`,
												opacity: countdownMatchesCourse(periods) && highlightColor ? 1 : 0,
											}}
										/>
										<div className="">
											{/* <Link href={`/grades/${layoutID}`} legacyBehavior> */}
											<div className="hover:cursor-pointer">
													<div className="absolute top-4 right-4 sm:top-6 sm:right-6 text-xl font-semibold text-gray-400 dark:text-gray-500">{formatPeriods(periods)}</div>
													<h5 className="md:text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
														<motion.span
															layoutId={`name-${layoutID}`}
															className="font-bold"
														>
															{name}
														</motion.span>
													</h5>
													<motion.p
														className="text-md tracking-tight text-gray-900 dark:text-white flex items-center gap-2"
													>
														{teacher.name}
														{countdownMatchesCourse(periods) && showCountdown && (
															<span className={`text-xs font-medium rounded-full px-2 py-0.5 ${urgencyClass(countdownTick?.ms ?? 0, 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300')}`}>
																{countdownTick?.label}
															</span>
														)}
													</motion.p>
												</div>
											{/* </Link> */}
										</div>
							<div className="">
								<div className="flex items-end justify-between">
									<div
									className="flex-col"
									>
									<motion.span
										layoutId={`grade-${layoutID}`}
										layout="preserve-aspect"
										style={{color:grade.color.includes("#") && grade.color}}
										className={`text-xl md:text-3xl font-bold text-${grade.color}-400`}
									>
										{grade.letter}
										{settings ? (!isNaN(grade.raw) && ` (${grade.raw}%)`) : (!isNaN(grade.raw) ? `${grade.raw}%`:"")}
									</motion.span>
									{(settings.finals?.show && finalGrade) &&
									<div
										style={{color:finalGrade.color.includes("#") && finalGrade.color}}
										className={`text-md md:text-xl font-bold text-${finalGrade.color}-400`}
									>
										Final, {finalGrade.letter} {!isNaN(finalGrade.raw) ? (`(${settings.rounding.percent ? (finalGrade.raw).toFixed(settings.rounding.percentPlaces) : finalGrade.raw}%)`) : ""}
									</div>}
									{semesterGrade &&
									<div
										style={{color:semesterGrade.color.includes("#") && semesterGrade.color}}
										className={`text-md md:text-xl font-bold text-${semesterGrade.color}-400`}
									>
										{!settings?.finals?.isSemester && ordinalSuffix(indexX+1)} Semester, {semesterGrade.letter} {!isNaN(semesterGrade.raw) ? (`(${settings.rounding.percent ? (semesterGrade.raw).toFixed(settings.rounding.percentPlaces) : semesterGrade.raw}%)`) : ""}
									</div>}
									</div>

									<Link href={`/grades/${layoutID}`} legacyBehavior>
										<button className="rounded-lg bg-primary-500 px-5 py-2.5 text-center text-xs sm:text-sm font-medium text-white hover:bg-primary-600 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">
											View
										</button>
									</Link>
								</div>
							</div>
						</motion.div>
									</Link>
					</div>
					)}
					))})()}
				</div>
				)}
					{view === "table" && (
						<div className="w-full overflow-x-auto shadow-md rounded-lg border border-gray-200 dark:border-gray-700">
							<table className="min-w-max w-full text-sm text-left text-gray-500 dark:text-gray-400">
								<thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
									<tr>
										<th scope="col" className="py-3 px-6 whitespace-nowrap">Period</th>
										<th scope="col" className="py-3 px-6 whitespace-nowrap">Course Name</th>
										<th scope="col" className="py-3 px-6 whitespace-nowrap">Teacher</th>
										<th scope="col" className="py-3 px-6 whitespace-nowrap">Grade</th>
										{hasFinals   && <th scope="col" className="py-3 px-6 whitespace-nowrap">Final</th>}
										{hasSemester && <th scope="col" className="py-3 px-6 whitespace-nowrap">Semester</th>}
									</tr>
								</thead>
								<tbody>
									{grades?.[mp]?.courses.map(({ name, period, periods, grade, teacher, settings }, i) => {
										var semesterGrade
										if (!settings?.finals?.isSemester) {
											var finalGrade = settings?.finals?.show ? calcFinal(settings.finals.categories, grades) : undefined
											const semCats = settings?.finals?.semesters.map(s => s.categories)
											var indexX = semCats.findIndex(cats => cats.some(cat => interimWiseComparison(cat, { mp })))
											semesterGrade = indexX !== -1 ? (calcFinal(settings?.finals?.semesters[indexX].categories, grades)) : undefined
										} else {
											finalGrade = undefined
											indexX = settings.finals.semesters.findIndex(s => s !== undefined)
											const semester = settings?.finals?.semesters[indexX]
											semesterGrade = semester?.categories.some(c => interimWiseComparison(c, { mp })) ? calcFinal(semester.categories, grades) : undefined
										}
										const rowBase = `h-14 border-b dark:border-gray-700 ${i % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-800"}`;
										const cell = "py-3 px-6 whitespace-nowrap";
										const gradeSpan = (g: any) => g ? (
											<span style={{ color: g.color.includes("#") ? g.color : undefined }} className={`font-bold text-${g.color}-400`}>
												{g.letter}{!isNaN(g.raw) && ` (${g.raw}%)`}
											</span>
										) : <span className="text-gray-400">N/A</span>;
										return (
											<tr className={rowBase} key={i}>
												<td className={cell}>{formatPeriods(periods)}</td>
												<td className={`${cell} text-gray-900 dark:text-white font-medium`}>
													<Link href={`/grades/${i}`} legacyBehavior>{name}</Link>
												</td>
												<td className={cell}>{teacher.name}</td>
												<td className={cell}>{gradeSpan(grade)}</td>
												{hasFinals   && <td className={cell}>{gradeSpan(finalGrade)}</td>}
												{hasSemester && <td className={cell}>{gradeSpan(semesterGrade)}</td>}
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>
					)}
			</div>
			)}
		</motion.div>
	);
}
