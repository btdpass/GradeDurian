import { Gradebook } from "studentvue";


interface Assignment {
	name: string;
	custom?:boolean;
	included:boolean;
	notes:string;
	grade: {
		letter: string;
		raw: number;
		color: string;
	};
	points: {
		earned: number;
		possible: number;
	};
	date: {
		due: Date;
		assigned: Date;
	};
	category: string;
	GradebookID:string;
}

interface SchoolsListType{
		mp:number,
		cache:Grades[],
		name?:string
		gu:string|null
	}


interface Finals{
	show:boolean,
	categories:Category[],
	isSemester:boolean,
	semesters:{show:boolean,categories:Category[]}[]

}


interface Category{
		mp:number,
		courseIndex:number,
		weight:number,
		type:"exam"|"course"
			}




interface CourseSettings{
	rounding:{percent:boolean,percentPlaces:number,mark:boolean,markPlaces:number},letterScale:
	[string,[number,number],string?][],finals?:Finals,categories?:Course["categories"]
}


interface MetaAssignments{
	name:string,
	included:boolean,
	notes:string,
	category:string,
	GradebookID:string
}


interface GlobalSettings{
	rounding:{percent:boolean,percentPlaces:number,mark:boolean,markPlaces:number},letterScale:
	[string,[number,number],string?][],categories?:undefined // categories is to be implemented
}

type Settings = {
	mode:"mcps" | "other"
} & {
  default: CourseSettings;
} & {
  [key:string]:CourseSettings
};







interface Course {
	name: string;
	period: number;
	periods: number[];
	courseID:string;
	layoutID: number;
	room: string;
	weighted: boolean;
	identifier:string;
	settings:CourseSettings
	grade: {
		letter: string;
		raw: number;
		color: string;
	};
	teacher: {
		name: string;
		email: string;
	};
	categories: {
		name: string;
		weight: number;
		grade: {
			letter: string;
			raw: number;
			color: string;
		};
		points: {
			earned: number;
			possible: number;
		};
	}[];
	assignments: Assignment[];
}


//The ONLY case where an index returns undefined should be those such cases where the inital fetch
//returned undefined as to mean that THAT GRADE PERIOD HAS NOT ARRIVED YET

//this could be flawed if Synergy's error rate is too high
type Cache = Grades[]

interface Grades {
	courses: Course[];
	settings:Settings;
	gpa: number;
	wgpa: number;
	period: {
		name: string;
		index: number;
	};
	periods: {
		name: string;
		index: number;
		date:{start:Date,end:Date}
	}[];
}


function findCurrentPeriod([cache]:Grades[]){
	let dates=cache.periods.map(period=>period.date)
	const index = dates.findIndex((date,i)=>{
		if(Date.now()>=(new Date(date.start)).getTime()&&Date.now()<=(new Date(date.end)).getTime()){
			return true
		}
	})
	if(index==-1){return 0}
	else{
		return index
	}
}




function letterGradeColor(letterGrade: string,gradingScale:CourseSettings|false=false){


	


	try{
		if(gradingScale){
	const index=gradingScale.letterScale.findIndex(letter=>letter[0]==letterGrade)
	if(gradingScale.letterScale[index][2]!=undefined){return gradingScale.letterScale[index][2]}
	}


	
	if (letterGrade.includes("A")&&letterGrade!=="N/A") {
		return "green";
	} else if (letterGrade.includes("B")) {
		return "blue";
	} else if (letterGrade.includes("C")) {
		return "yellow";
	} else if (letterGrade.includes("D")) {
		return "orange";
	} else if (letterGrade.includes("E")||letterGrade.includes("F")) {
		return "red";
	} else {
		return "gray";
	}

}catch(error){return "gray"}
};

function letterGrade(grade: number,gradingScale:CourseSettings):string{

	//deprecating rounding unless someone complains chat
	
	const rounding=gradingScale.rounding;
if(rounding.percent){
	grade=Number(grade.toFixed(rounding.percentPlaces))

}

if(!gradingScale){
	if (grade >= 89.5) {
		return "A";
	} else if (grade >= 79.5) {
		return "B";
	} else if (grade >= 69.5) {
		return "C";
	} else if (grade >= 59.5) {
		return "D";
	} else if (!isNaN(grade)) {
		return "E";
	} else {
		return "N/A";
	}}
else{
	var highest:any=[null,[-Infinity,-Infinity]]
	for(let letter of gradingScale.letterScale){
		for(let i=0;i<2;i++){
			if(letter[1][i]>highest[1][i]){highest=letter}
		}
	}


	for(let letter of gradingScale.letterScale){
		if(grade>100){return highest[0]}
		if(grade>=letter[1][0]&&grade<=letter[1][1]){
			
			return letter[0]
		}
	}
	return "N/A"

}
};

const letterGPA = (letterGrade: string, weighted: boolean,double=false): number => {
	let gpa = 0;
	if (weighted) {
		gpa++;
	}
	if(letterGrade.includes("A")&&letterGrade!="N/A"){gpa+=4;}
	else if(letterGrade.includes("B")){gpa+=3;}
	else if(letterGrade.includes("C")){gpa+=2;}
	else if(letterGrade.includes("D")){gpa+=1;}
	else if(letterGrade.includes("E")||letterGrade.includes("F")){gpa+=0;}
	return(gpa);
};

const isWeighted = (name: string): boolean => {
	if (name.includes("AP")) return true;
	if (name.includes("Hon")) return true;
	if (name.includes("IB")) return true;
	if (name.includes("Mag")) return true;
	if (name.includes("Adv")) return true;
	else return false;
};

const isDouble=(name:string):boolean=>{
	if(name.includes("DP")){return true}else{return false}
}

//function to get rid of everything in parentheses in assignment names
const stripParens = (str: string): string => {
	let regex = /\(([^)]+)\)/g;
	return str.replace(regex, "");
};

