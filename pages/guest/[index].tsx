import React, { useState, useEffect,useRef } from "react";
import { Spinner, Modal } from "flowbite-react";
import ClientOnly from "../../components/ClientOnly";
import { useRouter } from "next/router";
import {
	parseGrades,
	parseDate,
	updateCourse,
	addAssignment,
	delAssignment,
	updateCategory,
	Grades as GradesType,calcFinal,
	Course,getCache,
	genTable,
	abbreviate,
	letterGradeColor,letterGrade,Cache,
	findCurrentPeriod,
	SchoolsListType
} from "../../utils/grades";
import GradeField from "../../components/GradeField";
import CategoryField from "../../components/CategoryField";
import Head from "next/head";
import { motion } from "framer-motion";

//icons
import { TbRefresh } from "react-icons/tb";
import { HiOutlineDocumentAdd } from "react-icons/hi";
import { HiOutlineTrash } from "react-icons/hi";
import { BsGearWideConnected } from "react-icons/bs";
import { BsGraphUp } from "react-icons/bs";
import SettingsModal from "../../components/settingsModal"
import {getGradebooks} from "../../utils/soap"
import OptimizationModal from "../../components/optimizationModal";
import {grades as sample} from "../../utils/sample"


interface GradesProps {
	client: any;
	grades: Cache;
	setGrades: React.Dispatch<React.SetStateAction<Cache | undefined>>;
	mp: number;
	setMP: (period: number) => void;
	isMediumOrLarger:boolean;
	createError:(message:string)=>void;
	setTime:(time:number)=>void;
	timestamp:number;
	width:any;
	courseSettings:any;
	setCourseSettings:any;
	markingPeriod:number;
	setMarkingPeriod:(p:number)=>void;
	modalBg:boolean;
	setModalBg:(b:boolean)=>void;
	setSettingsModal:(b:boolean)=>void;
	settingsModal:boolean;
	schoolsList:SchoolsListType[]
	schoolIndex:number
	guestLogin:()=>void
}






/*
Inconsistencies:
the finals settings update live but the gradeScale settings only change after u hit save

the grades type shit should prob just also be stored in gradesCache, or at least moved into gradesCache when changes
are made


*/



