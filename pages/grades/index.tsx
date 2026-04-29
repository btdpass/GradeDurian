import React, { useState, useEffect } from "react";
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
	SchoolsListType,
} from "../../utils/grades";
import { Modal } from "flowbite-react";
import ClientOnly from "../../components/ClientOnly";
import { motion } from "framer-motion";
import { BsGearWideConnected } from "react-icons/bs";
import SettingsModal from "../../components/settingsModal"
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
	originalGradingScale:any;
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
	width,modalBg,setModalBg,setSettingsModal,settingsModal,schoolsList,setSchoolsList,schoolIndex,setSchoolIndex,donation,showCountdown,setShowCountdown,originalGradingScale
}: GradesProps) {
	const router = useRouter();
	const [loading,setLoading]=useState(!Boolean(grades))
	
	const [defaultView, setDefaultView] = useState("card");
	//const [period, setMP] = useState<number>();
	const [gpaModal, setGpaModal] = useState(false);
	const view = (router.query.view as string) || defaultView;
	const [countdown, setCountdown] = useState<{period: number, label: string, ms: number} | null>(null);

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
			const now = new Date(); //now.setHours(13); // TEST: 12:30 PM during AP Bio (12:05–1:40)
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

			if (!active) { setCountdown(null); return; }
			const end = all
				.filter(c => getName(c) === getName(active))
				.reduce((latest, c) => { const e = getEnd(c); return e > latest ? e : latest; }, getEnd(active));
			const diff = Math.max(0, end.getTime() - now.getTime());
			const p = Array.isArray(active.period) ? active.period[0] : active.period;
			setCountdown({ period: parseInt(p), label: `${fmtDiff(diff)}`, ms: diff });
		}
		tick();
		const id = setInterval(tick, 1000);
		return () => clearInterval(id);
	}, [scheduleLoaded]);

	//@ts-ignore
	const mcps=client?.district=="https://md-mcps-psv.edupoint.com/Service/PXPCommunication.asmx"
	const isMediumOrLarger = width >= 768;

	const formatPeriods = (ps: number[]) =>
		ps.length > 1 ? `${ps[0]} & ${ps[ps.length - 1]}` : String(ps[0]);
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
			<ClientOnly><Modal show={gpaModal} onClose={() => setGpaModal(false)}>
				<Modal.Header>GPA Calculator</Modal.Header>
				<Modal.Body>
					<p className="dark:text-white font-bold text-xl">
						GPA: {grades?.[mp]?.gpa.toFixed(2)}
					</p>
					<p className="dark:text-white font-bold text-xl pb-5">
						WGPA: {grades?.[mp]?.wgpa.toFixed(2)}
					</p>

					<p className="dark:text-white font-bold text-xl">Weighted?</p>
					{grades?.[mp]?.courses.map((course, i) => (
						<div className="flex gap-2 items-center pt-2" key={i}>
							<label className="relative inline-flex items-center cursor-pointer">
								<input
									type="checkbox"
									checked={course?.weighted}
									className="sr-only peer"
									onChange={(e) => changeWeights(e, i)}
								/>
								<div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
							</label>
							<p className="dark:text-white text-md md:text-lg">
								{course?.name}
							</p>
						</div>
					))}
				</Modal.Body>
				<Modal.Footer>
					<div className="flex gap-2">
						<button
							onClick={() => setGpaModal(false)}
							className="rounded-lg bg-gray-500 px-2.5 py-2.5 text-center text-xs sm:text-sm font-medium text-white hover:bg-gray-600 focus:outline-none focus:ring-4 focus:ring-gray-300 dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-800"
						>
							Close
						</button>
					</div>
				</Modal.Footer>
			</Modal></ClientOnly>
			}

			

			{loading ? (
				<div className="flex justify-center">
					<Spinner size="xl" color="warning" />
				</div>
			) : (
				<div className="md:max-w-max">
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
				originalGradingScale={originalGradingScale}
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
						<div
							className="grid gap-5 2col:grid-cols-2 3col:grid-cols-3 4col:grid-cols-4 justify-items-center mx-1" //so if u decide the margin is fugly, just get rid of mx-1 and put back items-stretch and w-full
							//style={{ gridTemplateColumns: "repeat(auto-fit, 384px)" }}
						>
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
								<div className="mx-2 flex justify-center w-full md:w-96" key={i}>
									<Link href={`/grades/${layoutID}`} legacyBehavior>
									<motion.div
										layout="preserve-aspect"
										layoutId={`card-${layoutID}`}
											whileHover={{ scale: 1.03, boxShadow: "0 6px 20px rgba(0,0,0,0.1)" }}
										transition={{ duration: 0.12, ease: "easeOut" }}
										className={`relative h-full flex flex-col justify-between w-full gap-2 md:gap-5 p-4 sm:p-6 max-w-sm rounded-lg shadow-md cursor-pointer ${countdownMatchesCourse(periods) && showCountdown ? 'bg-yellow-50 border border-yellow-200 dark:bg-yellow-400/10 dark:border-yellow-400/30' : 'bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700'}`}
									>
										<div className="">
											{/* <Link href={`/grades/${layoutID}`} legacyBehavior> */}
											<div className="hover:cursor-pointer">
													<h5 className="md:text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
														<p className="font-bold">
															{formatPeriods(periods)} -{" "}
															<motion.span
																layout
																layoutId={`name-${layoutID}`}
																className="font-semibold"
															>
																{name}
															</motion.span>
														</p>
													</h5>
													<motion.p
														layoutId={`teacher-${layoutID}`}
														layout
														className="text-md tracking-tight text-gray-900 dark:text-white flex items-center gap-2"
													>
														{teacher.name}
														{countdownMatchesCourse(periods) && showCountdown && (
															<span className={`text-xs font-medium rounded-full px-2 py-0.5 ${urgencyClass(countdown.ms, 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300')}`}>
																{countdown.label}
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
									<motion.div
										layoutId={`final-${layoutID}`}
										layout="preserve-aspect"
										style={{color:finalGrade.color.includes("#") && finalGrade.color}}
										className={`text-md md:text-xl font-bold text-${finalGrade.color}-400`}
									>
										Final, {finalGrade.letter} {!isNaN(finalGrade.raw) ? (`(${settings.rounding.percent ? (finalGrade.raw).toFixed(settings.rounding.percentPlaces) : finalGrade.raw}%)`) : ""}
									</motion.div>}
										{semesterGrade &&
									<motion.div
										layoutId={`semester-${layoutID}`}
										layout="preserve-aspect"
										style={{color:semesterGrade.color.includes("#") && semesterGrade.color}}
										className={`text-md md:text-xl font-bold text-${semesterGrade.color}-400`}
									>
										{!settings?.finals?.isSemester && ordinalSuffix(indexX+1)} Semester, {semesterGrade.letter} {!isNaN(semesterGrade.raw) ? (`(${settings.rounding.percent ? (semesterGrade.raw).toFixed(settings.rounding.percentPlaces) : semesterGrade.raw}%)`) : ""}
									</motion.div>}
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
						<div className="overflow-x-auto max-w-max -md rounded-lg border border-gray-200 dark:border-gray-700">
							<table className="text-sm text-left text-gray-500 dark:text-gray-400">
								<thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
									<tr>
										<th scope="col" className="py-3 pl-6">
											Period
										</th>
										<th scope="col" className="py-3 px-6">
											Course Name
										</th>
										<th scope="col" className="py-3 px-6">
											Teacher
										</th>
										<th scope="col" className="py-3 px-6">
											Grade
										</th>
										{
										hasFinals && <th scope="col" className="py-3 px-6">
												Final		
											</th>
										}
										{ 
										hasSemester &&	<th scope="col" className="py-3 px-6">
												Semester		
											</th>
										}
									</tr>
								</thead>
								<tbody>
									{grades?.[mp]?.courses.map(
										({ name, period, periods, grade, teacher,settings }, i) => {
											var semesterGrade
											if(!settings?.finals?.isSemester){
											var finalGrade=settings?.finals?.show ? calcFinal(settings.finals.categories,grades) : undefined
											const semesters=settings?.finals?.semesters
											const semCats=semesters.map(semester=>semester.categories)
											var indexX=semCats.findIndex(categories=>categories.some(category=>interimWiseComparison(category,{mp:mp})))
											semesterGrade=indexX!=-1 ? (settings?.finals?.semesters[indexX].show||true ? (calcFinal(settings?.finals?.semesters[indexX].categories,grades)) : undefined):undefined
											
										}else{
											finalGrade=undefined
											indexX=settings.finals.semesters.findIndex(semester=>semester!=undefined)
											const semester=settings?.finals?.semesters[indexX]     
											const isNow=semester.categories.some(category=>interimWiseComparison(category,{mp:mp}))
											semesterGrade=isNow ? calcFinal(semester.categories,grades) : undefined
									
											}


											
											
											return (
											<tr
												className={`bg-${
													i % 2 == 0 ? "white" : "gray-50"
												} border-b dark:bg-gray-${
													i % 2 == 0 ? 900 : 800
												} dark:border-gray-700`}
												key={i}
											>
												<td
													scope="row"
													className="py-4 pl-6 font-medium text-gray-900 whitespace-nowrap dark:text-white"
												>
													{formatPeriods(periods)}
												</td>
												<td className="py-4 px-6">
													<Link href={`/grades/${i}`} legacyBehavior>
														{name}
													</Link>
												</td>
												<td className="py-4 px-6">{teacher.name}</td>
												<td className="py-4 px-6">
													<span 
													style={{color:grade.color.includes("#") && grade.color}}
													className={`font-bold text-${grade.color}-400`}>
														{grade.letter}
														{!isNaN(grade.raw) && ` (${grade.raw}%)`}
													</span>
												</td>
												{hasFinals &&
													<td className="py-4 px-6">
														{finalGrade ? <span 
														style={{color:finalGrade.color.includes("#") && finalGrade.color}}
														className={`font-bold text-${finalGrade.color}-400`}>
															{finalGrade.letter}
															{!isNaN(finalGrade.raw) && ` (${finalGrade.raw}%)`}
														</span> : <p>N/A</p>}
													</td>
												}
												{hasSemester &&
													<td className="py-4 px-6">
														{semesterGrade ? <span 
														style={{color:semesterGrade.color.includes("#") && semesterGrade.color}}
														className={`font-bold text-${semesterGrade.color}-400`}>
															{semesterGrade.letter}
															{!isNaN(semesterGrade.raw) && ` (${semesterGrade.raw}%)`}
														</span> : <p>N/A</p>}
													</td>
												}
											</tr>
										)}
									)}
								</tbody>
							</table>
						</div>
					)}
			</div>
			)}
		</motion.div>
	);
}