const parsePoints = (points: string) => {
	let p = points.split("/").map(num=>parseFloat(num));
	if(p.length==1){
		return{
			grade:NaN,
			earned:NaN,
			possible:p[0]
		}
	}
	else if(p.length==2){
		p[0]=isNaN(p[0]) ? 0 : p[0];
		p[1]=isNaN(p[1]) ? 0 : p[1];
	return{
		grade:(p[0]/p[1])*100,
		earned:p[0],
		possible:p[1]
	}
}
	else throw new Error("Invalid points string")


};

const parseDate = ({ start, end }: { start: Date; end: Date }): string => {
	let startDate = new Date(start);
	let endDate = new Date(end);

	//days left to the due date
	let daysLeft = Math.ceil(
		(endDate.getTime() - new Date().getTime()) / 86400000
	);
	let daysToStart = Math.floor(
		(startDate.getTime() - new Date().getTime()) / 86400000
	);
	let daysAgo = Math.floor(
		(new Date().getTime() - endDate.getTime()) / 86400000
	);

	if (daysLeft > 0 && daysToStart <= 0) {
		return `ends in ${daysLeft} day${daysLeft > 1 ? "s" : ""}`;
	} else if (daysToStart > 0) {
		return `starts in ${daysToStart} day${daysToStart > 1 ? "s" : ""}`;
	} else if (daysAgo > 0) {
		return `ended ${daysAgo} day${daysAgo > 1 ? "s" : ""} ago`;
	} else if (daysAgo === 0) {
		return "ends today";
	}
};

const parseAssignmentName = (name: string): string => {
	return new DOMParser().parseFromString(
		new DOMParser().parseFromString(name, "text/html").documentElement
			.textContent,
		"text/html"
	).documentElement.textContent;
};







function simplifyWeights(categories:Category[]){
	categories=structuredClone(categories)
	const seen=[]
	const real=[]
	for(let category of categories){
		if(!seen.includes(""+category.mp+category.type)){
			seen.push(""+category.mp+category.type)
			real.push(category)
		}
	}
	categories=real



	let totalWeight:number=categories.reduce((a,b)=>(a+b.weight),0)
	for(let category of categories){
		category.weight=category.weight/totalWeight
	}
	
	return categories

}



function toggleSemester(norm:Settings["default"],settings:CourseSettings,cache:Cache,identifier:string){
	settings=structuredClone(settings)
	norm=structuredClone(norm)
	if(settings.finals.isSemester===false){
		settings.finals.isSemester=true;
		var activeSemester=settings.finals.semesters.findIndex(semester=>semester?.categories.some(category=>cache[category.mp].courses.some(course=>course.courseID.substring(0,course.courseID.length-1)==identifier)))
		let b = new Array(settings.finals.semesters.length)
		b[activeSemester]=settings.finals.semesters[activeSemester] 
		settings.finals.semesters=b
		settings.finals.semesters[activeSemester].show=true;
		settings.finals.show=false;
	}else{
		settings.finals.isSemester=false;
		settings.finals.show=true;
		settings.finals.semesters=norm.finals.semesters
	}
	return settings
}


function util(cache:Cache){
		const periods=cache[0].periods;
	for(let period of periods){
		if(Number(period.date.start)<=Date.now()&&Date.now()<=Number(period.date.end)){
			return period.index
		}
	}
	return -1
}

//this fills in an empty finals, like handles the NaN or null courseIndexes and allat.
function initalizeFinals2(cache:Cache,raw_settings:Settings,identifier:string,cmp=false):CourseSettings{
	//I high key do not remember how often this runs lmao

	var settings=structuredClone(raw_settings)
 
	/*
	const nowMP=cache[0].periods.at(util(cache))
	var interim;
	if(nowMP.name.toLocaleLowerCase().includes("interim")){
		interim=true
		var realMP=nowMP.index+1;
	}else{
		interim=false
	}
	*/

 
	//console.log("I want a perfect body",settings)

	if(false){
		//we let them control but also we FORCe them to control all my precious
		var id=Object.keys(settings)[Object.keys(settings).findIndex(key=>key.includes(identifier))]
		//we handle nothing actually. kys.


		return settings[id] || settings.defualt

	}
	else{
		

//it is KNOWN that categories will not be undefined cuz it'll be either set explicitly right here right now
		if(!settings[identifier]){settings[identifier]=settings.default;}

		
		//THIS ONLY MAKES SENSE TO KEEP IF it turns out we get ALLLLLL classes data at the start of the year
		//otherwise, no real way to know if a class is semester-long or not. bollocks. prob via the webapi
		//tho
		if(settings[identifier].finals?.isSemester==undefined){
			const realPeriods=getRealMarkingPeriods(cache[0].periods)
			var count=0;
			for(let realPeriod of realPeriods){
				if(cache[realPeriod.index].courses.findIndex(course=>course.courseID.substring(0,course.courseID.length-1)==identifier)!=-1){
					count++
				}
			}

			if(count==0){
				//this means it's either old-style settings, or they dropped the class, either way, just return
				return settings[identifier]
			}

			if(count<3){ //this is effectively a hard-coded, SEPERATE default for if it's a single-semester
				//class. we will not be allowing modification to this i guess. in manual we won't even try ig.
			//	console.log("less than 3")
				settings[identifier].finals.isSemester=false;
				settings[identifier]=toggleSemester(settings.default,settings[identifier],cache,identifier)
			//	console.log(settings[identifier])

			}
			else{
				settings[identifier].finals.isSemester=false;
			}
		}

		const categories=[]
		for(let category of settings[identifier].finals.categories){
		//	if(interim&&realMP==category.mp){category.mp=nowMP.index}

			if(Number.isNaN(category.courseIndex)||category.courseIndex==null){
				const index=cache[category.mp].courses.findIndex(c=>c.courseID.substring(0,c.courseID.length-1)==identifier) //the many to one idea would require a custom data structure that would store poorly in json so how about, no.
				category.courseIndex=index!=-1 ? index : NaN //gunna kms fr fr

			}
			categories.push(category)
		}
		settings[identifier].finals.categories=categories

		//mk so there's still the semester shit righhhhhhhht

		//sigh

		for(let semester of settings[identifier].finals.semesters){
			if(semester==undefined){continue}
					const categories=[]
			for(let category of semester.categories){
		//		if(interim&&realMP==category.mp){category.mp=nowMP.index}
				if(Number.isNaN(category.courseIndex)||category.courseIndex==null){
					const index=cache[category.mp].courses.findIndex(c=>c.courseID.substring(0,c.courseID.length-1)==identifier) //the many to one idea would require a custom data structure that would store poorly in json so how about, no.
					category.courseIndex=index!=-1 ? index : NaN //gunna kms fr fr

				}
				categories.push(category)
			}
			semester.categories=categories
		}

		//that oughta do it I guess. now for el manuel

		return {...settings[identifier]} //over ride manual hell yeah biatch

	}


}