export default function Grades({
	client,
	grades,
	setGrades,
	mp,
	setMP,
	isMediumOrLarger,
	createError,
	setTime,
	timestamp,
	width,markingPeriod,setMarkingPeriod,modalBg,setModalBg,settingsModal,setSettingsModal,schoolsList,schoolIndex,guestLogin
	
}: GradesProps) {
	const router = useRouter();
	const [index,setIndex] = useState(parseInt(String(router.query.index))); //you could've just parseInt'd it here but u didnt' and now i'm too lazy to refactor i hate u
	const course = grades?.[mp]?.courses[index];
	const [loading, setLoading] = useState(grades ? false : true);
	const [assignmentsModal, setAssignmentsModal] = useState(false);
	const [optimizationModal,setOptimizationModal] = useState(false)
	const [modalDetails, setModalDetails] = useState(0);
	const [isEditing, setIsEditing]=useState(false);
	const [title,setTitle]=useState(undefined);
	const assignmentTitle = useRef(null);
	const mcps=client?.district=="https://md-mcps-psv.edupoint.com/Service/PXPCommunication.asmx"




		
	const finalGrade=course != undefined ? calcFinal(course?.settings.finals.categories,grades) : undefined
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
	const semesterIndex=course?.settings.finals.semesters.findIndex(semester=>semester?.categories.some(category=>interimWiseComparison(category,{mp:mp})))
	const semesterGrade = (semesterIndex!=-1 && course!=undefined) ? calcFinal(course?.settings.finals.semesters[semesterIndex].categories,grades) : undefined
	
	useEffect(() => {
		try {
			if (!grades&&!client) {
				guestLogin()
										
				
		
			}
		} catch {
			if (localStorage.getItem("remember") === "false") {
				}
		}
	}, [client]);


	useEffect(()=>{
		const deleteLast=(event)=>{
			if (event.ctrlKey && event.key === "z") {
				event.preventDefault(); // Prevent default undo behavior if needed
				let temp=grades?.[mp]?.courses[index];
		

			if(temp.assignments[0].custom==true){
				del(0);
			}
		}
		}
		
		if(grades?.[mp]?.courses[index]?.assignments?.length>1){
			window.addEventListener("keydown", deleteLast);
		}
		return () => {
			window.removeEventListener("keydown", deleteLast);
		};

	},[grades])

	const updateGrade = (val: string, assignmentId: number, update: string) => {
		let tempCache=structuredClone(grades)
		let temp=tempCache?.[mp]
		temp.courses[index] = updateCourse(
			temp.courses[index],
			assignmentId,
			update,
			parseFloat(val)
		);

		const assignment = temp.courses[index].assignments[assignmentId]
//this was once simple, but now because of the way we operate accross MP's, we're maintaing parity between interims and standard MP's. or at least we're giving it a shot.
		var adjustedId 
	
		
		if(tempCache[mp].period.name.toLowerCase().includes("interim")&&mcps){
			adjustedId=tempCache[mp+1].courses[index].assignments.findIndex(ass=>ass.GradebookID==assignment.GradebookID)
			if(adjustedId!=-1){
			tempCache[mp+1].courses[index]=updateCourse(tempCache[mp+1].courses[index],adjustedId,update,parseFloat(val))
			}

		}else if(mcps&&Number(tempCache[0].periods[mp-1].date.end)>Date.now()){
			adjustedId=tempCache[mp-1].courses[index].assignments.findIndex(ass=>ass.GradebookID==assignment.GradebookID)
		
		if(adjustedId!=-1){
			tempCache[mp-1].courses[index]=updateCourse(tempCache[mp-1].courses[index],adjustedId,update,parseFloat(val))
		}
		}
		setGrades(tempCache);
		
	};

	const handleChange = (e) => setTitle(e.target.value);
	
	const handleTitleChange = () => {
		const newTitle =assignmentTitle.current.value=='' ? "New Assignment" : assignmentTitle.current.value
		let tempCache:Cache = structuredClone(grades);
		let temp = tempCache?.[mp]
		temp.courses[index].assignments[modalDetails].name=newTitle;
		setGrades(tempCache);
		
		setIsEditing(false);
	  };

	const add = () => {
		let tempCache = structuredClone(grades);
		let temp=tempCache?.[mp]
		temp.courses[index] = addAssignment(
			temp.courses[index]
		);

		const uuid=temp.courses[index].assignments.at(0).GradebookID

		if(tempCache[mp].period.name.toLowerCase().includes("interim")&&mcps){
			tempCache[mp+1].courses[index]=addAssignment(tempCache[mp+1].courses[index],uuid)
		}else if(mcps){
			if(Number(tempCache[0].periods[mp-1].date.end)>Date.now()){
			tempCache[mp-1].courses[index]=addAssignment(tempCache[mp-1].courses[index],uuid)}
		}
		setGrades(tempCache); //yeah that works too I guess. I like structuredClone better though. that way no mutations.
		
	};

	const del = (id: number) => {
		let tempCache = structuredClone(grades);
		const original=structuredClone(tempCache?.[mp].courses[index])
		let temp = tempCache?.[mp]
		const assignment=temp.courses[index].assignments[id]
		temp.courses[index] = delAssignment(
			temp.courses[index],
			id
		);
		//this was once simple, but now because of the way we operate accross MP's, we're maintaing parity between interims and standard MP's. or at least we're giving it a shot.
		let adjustedId;
		if(tempCache[mp].period.name.toLowerCase().includes("interim")&&mcps){
			adjustedId=tempCache[mp+1].courses[index].assignments.findIndex(ass=>ass.GradebookID==assignment.GradebookID)
		if(adjustedId!=-1){ //so if it's an assignment that ain't there in the future, ignore?
			tempCache[mp+1].courses[index]=delAssignment(tempCache[mp+1].courses[index],adjustedId)
			}
	}else if(mcps){
			adjustedId=tempCache[mp-1].courses[index].assignments.findIndex(ass=>ass.GradebookID==assignment.GradebookID)

		if(adjustedId=!-1){
			tempCache[mp-1].courses[index]=delAssignment(tempCache[mp-1].courses[index],adjustedId)
		}
		}
		setGrades(tempCache);
		
	};

	const updateCat = (val: string, assignmentId: number) => {
		let tempCache = structuredClone(grades)
		let temp = tempCache?.[mp]
		const assignment=temp.courses[index].assignments[assignmentId]
		temp.courses[index] = updateCategory(
			temp.courses[index],
			assignmentId,
			val
		);
//sigh
		var adjustedId;
		if(tempCache[mp].period.name.toLowerCase().includes("interim")&&mcps){

			adjustedId=tempCache[mp+1].courses[index].assignments.findIndex(ass=>ass.GradebookID==assignment.GradebookID)
		
			if(adjustedId==-1){return}
			tempCache[mp+1].courses[index]=updateCategory(tempCache[mp+1].courses[index],adjustedId,val)

		}else if(mcps&&Number(tempCache[0].periods[mp-1].date.end)>Date.now()){

			adjustedId=tempCache[mp-1].courses[index].assignments.findIndex(ass=>ass.GradebookID==assignment.GradebookID)
		
		if(adjustedId==-1){return}
			tempCache[mp-1].courses[index]=updateCategory(tempCache[mp-1].courses[index],adjustedId,val)
		}




		setGrades(tempCache);
		
	};

	const OpenModal = (assignmnetId: number) => {
		
		setModalDetails(assignmnetId);
		setTitle(course?.assignments[assignmnetId]?.name)
		setAssignmentsModal(true);setModalBg(true)
	};

	function update(p: number,getFresh=false){
		if(true){
			const m = structuredClone(grades)
			m[mp]=sample[mp]
			setGrades(m)
			return
		}
		
		
	};

	const editTitle=()=>{
		setIsEditing(true);
	}



	const handleFocus = () => {
		if(title=="New Assignment"){setTitle("")}}


	function toggleSettings(bool){
		setSettingsModal(bool);
		setModalBg(bool)
	}

	function toggleOptimization(bool){
		setOptimizationModal(bool);
		setModalBg(bool)
	}

	return (
		<>			{!loading && <>
			<ClientOnly><Modal show={assignmentsModal} onClose={() => {setAssignmentsModal(false);setModalBg(false)}} className={!isMediumOrLarger && `bg-transparent`}>
				<Modal.Header className="text-xl font-medium text-gray-900 dark:text-white">
					{ (isEditing ? (<input onFocus={handleFocus} className="border-none bg-transparent focus:outline-none focus:ring-0 p-0 text-xl font-medium" type="text" onChange={handleChange} ref={assignmentTitle} autoFocus onBlur={handleTitleChange} value={title}></input>) : (<p onClick={course?.assignments[modalDetails]?.custom ? editTitle : ()=>{}}>{title}</p>))
					}
				</Modal.Header>
				<Modal.Body>
						<div id="assignment-details">
							<p className="font-bold text-black dark:text-white">Grade</p>
							<p
							style={{color:course?.assignments[modalDetails]?.grade.color.includes('#') && course?.assignments[modalDetails]?.grade.color}}
								className={`text-base leading-relaxed` +  ` text-${course?.assignments[modalDetails]?.grade.color}-400`}
							>
								{course?.assignments[modalDetails]?.grade.letter}
								{!isNaN(course?.assignments[modalDetails]?.grade.raw) &&
									` (${course?.assignments[modalDetails]?.grade.raw}%)`}
							</p>
							<p className="font-bold text-black dark:text-white">Points</p>
							<p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
								{!isNaN(course?.assignments[modalDetails]?.points.earned)
									? course?.assignments[modalDetails]?.points.earned
									: "NG"}
								/{course?.assignments[modalDetails]?.points.possible}
							</p>
							<p className="font-bold text-black dark:text-white">Date Due</p>
							<p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
								{course?.assignments[
									modalDetails
								]?.date.due.toLocaleDateString()}							</p>
								{Boolean(course?.assignments[
									modalDetails
								]?.notes) && <>
								<p className="font-bold text-black dark:text-white">Notes</p>
							<p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
								{course?.assignments[
									modalDetails
								]?.notes}							</p></>}
							<p className="font-bold text-black dark:text-white">Category</p>
							<p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
								{course?.assignments[modalDetails]?.category}
							</p>
						</div>
				</Modal.Body>
				<Modal.Footer>
						<div className="flex gap-2">
							<button
								onClick={() => {setAssignmentsModal(false);setModalBg(false)}}
								className="rounded-lg bg-gray-500 px-2.5 py-2.5 text-center text-xs sm:text-sm font-medium text-white hover:bg-gray-600 focus:outline-none focus:ring-4 focus:ring-gray-300 dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-800"
							>
								Close
							</button>
							<button
								onClick={() => {
									del(modalDetails);
									setAssignmentsModal(false);
									setModalBg(false);
								}}
								className="rounded-lg bg-primary-500 px-2.5 py-2.5 text-center text-xs sm:text-sm font-medium text-white hover:bg-primary-600 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
							>
								<div className="flex gap-1 items-center">
									<HiOutlineTrash size={"1.2rem"} />
									Delete
								</div>
							</button>
						</div>

				</Modal.Footer>
			</Modal></ClientOnly>

			<ClientOnly><SettingsModal
				client={client}
				grades={grades}
				mp={mp}
				setGrades={setGrades}
				index={index}
				createError={createError}
				showModal={settingsModal}
				setShowModal={(bool)=>{setSettingsModal(bool);setModalBg(bool)}}
				isMediumOrLarger={isMediumOrLarger}
			/></ClientOnly>

			<ClientOnly><OptimizationModal
				createError={createError}
				cache={grades}
				mp={mp}
				index={index}
				setShowModal={(bool)=>{setOptimizationModal(bool);setModalBg(bool)}}
				showModal={optimizationModal}
				isMediumOrLarger={isMediumOrLarger}

			/></ClientOnly>
			</>
}


		<motion.div 
		className="p-5 md:p-10 flex-1 h-screen">
			<Head>
				<title>
					{course ? `${course?.name} - Grade Durian` : "Grade Durian"}
				</title>
			</Head>

			{loading ? (
				<div className="flex justify-center">
					<Spinner size="xl" color="warning" />
				</div>
			) : (
				<motion.div
					className="max-w-max"
					layout
					layoutId={`card-${course?.layoutID}`}
				>
					<motion.h1
						layoutId={`name-${course?.layoutID}`}
						layout
						className="flex flex-wrap justify-between text-xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1"
					>
						{course?.name}
							{!isMediumOrLarger && <BsGearWideConnected
								className="hover:text-gray-400 dark:hover:text-gray-400 text-gray-600  dark:text-gray-200"
								style={{alignSelf:"end"}}
								size={30}
								onClick={()=>toggleSettings(true)}
					
					/>}
					</motion.h1>
					<div
					className=""
			 
					>
				

						</div>


					<motion.p
						layoutId={`teacher-${course?.layoutID}`}
						layout
						className="text-md tracking-tight mb-2.5 text-gray-900 dark:text-white"
					>
						{course?.teacher.name}
					</motion.p>
					<motion.div
						layoutId={`grade-${course.layoutID}`}
						layout="preserve-aspect"
						className="text-xl md:text-xl mb-2.5 dark:text-white"
					>
						{course?.grade.letter}{" "}
						{!isNaN(course?.grade.raw) && `(${course?.grade.raw}%)`}
					</motion.div>
					<div className="mt-2.5 w-full bg-gray-200 rounded-full dark:bg-gray-700">
						<div
							className={ `bg-${course?.grade.color}-400 text-xs md:text-sm font-semibold text-left pl-2 p-0.5 leading-none rounded-full h-5 md:h-6`}
							style={{
								width: `${course?.grade.raw < 100 ? course?.grade.raw : 100}%`,backgroundColor:(course?.grade.color.includes("#") && `${course?.grade.color}`)
							}}
						>
							<p>Total</p>
						</div>
					</div>
					
												{
						course.settings.finals.show &&
						<div className="mt-2.5 mb-2.5 w-full bg-gray-200 rounded-full dark:bg-gray-700 relative">
						<div
							className={ `bg-${finalGrade.color}-400 text-xs md:text-sm font-semibold text-left pl-2 p-0.5 leading-none rounded-full h-5 md:h-6`}
							style={{
								width: `${finalGrade.raw < 100 ? finalGrade.raw  : 100}%`,backgroundColor:(finalGrade.color.includes("#") && `${finalGrade.color}`)
							}}
						>
									<p className="absolute">
									Final Grade ({!isNaN(finalGrade.raw) ? `${course.settings.rounding.percent ? (finalGrade.raw.toFixed(course.settings.rounding.percentPlaces)) : finalGrade.raw}%` : "N/A"})
								</p>
						</div>
					</div>}

						{semesterIndex!=-1
						 &&
						<div className="mt-2.5 mb-4 w-full bg-gray-200 rounded-full dark:bg-gray-700 relative">
						<div
							className={ `bg-${semesterGrade.color}-400 text-xs md:text-sm font-semibold text-left pl-2 p-0.5 leading-none rounded-full h-5 md:h-6`}
							style={{
								width: `${semesterGrade.raw < 100 ? semesterGrade.raw  : 100}%`,backgroundColor:(semesterGrade.color.includes("#") && `${semesterGrade.color}`)
							}}
						>
									<p className="absolute">
									Semester Grade ({!isNaN(semesterGrade.raw) ? `${course.settings.rounding.percent ? (semesterGrade.raw.toFixed(course.settings.rounding.percentPlaces)) : semesterGrade.raw}%` : "N/A"})
								</p>
						</div>
					</div>}

			
					{course?.categories.map(({ name, grade, points }, i) => (
						<div
							key={i}
							className="mt-2 md:mt-3 w-full bg-gray-200 rounded-full dark:bg-gray-700 relative"
						>
							<div

								className={`bg-${grade.color}-400` +  ` text-xs md:text-sm font-medium text-left pl-2 p-0.5 leading-none rounded-full h-4 md:h-6`}
								style={{ width: `${grade.raw < 100 ? grade.raw : 100}%`,backgroundColor:(grade.color.includes("#") && grade.color)}}
							>
								<p className="absolute">
									{name} ({!isNaN(grade.raw) ? `${grade.raw}%` : "N/A"}) -{" "}
									{Math.floor(points.earned*100)/100}/{Math.floor(points.possible*100)/100}
								</p>
							</div>
						</div>
					))}

					<div className="flex gap-2 mt-5 w-full">
						<button
							type="button"
							onClick={() => update(mp,true)}
							className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm p-2.5 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
						>
							<TbRefresh size={"1.3rem"} />
						</button>
						<select
							id="periods"
							value={mp}
							onChange={(e) => update(parseInt(e.target.value))}
							className="block w-full p-2 text-sm text-gray-900 bg-white rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
						>
							{grades?.[mp]?.periods.map((period) => (
								<option value={period.index} key={period.index}>
									{`${period.name} (${parseDate(period.date)})`}
								</option>
							))}
						</select>
						<button
							type="button"
							onClick={()=>toggleOptimization(true)}
							className=" bg-primary-500 border border-primary-500 focus:outline-none hover:bg-primary-600 focus:ring-4 focus:ring-primary-200 font-medium rounded-lg text-sm p-2.5 dark:bg-primary-600 text-white dark:hover:bg-primary-700 dark:focus:ring-primary-400"
						>
							<BsGraphUp size={"1.3rem"} />
						</button>
						<button
							type="button"
							onClick={add}
							className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm p-2.5 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
						>
							<HiOutlineDocumentAdd size={"1.3rem"} />
						</button>
					</div>
					<div className="m-5" />
					<div className="flex">
					<div className="mx-auto overflow-x-auto shadow-md rounded-lg border max-w-max border-gray-200 dark:border-gray-700">
						<table className="text-sm text-left text-gray-500 dark:text-gray-400">
							<thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
								<tr>
									<th scope="col" className="py-3 md:pl-6 text-center md:text-left">
										Date
									</th>
									<th scope="col" className="py-3 md:px-6 text-center md:text-left">
										Assignment
									</th>
									<th scope="col" className="py-3 md:px-6 pr-3 text-center md:text-left">
										Score
									</th>
									<th scope="col" className="py-3 md:px-6 pr-3">
										Category
									</th>
								</tr>
							</thead>
							<tbody>
								{(()=>{
									return(grades?.[mp].courses[index]?.assignments.map(
									({ name, date, grade, category, points, custom,included}, i) => {
										var trueIndex:number = i;
										return(
										<tr
											className={`bg-${
												i % 2 == 0 ? "white" : "gray-50"
											} border-b dark:bg-gray-${
												i % 2 == 0 ? 900 : 800
											} dark:border-gray-700`}
											key={i}
										>
											<td className="py-4 md:pl-6 pl-2 text-center md:text-left">
												{date.due.toLocaleDateString()}
											</td>
											<td
												className={`py-4 md:px-6 px-3 text-center ${Boolean(custom) && "text-primary-500"} ${!included && "text-[#4d462d]"} md:text-left hover:text-${included ? 'black' : 'gray'} dark:hover:text-${included ? "white" : "gray"} cursor-pointer`}
												onClick={() => OpenModal(trueIndex)}
											>
												{name}
											</td>
											<td className="py-4 md:px-6 pl-3 pr-2 text-center md:text-left">
												<div
													style={{color:included && (grade.color.includes('#') && grade.color)}}
													className={`flex items-center gap-2 ${included ? `text-${grade.color}-400` : 'text-[#4d462d]'}`}
												>
													<GradeField
														onChange={(e) =>
															updateGrade(e.target.value, trueIndex, "earned")
														}
														value={points.earned}
													/>
													<p className="">/</p>
													<GradeField
														onChange={(e) =>
															updateGrade(e.target.value, trueIndex, "possible")
														}
														value={points.possible}
													/>
												</div>
											</td>
											<td className="py-4 md:px-6 pr-1 text-center md:text-left">
												<CategoryField
													value={course?.categories.findIndex(
														(c) => category === c.name
													)}
													onChange={(e) => updateCat(e.target.value, trueIndex)}
													name={isMediumOrLarger ? category : abbreviate(category)}
												>
													{course?.categories.map((category, x) => (
														<option value={x} key={x}>
															{category.name}
														</option>
													))}
												</CategoryField>
											</td>
										</tr>
									)}
			))})()}
							</tbody>
						</table>
					</div>
					</div>
				</motion.div>
			)}
		</motion.div></>
	);
}