function getRealMarkingPeriods(periods:Grades["periods"],isMCPS:boolean=true){
	let reals=[]
	if(isMCPS){
		for(let i=0;i<periods.length;i++){
			if(!periods[i].name.includes("Interim")){reals.push(periods[i])}
		}
	}
		
	else{
	for(let i=0;i<periods.length;i++){
		let flag=true
		for(let j=0;j<periods.length;j++){
			if(j==i){continue}
			if(periods[j].date.start<=periods[i].date.start&&periods[j].date.end>periods[i].date.end){
				flag=false
			}
		}
		if(flag){reals.push(periods[i])}
	}}

	return reals
}




function templateFinals(mode,periods):Finals{
      if(mode=="mcps"){
			let mps=getRealMarkingPeriods(periods).map(mp=>mp.index)
			let weight=1/mps.length
			let categories:Category[]=mps.map(mp=>({mp:mp,courseIndex:NaN,weight:weight,type:"course"}))
			
			return {show:false,categories:categories,isSemester:undefined,semesters:[{show:true,categories:mps.slice(0,mps.length/2).map(mp=>({mp:mp,courseIndex:NaN,weight:weight*2,type:"course"}))},{show:true,categories:mps.slice(mps.length/2).map(mp=>({mp:mp,courseIndex:NaN,weight:weight*2,type:"course"}))}]}
		}

	else{
		return {show:true,categories:[],isSemester:false,semesters:[]}
	}
  

}



function getCache(books:Gradebook[]):Cache{
	//pre parsing
	const settings=books[0].gradingScale

	//this is for setting the default entry for finals obj. eventually, this should be moved to the 
	//backend. but for now, since it changes so often in dev, we process it here.
	if(settings.mode==undefined){settings.mode="other"}

	const periods=books[0].reportingPeriod.available.map(({ name, index, date }) => ({
			name:name,
			date:date,
			index: index,
		}))

	if(!settings.default.finals){
	settings.default.finals=templateFinals(settings.mode,periods)}
	let gradesCache:Grades[]=books.map(book=>parseGrades(book,settings))

		


	/*this is essential. structural dust. unlesss we move away from having unsynced
	settings objects at the cache, grades, and courses level. all seperate. all fucking unsynced.
	like a fucking maniac. get it working first. then we myabe refactor.
	*/


	
		//basically this is the handling for if a course needs to have some settings set explicit but others 
	//remain at the default, it is thus essential whenever we be revamping type shit type shit type shit
	//type shit. 
	for(let key in settings){
		if(key=="default"||key=="mode"){continue}
		else{
			for(let prop in settings[key]){
				if(settings[key][prop]==false){
					settings[key][prop]=settings.default[prop] //fallback to default if a class's settings props are set to false
				}
			}
		}
		settings[key]=initalizeFinals2(gradesCache,settings,key)
	}


//this will ensure every course has a runtime settings obj in course.settings while only leaving 
//real swag players with one's in the top level settings objects
	for(let grades of gradesCache){
		grades.settings=settings
		for(let course of grades.courses as Course[]){
			const id = course.identifier
			if(settings[id]==undefined){
				course.settings=initalizeFinals2(gradesCache,settings,course.identifier)
				//this one is finna be special cause categories is unique in that it won't have a global
				//at least not until I look into supporting Gavin-like cases

				if(course.settings.categories){
			//		course.categories=course.settings.categories //maybe. eventually. for now. FUCK NO.
				}
		
			}
			else{
				course.settings=settings[id]
			}
		
		}
	}



return gradesCache
}



function specialSettingsThing(settings,course:Gradebook["courses"][number]){
	const identifier=settings.mode=="manual" ? (ReplaceUnderscores(stripParens(course.title))+course.period+course.staff.name) : course.courseID.substring(0,course.courseID.length-1)
	const courseSettings=settings[identifier] ? settings[identifier] : structuredClone(settings.default)
	//this is a dumb hotfix but we ARE not refactoring again. why i let some settings be global and finals not be global and now the default and reset system is fucked to hell. 
	if(!courseSettings.letterScale||!courseSettings.rounding){courseSettings.rounding=settings.default.rounding;courseSettings.letterScale=settings.default.letterScale}
	const places=courseSettings.rounding.percent===true ? courseSettings.rounding.percentPlaces : (courseSettings.rounding.percent===false ? false : 2)
	return courseSettings;		
}

const parseGrades = (grades: Gradebook,override?:Settings): Grades => {
	//@ts-ignore
	const settings:Settings=override ? override : grades.gradingScale;
	const decimalPlaces=settings?.default?.rounding.percent===true ? settings?.default.rounding.percentPlaces : (settings?.default?.rounding.percent===false ? false : 2)
	for (let i = 0; i < grades.courses.length; i++) {
		if (grades.courses[i].marks.length === 0) {
			grades.courses[i].marks = [
				{
					calculatedScore: { raw: NaN, string: "N/A" },
					weightedCategories: [],
					assignments: [],
					name: "",
				},
			];
		}
	}
	let parsedGrades:Grades = {
		settings:settings,
		gpa:
			grades.courses.reduce(
				(a, b) =>
					a +
					letterGPA(letterGrade(b.marks[0].calculatedScore.raw,specialSettingsThing(settings,b)), false),
				0
			) / grades.courses.length,
		wgpa:
			grades.courses.reduce(
				(a, b) =>
					a +
					letterGPA(
						letterGrade(b.marks[0].calculatedScore.raw, specialSettingsThing(settings,b)),
						isWeighted(b.title)
					),
				0
			) / grades.courses.length,


			courses: grades.courses.map(({ title, period, room, staff, marks,courseID, periodRaw }: any, i) => {
				if(courseID.at(-1)=="X"){courseID=courseID.substring(0,courseID.length-1)}
				let identifier= false ? (ReplaceUnderscores(stripParens(title))+period+staff.name) : courseID.substring(0,courseID.length-1)
				const courseSettings=settings[identifier] ? settings[identifier] : structuredClone(settings.default)
		//this is a dumb hotfix but we ARE not refactoring again. why i let some settings be global and finals not be global and now the default and reset system is fucked to hell. 
			if(!courseSettings.letterScale||!courseSettings.rounding){courseSettings.rounding=settings.default.rounding;courseSettings.letterScale=settings.default.letterScale}
			const places=courseSettings.rounding.percent===true ? courseSettings.rounding.percentPlaces : (courseSettings.rounding.percent===false ? false : 2)
			
	
			
			const parsedPeriods = periodRaw ? (String(periodRaw).match(/\d+/g)?.map(Number) ?? []) : [];
			const effectivePeriod = period || (parsedPeriods[0] ?? i + 1);
			return({
			name: ReplaceUnderscores(stripParens(title)),
			period: effectivePeriod,
			periods: parsedPeriods.length ? parsedPeriods : [effectivePeriod],
			layoutID:null,
			courseID:courseID,
			room: room,
			settings:courseSettings,
			identifier:identifier,
			weighted: isWeighted(title),
			grade: {
				letter: (marks[0].calculatedScore.string!=="N/A" ? letterGrade(marks[0].calculatedScore.raw,courseSettings) : "N/A"),
				raw: marks[0].calculatedScore.string!=="N/A" ? marks[0].calculatedScore.raw : NaN,
				color: marks[0].calculatedScore.string!=="N/A" ? letterGradeColor(letterGrade(marks[0].calculatedScore.raw,courseSettings),courseSettings) : letterGradeColor("N/A"),
			},
			teacher: {
				name: staff.name,
				email: staff.email,
			},
			categories: marks[0].weightedCategories.length
  ? marks[0].weightedCategories
      .map(({ type, weight, points }) => ({
        name: type,
        weight: parseFloat(weight.standard) / 100,
        grade: {
          letter: letterGrade((points.current / points.possible) * 100,courseSettings),
          raw:    places!==false ? parseFloat(
         ((points.current / points.possible) * 100).toFixed(places)
          ) :  ((points.current / points.possible) * 100),
          color: letterGradeColor(
            letterGrade((points.current / points.possible) * 100,courseSettings),courseSettings
          ),
        },
        points: {
          earned: points.current,
          possible: points.possible,
        },
      }))
      .filter((category) => !category.name.toLowerCase().includes("total"))
  : [
      {
        name: "Default5421",
        weight: 1, // assuming 100% weight   
        grade: {
          letter: (()=>{let pointsEarned=0;marks[0].assignments.forEach(({name,date,points,type,notes})=>{if(!isNaN(parsePoints(points).earned)&&notes!="(Not For Grading)"){pointsEarned+=parsePoints(points).earned}});let pointsP=0;marks[0].assignments.forEach(({name,date,points,type,notes})=>{if(!isNaN(parsePoints(points).earned)&&notes!="(Not For Grading)"){pointsP+=parsePoints(points).possible}});return(letterGrade((places!= false ? parseFloat(((pointsEarned/pointsP)*100).toFixed(places)) : (pointsEarned/pointsP)*100),courseSettings))})(), // or whatever default value you'd like
          raw: (()=>{let pointsEarned=0;marks[0].assignments.forEach(({name,date,points,type,notes})=>{if(!isNaN(parsePoints(points).earned)&&notes!="(Not For Grading)"){pointsEarned+=parsePoints(points).earned}});let pointsP=0;marks[0].assignments.forEach(({name,date,points,type,notes})=>{if(!isNaN(parsePoints(points).earned)&&notes!="(Not For Grading)"){pointsP+=parsePoints(points).possible}});return(places!= false ? parseFloat(((pointsEarned/pointsP)*100).toFixed(places)) : (pointsEarned/pointsP)*100)})(),
          color: (()=>{let pointsEarned=0;marks[0].assignments.forEach(({name,date,points,type,notes})=>{if(!isNaN(parsePoints(points).earned)&&notes!="(Not For Grading)"){pointsEarned+=parsePoints(points).earned}});let pointsP=0;marks[0].assignments.forEach(({name,date,points,type,notes})=>{if(!isNaN(parsePoints(points).earned)&&notes!="(Not For Grading)"){pointsP+=parsePoints(points).possible}});return(letterGradeColor(letterGrade((places!= false ? parseFloat(((pointsEarned/pointsP)*100).toFixed(places)) : (pointsEarned/pointsP)*100),courseSettings),courseSettings))})()
        },
        points: {
          earned: (()=>{let pointsE=0;marks[0].assignments.forEach(({name,date,points,type,notes})=>{if(!isNaN(parsePoints(points).earned)&&notes!="(Not For Grading)"){pointsE+=parsePoints(points).earned}});return(pointsE)})(),
          possible: (()=>{let pointsP=0;marks[0].assignments.forEach(({name,date,points,type,notes})=>{if(!isNaN(parsePoints(points).earned)&&notes!="(Not For Grading)"){pointsP+=parsePoints(points).possible}});return(pointsP)})(),
        },
      },
    ],

			assignments: marks[0].assignments.map(({ name, date, points, type,notes,gradebookId }) => ({
				included:notes!="(Not For Grading)",
				notes:notes,
				GradebookID:gradebookId,
				name: parseAssignmentName(name),
				grade: {
					letter:  letterGrade(parsePoints(points).grade,courseSettings), 
					raw: places!==false ? parseFloat(parsePoints(points).grade.toFixed(places)) : parsePoints(points).grade,
					color: notes!="(Not For Grading)" ? letterGradeColor(letterGrade(parsePoints(points).grade,courseSettings),courseSettings) : "mud" ,
				},
				points: {
					earned: parsePoints(points).earned,
					possible: parsePoints(points).possible,
				},
				date: {
					due: date.start,
					assigned: date.due,
				},
				category: marks[0].weightedCategories.length ? type : "Default5421",
			})),
		})}),
		period: {
			name: grades.reportingPeriod.current.name,
			index: grades.reportingPeriod.current.index,
		},
		periods: grades.reportingPeriod.available.map(({ name, index, date }) => ({
			name:name,
			date:date,
			index: index,
		})),
	};

	parsedGrades.courses.forEach((course:Course) => {
		if (course.categories[0].name!=="Default5421") {
			course.categories.forEach((category, i) => {
				course = calculateCategory(course, i);
			});
			calculateGrade(course);
		}
	});
	parsedGrades.courses.forEach((course:Course,index) => {
		course.layoutID=index;
	});


	
	return parsedGrades;
};


function ReplaceUnderscores(name:string){
	return name.replaceAll("_"," ")

}

let solutions = [];
const recur = (
	coeff: Array<number>,
	sols: Array<number>,
	remainingPoints: Array<number>,
	start: number,
	end: number,
	currentPoints: Array<number>,
	currentPossible: Array<number>,
	desired: number
): [number[], number][] => {
	let result = [];
	let newGrade = 0;

	for (let i = 0; i < currentPoints.length; i++) {
		newGrade +=
			((currentPoints[i] + sols[i]) /
				(currentPossible[i] + sols[i] + remainingPoints[i])) *
			coeff[i];
	}

	if (newGrade * 100 >= desired) {
		solutions.push([sols, newGrade * 100]);
		return [[sols, newGrade * 100]];
	} else {
		for (let i = start; i <= end; i++) {
			let temp = [...sols];
			temp[i] = temp[i] + 1;
			let temp2 = [...remainingPoints];
			if (temp2[i] >= 1) {
				temp2[i] -= 1;
				result.concat(
					recur(
						coeff,
						temp,
						temp2,
						i,
						end,
						currentPoints,
						currentPossible,
						desired
					)
				);
			}
		}
	}
	return result;
};

const genTable = (
	course: Course,
	desired: number,
	remaining: Array<number>
): [number[], number][] => {
	let n = course.categories.length;
	let current = course.grade.raw;
	let gradeBoost = desired - current;

	let weights: number[] = [];
	for (let i = 0; i < n; i++) {
		weights[i] = course.categories[i].weight;
	}
	solutions = [];

	let sols: number[] = [];
	let cur: number[] = [];
	let possible: number[] = [];

	for (let a = 0; a < n; a++) {
		sols[a] = 0;
		cur[a] = course.categories[a].points.earned;
		possible[a] = course.categories[a].points.possible;
	}

	let result = recur(
		weights,
		sols,
		remaining,
		0,
		n - 1,
		cur,
		possible,
		desired
	);

	return [...solutions];
};

const calculateCategory = (course: Course, categoryId: number): Course => {
	const gradingScale=course.settings;
	const places=gradingScale.rounding.percent===true ? gradingScale.rounding.percentPlaces : (gradingScale.rounding.percent===false ? false : 2)
	course.categories[categoryId].points.earned = course.assignments
		.filter(
			(assignment) =>
				assignment.category === course.categories[categoryId].name &&
				!isNaN(assignment.points.possible) &&
				!isNaN(assignment.points.earned) && assignment.included
		)
		.reduce((a, b) => a + b.points.earned, 0);


	course.categories[categoryId].points.possible = course.assignments
		.filter(
			(assignment) =>
				assignment.category === course.categories[categoryId].name &&
				!isNaN(assignment.points.possible) &&
				!isNaN(assignment.points.earned) &&
				assignment.included
		)
		.reduce((a, b) => a + b.points.possible, 0);
	course.categories[categoryId].grade.raw = places!==false ? parseFloat(
		(
			(course.categories[categoryId].points.earned /
				course.categories[categoryId].points.possible) *
			100
		).toFixed(places) 
	) : 	(
			(course.categories[categoryId].points.earned /
				course.categories[categoryId].points.possible) *
			100
		);
	course.categories[categoryId].grade.letter = letterGrade(
		course.categories[categoryId].grade.raw,gradingScale
	);
	course.categories[categoryId].grade.color = letterGradeColor(
		course.categories[categoryId].grade.letter,gradingScale
	);
	return course;
};



function reCalculateAll(grades:Grades,settings:Settings){
	grades.settings=settings;
	const copy=structuredClone(grades)
	
	return copy
	


}

function calculateGrade(course: Course): Course{
	const gradingScale=course.settings;
	const places=gradingScale.rounding.percent===true ? gradingScale.rounding.percentPlaces : (gradingScale.rounding.percent===false ? false : 2)
	let currWeight = 0;
	let trueCategories = course.categories.filter((c) => {
		if (!isNaN(c.grade.raw)) {
			currWeight += c.weight;
			return true;
		}
		return false;
	});
	course.grade.raw = places!==false ? parseFloat(
		trueCategories
			.reduce((a, b) => {
				return a + b.grade.raw * (b.weight / currWeight);
			}, 0)
			.toFixed(places)
	) :trueCategories
			.reduce((a, b) => {
				return a + b.grade.raw * (b.weight / currWeight);
			}, 0) ;

	if (trueCategories.length === 0) {
		course.grade.raw = NaN;
	}
	course.grade.letter = letterGrade(course.grade.raw,gradingScale);
	course.grade.color = letterGradeColor(course.grade.letter,gradingScale);
	return course;
};

const addAssignment = (course: Course,uuid=crypto.randomUUID()): Course => {
	course.assignments.unshift({
		name: "New Assignment",
		included:true,
		notes:"",
		custom:true,
		GradebookID:uuid,
		grade: {
			letter: "N/A",
			raw: NaN,
			color: "gray",
		},
		points: {
			earned: 0,
			possible: 0,
		},
		date: {
			due: new Date(),
			assigned: new Date(),
		},
		category: course.categories.length ? course.categories[0].name : "N/A",
	});
	return course;
};


const calculateGPA = (grades: Grades): Grades => {
	grades.gpa =
		grades.courses.reduce(
			(a, b) => a + letterGPA(letterGrade(b.grade.raw,b.settings), false),
			0
		) / grades.courses.length;
	grades.wgpa =
		grades.courses.reduce(
			(a, b) => a + letterGPA(letterGrade(b.grade.raw,b.settings), b.weighted),
			0
		) / grades.courses.length;

	return { ...grades };
};

const updateGPA = (grades: Grades, i: number, val: boolean): Grades => {
	grades.courses[i].weighted = val;
	grades = calculateGPA(grades);

	return { ...grades };
};



const delAssignment = (course: Course, assignmentId: number): Course => {
	course.assignments.splice(assignmentId, 1);
	course.categories.forEach((category, i) => {
		course = calculateCategory(course, i);
	});
	course = calculateGrade(course);
	return course;
};

const updateCategory = (
	course: Course,
	assignmentId: number,
	val: string
): Course => {
	course.assignments[assignmentId].category = course.categories[val].name;
	course.categories.forEach((category, i) => {
		course = calculateCategory(course, i);
	});
	course = calculateGrade(course);
	return course;
};

const updateCourse = (
	course: Course,
	assignmentId: number,
	update: string,
	val: number
): Course => {
	if(!course.assignments[assignmentId].included){return course;}
	if (update === "earned") {
		if (val < 0) val = 0;
		course.assignments[assignmentId].points.earned = val;
	} else if (update === "possible") {
		if (val < 0) val = 0;
		course.assignments[assignmentId].points.possible = val;
	}
	let categoryId = course.categories.findIndex(
		(category) => category.name === course.assignments[assignmentId].category
	);

		const gradingScale=course.settings;
	const places=gradingScale.rounding.percent===true ? gradingScale.rounding.percentPlaces : (gradingScale.rounding.percent===false ? false : 2)
	//update assignment grade
	course.assignments[assignmentId].grade.raw = places!==false ? parseFloat(
		(
			(course.assignments[assignmentId].points.earned /
				course.assignments[assignmentId].points.possible) *
			100
		).toFixed(places)
	) : (
			(course.assignments[assignmentId].points.earned /
				course.assignments[assignmentId].points.possible) *
			100
		);
	course.assignments[assignmentId].grade.letter = letterGrade(
		course.assignments[assignmentId].grade.raw,course.settings
	);
	course.assignments[assignmentId].grade.color = letterGradeColor(
		course.assignments[assignmentId].grade.letter,course.settings
	);

	//update category grade
	course = calculateCategory(course, categoryId);

	//update whole course grade
	course = calculateGrade(course);
	return course;
};


function reCalculateCourse(course:Course){
 
	for(let assignment of course.assignments){
		assignment.grade.letter=letterGrade(assignment.grade.raw,course.settings)
		assignment.grade.color=letterGradeColor(assignment.grade.letter,course.settings)
	}
	for(let i=0;i<course.categories.length;i++){
		course=calculateCategory(course,i)
	}

	course=calculateGrade(course)
	return course
}

function abbreviate(category) {
    category = category.toUpperCase();
    var separator;

    if (category.includes(" ")) {
        separator = " ";
    } else if (category.includes("/")) {
        separator = "/";
    } else {
        // Remove vowels only if they are not the first character in the string
        ["A", "E", "I", "O", "U"].forEach((vowel) => {
            category = category.replaceAll(
                new RegExp(`(?<!^)${vowel}`, 'g'),
                ""
            );
        });
        return category;
    }
    const words = category.split(separator).filter((word) => word !== "/" && word !== " ");
    return (words[0].trim()[0] + words[1].trim()[0]);
}


function calcFinal(categories:Category[],cache:Cache):{letter:string,color:string,raw:number}{
	   
                let realCat=[]
				let currPoints=0
				let currWeight=0
				 for(let category of categories){
					if(category.type=="exam"){
						//@ts-ignore
						if(category.grade){ //lazily implementing cuz the fcps ppl haven't complained
							currPoints+=(category as any).grade.raw*category.weight
							currWeight+=category.weight
						}
					}
					else{
						//@ts-ignore
					if((isNaN(category.courseIndex)||category.courseIndex==null)&&!category.grade){
						continue
					}
					//@ts-ignore
					const grade=category.grade ? category.grade : cache[category.mp].courses[category.courseIndex].grade
					const mcps=cache[0].settings.mode=="mcps"
                    //@ts-ignore
					if(!Number.isNaN(grade.raw)){
                    realCat.push(category);
					const zz=mcps ? Math.round(grade.raw) : grade.raw
					currPoints+=zz*category.weight
					currWeight+=category.weight
 
                    }}
                }
					if(realCat.length==0){return {raw:NaN,letter:"N/A",color:"gray"}}
					const grade ={raw:cache[realCat[0].mp].courses[realCat[0].courseIndex].settings.rounding.percentPlaces ? parseFloat((currPoints/currWeight).toFixed(cache[realCat[0].mp].courses[realCat[0].courseIndex].settings.rounding.percentPlaces)) : currPoints/currWeight,
					letter:letterGrade(currPoints/currWeight,cache[realCat[0].mp].courses[realCat[0].courseIndex].settings),
					color:letterGradeColor(letterGrade(currPoints/currWeight,cache[realCat[0].mp].courses[realCat[0].courseIndex].settings),cache[realCat[0].mp].courses[realCat[0].courseIndex].settings)}

				return grade
            }

type SolveSystemParams = {
  A: number[][];         // m x n matrix
  targets: number[];     // length m
  knowns?: number[];     // optional per-equation offsets (length m), default 0
  decimalPlaces: number; // e.g., 2
  min?: number;          // default 0
  max?: number;          // default 100
  evennessBias?: number; // small tie-break nudger, default 0.15 (0..0.3 reasonable)
};

function solveSystemMinSum(params: SolveSystemParams): number[] | null {
  let { A, targets, knowns, decimalPlaces } = params;
  if (Number.isNaN(decimalPlaces as any) || decimalPlaces == null) decimalPlaces = 4;

  const min = params.min ?? 0;
  const max = params.max ?? 100;
  const evennessBias = params.evennessBias ?? 0.15; // lower => less spreading, higher => more

  const m = A.length;
  if (m === 0) return null;
  const n = A[0].length;

  const precision = 10 ** decimalPlaces!;
  const step = 1 / precision;
  const halfUlp = 0.5 / precision;
  const range = Math.max(step, max - min);

  // ---------- helpers ----------
  const roundGrid = (v: number) => Math.round(v * precision) / precision;
  const clamp = (v: number) => Math.max(min, Math.min(max, v));
  const eqDec = (a: number, b: number) => Math.abs(a - b) <= halfUlp;

  // effective RHS after subtracting knowns (if any), snapped to grid
  const g = targets.map((t, i) => roundGrid(t - (knowns?.[i] ?? 0)));

  function Ax(x: number[]): number[] {
    const y = new Array(m).fill(0);
    for (let i = 0; i < m; i++) {
      let s = 0;
      const row = A[i];
      for (let j = 0; j < n; j++) s += row[j] * x[j];
      y[i] = roundGrid(s);
    }
    return y;
  }
  const allEq = (y: number[], rhs: number[]) => y.every((v, i) => eqDec(v, rhs[i]));
  const allGe = (y: number[], rhs: number[]) => y.every((v, i) => v + halfUlp >= rhs[i]);

  // ---------- tiny linear algebra (n ≤ ~8) ----------
  function matT(M: number[][]): number[][] {
    const r = M.length, c = M[0].length;
    const T = Array.from({ length: c }, () => Array(r).fill(0));
    for (let i = 0; i < r; i++) for (let j = 0; j < c; j++) T[j][i] = M[i][j];
    return T;
  }
  function matMul(L: number[][], R: number[][]): number[][] {
    const r = L.length, k = R.length, c = R[0].length;
    const M = Array.from({ length: r }, () => Array(c).fill(0));
    for (let i = 0; i < r; i++) {
      for (let kk = 0; kk < k; kk++) {
        const lik = L[i][kk];
        if (lik === 0) continue;
        for (let j = 0; j < c; j++) M[i][j] += lik * R[kk][j];
      }
    }
    return M;
  }
  function matVec(L: number[][], v: number[]): number[] {
    const r = L.length, k = L[0].length;
    const out = new Array(r).fill(0);
    for (let i = 0; i < r; i++) {
      let s = 0;
      for (let j = 0; j < k; j++) s += L[i][j] * v[j];
      out[i] = s;
    }
    return out;
  }
  // Solve small dense linear system M x = b (Gaussian elimination with partial pivoting)
  function solveLinear(Min: number[][], bIn: number[]): number[] | null {
    const n2 = Min.length;
    const M = Min.map(r => r.slice());
    const b = bIn.slice();
    for (let i = 0; i < n2; i++) {
      let p = i;
      for (let r = i + 1; r < n2; r++) if (Math.abs(M[r][i]) > Math.abs(M[p][i])) p = r;
      if (Math.abs(M[p][i]) < 1e-12) return null; // singular / ill-conditioned
      if (p !== i) { [M[i], M[p]] = [M[p], M[i]]; const tb = b[i]; b[i] = b[p]; b[p] = tb; }
      const piv = M[i][i];
      for (let r = i + 1; r < n2; r++) {
        const f = M[r][i] / piv;
        if (!isFinite(f) || Math.abs(f) < 1e-18) continue;
        for (let c = i; c < n2; c++) M[r][c] -= f * M[i][c];
        b[r] -= f * b[i];
      }
    }
    const x = new Array(n2).fill(0);
    for (let i = n2 - 1; i >= 0; i--) {
      let s = b[i];
      for (let c = i + 1; c < n2; c++) s -= M[i][c] * x[c];
      x[i] = s / M[i][i];
    }
    return x;
  }

  // ---------- Phase 1: exact-first (grid) ----------
  // Try continuous LS (normal equations) then search ±1 step neighborhood around snapped solution.
  const AT = matT(A);
  const ATA = matMul(AT, A);
  const ATg = matVec(AT, g);
  const xCont = solveLinear(ATA, ATg);

  if (xCont) {
    const x0 = xCont.map(v => clamp(roundGrid(v)));
    // 3^n candidates (±1 step neighborhood) — fine for n ≤ 8
    const deltas = [-1, 0, 1];
    let bestExact: number[] | null = null;
    let bestSum = Infinity;

    const cur = new Array(n).fill(0);
    const dfs = (idx: number) => {
      if (idx === n) {
        const y = Ax(cur);
        if (allEq(y, g)) {
          const sum = cur.reduce((a, v) => a + v, 0);
          if (sum < bestSum) { bestSum = sum; bestExact = cur.slice(); }
        }
        return;
      }
      for (const d of deltas) {
        const v = clamp(roundGrid(x0[idx] + d * step));
        cur[idx] = v;
        dfs(idx + 1);
      }
    };
    dfs(0);

    if (bestExact) return bestExact;
  }

  // ---------- Phase 2: overshoot with minimal Σx ----------
  // Feasibility builder: Ax >= g (component-wise)
  let x = new Array(n).fill(min);
  let y = Ax(x);

  function stepsNeededForVar(j: number, yCur: number[]): number | null {
    let needed = 0;
    let helpful = false;
    for (let i = 0; i < m; i++) {
      const deficit = g[i] - yCur[i];
      if (deficit <= 0) continue;
      const c = A[i][j];
      if (c <= 0) continue; // cannot help row i
      helpful = true;
      const perStep = c * step;
      const req = Math.ceil(deficit / perStep - 1e-12);
      if (req > needed) needed = req;
    }
    if (!helpful) return null;
    const roomSteps = Math.floor((max - x[j]) * precision + 1e-9);
    if (roomSteps <= 0) return null;
    return Math.min(needed, roomSteps);
  }

  // Build feasibility with evenness-aware tie breaks
  {
    let iter = 0, maxIters = 50000;
    while (!allGe(y, g) && iter++ < maxIters) {
      let bestJ = -1;
      let bestSteps: number | null = null;
      let bestScore = Infinity;
      let bestTieX = Infinity;
      let bestTieProj = Infinity;

      for (let j = 0; j < n; j++) {
        const s = stepsNeededForVar(j, y);
        if (s == null) continue;
        const proj = clamp(roundGrid(x[j] + s * step));
        // Main criterion: fewest steps; tie-breaks push toward smaller/current x (spread)
        const score = s + evennessBias * (x[j] - min) / range;
        if (
          bestSteps == null || s < bestSteps ||
          (s === bestSteps && (
            score < bestScore ||
            (score === bestScore && (x[j] < bestTieX ||
             (x[j] === bestTieX && proj < bestTieProj)))
          ))
        ) {
          bestSteps = s;
          bestJ = j;
          bestScore = score;
          bestTieX = x[j];
          bestTieProj = proj;
        }
      }

      if (bestJ === -1 || bestSteps == null) return null; // infeasible overshoot
      x[bestJ] = clamp(roundGrid(x[bestJ] + bestSteps * step));
      y = Ax(x);
    }
    if (!allGe(y, g)) return null; // safety
  }

  // Shrink pass: greedily lower Σx while keeping Ax >= g
  {
    let improved = true;
    let guard = 0, maxGuard = 10000;
    while (improved && guard++ < maxGuard) {
      improved = false;
      for (let j = 0; j < n; j++) {
        if (x[j] <= min) continue;
        const newX = roundGrid(x[j] - step);
        if (newX < min) continue;
        const old = x[j];
        x[j] = newX;
        const y2 = Ax(x);
        if (allGe(y2, g)) {
          y = y2;
          improved = true; // Σx strictly smaller
        } else {
          x[j] = old; // revert
        }
      }
    }
  }

  // ---------- Multi-receiver, multi-step redistribution (preserve Σx; reduce peak) ----------
  {
    let tries = 0, maxTries = 4000;
    while (tries++ < maxTries) {
      // pick tallest variable
      let jMax = 0;
      for (let j = 1; j < n; j++) if (x[j] > x[jMax]) jMax = j;
      if (x[jMax] <= min) break;

      const donorSteps = Math.floor((x[jMax] - min) * precision + 1e-9);
      if (donorSteps <= 0) break;

      let lowered = false;

      // try moving t steps from tallest to others; largest t first is fine,
      // but 1..donorSteps works and is easier to reason about
      for (let t = 1; t <= donorSteps; t++) {
        const xTrial = x.slice();
        xTrial[jMax] = clamp(roundGrid(xTrial[jMax] - t * step));
        let yTrial = Ax(xTrial);

        // quick feasibility check after removing t steps
        let deficits = new Array(m).fill(0);
        let totalDef = 0;
        for (let i = 0; i < m; i++) {
          const d = g[i] - yTrial[i];
          const di = d > 0 ? d : 0;
          deficits[i] = di;
          totalDef += di;
        }

        if (totalDef <= halfUlp && allGe(yTrial, g)) {
          // already feasible; sum is preserved (we'll add 0 steps elsewhere)
          x = xTrial; y = yTrial; lowered = true; break;
        }

        // We have exactly t grid-steps to reallocate among receivers (Σx preserved).
        let budget = t;

        // marginal lift for giving +1 step to k on currently violated rows
        const liftScore = (k: number, def: number[]) => {
          let s = 0;
          for (let i = 0; i < m; i++) {
            if (def[i] > halfUlp) {
              const c = A[i][k];
              if (c > 0) s += c;
            }
          }
          return s;
        };

        // distribute budget greedily
        while (budget > 0 && totalDef > halfUlp) {
          let bestK = -1;
          let bestScore = -Infinity;

          for (let k = 0; k < n; k++) {
            if (k === jMax) continue;
            if (xTrial[k] + step > max + 1e-12) continue;
            const score = liftScore(k, deficits);
            // tie-break: prefer smaller current x to flatten
            if (
              score > bestScore ||
              (score === bestScore && xTrial[k] < (bestK === -1 ? Infinity : xTrial[bestK]))
            ) {
              bestScore = score; bestK = k;
            }
          }

          if (bestK === -1 || bestScore <= 0) break;

          xTrial[bestK] = clamp(roundGrid(xTrial[bestK] + step));
          yTrial = Ax(xTrial);

          // recompute deficits
          totalDef = 0;
          for (let i = 0; i < m; i++) {
            const di = g[i] - yTrial[i];
            deficits[i] = di > 0 ? di : 0;
            totalDef += deficits[i];
          }
          budget -= 1;
        }

        // accept if feasible and Σx preserved
        if (totalDef <= halfUlp && allGe(yTrial, g)) {
          const sum0 = x.reduce((a, v) => a + v, 0);
          const sum1 = xTrial.reduce((a, v) => a + v, 0);
          if (Math.abs(sum1 - sum0) <= 1e-9) {
            x = xTrial; y = yTrial; lowered = true; break;
          }
        }
      }

      if (!lowered) break; // cannot lower peak further without breaking Σx or feasibility
    }
  }

  return x;
}


function ordinalSuffix(n: number): string {
	const s = ["th", "st", "nd", "rd"];
	const v = n % 100;
	return n + (s[(v - 20) % 10] || s[v] || s[0]);
}



export {
	parseGrades,
	updateCourse,
	ordinalSuffix,
	solveSystemMinSum,
	addAssignment,
	delAssignment,
	updateCategory,
	parseDate,
	templateFinals,
	genTable,
	calcFinal,
	toggleSemester,
	findCurrentPeriod,
	calculateGPA,
	updateGPA,
	abbreviate,
	reCalculateCourse,reCalculateAll,letterGradeColor,letterGrade,getCache,simplifyWeights,initalizeFinals2
};
export type { Category, SchoolsListType,Grades, Assignment, Course,Settings,Cache,CourseSettings,GlobalSettings,Finals,SolveSystemParams};