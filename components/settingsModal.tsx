import React,{useState,useEffect,useRef} from "react";
import { applyPalette, DEFAULT_PRIMARY } from "../utils/colorPalette";
import { processLogoUpload } from "../utils/imageUtils";
import type { Theme } from "../pages/_app";
import { Filter as BadWordsFilter } from "bad-words";

const profanityFilter = new BadWordsFilter();
import {Modal} from "flowbite-react"
import { HiOutlineTrash,HiArrowCircleRight,HiArrowCircleLeft, HiArrowCircleDown, HiPencil } from "react-icons/hi";
import { reCalculateAll,parseGrades,letterGradeColor, reCalculateCourse, toggleSemester, ordinalSuffix, Course} from "../utils/grades";
import {colorShit} from "./colors"
import {Settings,Grades,parseDate,Cache,CourseSettings,templateFinals,GlobalSettings,simplifyWeights,initalizeFinals2,Finals} from "../utils/grades"
import GradeField from "./GradeField";
import StudentVue from "studentvue";
import { AnimatePresence,motion } from "framer-motion";


interface props{
  client:Awaited<ReturnType<typeof StudentVue.login>>["client"]
  index:number;
  showModal:boolean;
  setShowModal:(boolean:boolean)=>void;
  grades:Cache;
  setGrades:(grades:Cache)=>void;
  createError:(message:string)=>void;
  mp:number
  finals?:any;
  setFinals?:any;
  isMediumOrLarger:boolean;
  showCountdown:boolean;
  setShowCountdown:(v:boolean)=>void;
  highlightColor:string|null;
  setHighlightColor:(v:string|null)=>void;
  siteTitle:string;
  setSiteTitle:(v:string)=>void;
  customLogo:string;
  setCustomLogo:(v:string)=>void;
  originalGradingScale:any;
  onColorPreview?: (hex: string, ignoreCustomLogo?: boolean, overrideLogo?: string) => void;
  themes?: Theme[];
  setThemes?: (t: Theme[]) => void;
  applyTheme?: (t: Theme) => void;
}






const PRESET_THEMES_FALLBACK: Theme[] = [
  { id: 'durian', name: 'Durian', primaryColor: DEFAULT_PRIMARY, siteTitle: 'Grade Durian', customLogo: '', active: true, preset: true },
  { id: 'melon', name: 'Melon', primaryColor: '#f43f5e', siteTitle: 'Grade Melon', customLogo: '', active: false, preset: true },
];

export default function SettingsModal({client,index,showModal,setShowModal,grades,setGrades,createError,mp:period,isMediumOrLarger,showCountdown,setShowCountdown,highlightColor,setHighlightColor,siteTitle,setSiteTitle,customLogo,setCustomLogo,originalGradingScale,onColorPreview,themes,setThemes,applyTheme}:props){
          const settings= grades?.[0]?.settings
  const course = index==-1 ? {courseID:"default",settings:settings.default,name:"",identifier:"default"} : grades?.[period]?.courses[index];
        const courseSettings=course.settings
  const [letterScale,setLetterScale]=useState<CourseSettings["letterScale"]>(index!=-1 ? (grades?.[period]?.courses[index].settings?.letterScale || undefined) : settings.default.letterScale)
        const [rounding,setRounding]=useState<CourseSettings["rounding"]>(index!=-1 ? (grades?.[period]?.courses[index].settings?.rounding || undefined) : settings.default.rounding)
        const [active,setActive]=useState<[string,string]>(['',''])
        const [advancedOpen,setAdvancedOpen]=useState(false)
        const [decimalPlaces,setDecimalPlaces]=useState(undefined)
        const [finals,setFinals]=useState<Finals>(course.settings.finals)
        const [modify,setModify]=useState(false)
        const [kill,setKill]=useState([undefined,undefined])
        const mcps=client?.district=="https://md-mcps-psv.edupoint.com/Service/PXPCommunication.asmx"
        //new stack based view version
        const [viewStack,setViewStack] = useState(["home"])
        const [pendingShowCountdown, setPendingShowCountdown] = useState(showCountdown)
        const [pendingHighlightColor, setPendingHighlightColor] = useState<string | null>((settings as any).highlightColor ?? null)
        const [pendingThemes, setPendingThemes] = useState<Theme[]>(() => structuredClone(themes || PRESET_THEMES_FALLBACK))
        const [themeEditorData, setThemeEditorData] = useState<{name:string, primaryColor:string, siteTitle:string, customLogo:string}>({name:'', primaryColor: DEFAULT_PRIMARY, siteTitle:'', customLogo:''})
        const [themeEditorMode, setThemeEditorMode] = useState<'add'|'edit'>('add')
        const [editingThemeId, setEditingThemeId] = useState<string|null>(null)
        const originalDefault = useRef(structuredClone(settings.default))
        const titleInputRef = useRef<HTMLInputElement>(null)
        const logoInputRef = useRef<HTMLInputElement>(null)
        const [colorOpen, setColorOpen] = useState(false)
        const [deleteConfirm, setDeleteConfirm] = useState<{name:string, onConfirm:()=>void}|null>(null)

        const [titleOpen, setTitleOpen] = useState(false)
        //const [customLogo, setCustomLogo] = useState<string>("")
        const currentView=viewStack.at(-1)


        const animationPropsHome = {
          initial: { x: "100%", opacity: 0 },
          animate: { x: 0, opacity: 1 },
          exit: { x: "-100%", opacity: 0 },
          transition: { duration: 0.15 },
        };

        const animationPropsPage=animationPropsHome //for now

        // settingsModal.tsx inside SettingsModal component

        // const handleCancelAndReset = () => {
        //     const savedSettings = (grades?.[0]?.settings as any) || {};
        //     const savedColor = savedSettings.primaryColor || DEFAULT_PRIMARY;
        //     const savedTitle = savedSettings.siteTitle || "Grade Durian";
        //     const savedLogo = savedSettings.customLogo || "";

        //     // 1. Revert local modal state
        //     setPendingPrimaryColor(savedColor);
        //     setPendingSiteTitle(savedTitle);
        //     setCustomLogo(savedLogo);
            
        //     // 2. Revert App-level live previews
        //     setSiteTitle(savedTitle);
        //     onColorPreview?.(savedColor); // applyColor in _app will handle logo reversion
            
        //     // 3. Reset inputs
        //     if (logoInputRef.current) logoInputRef.current.value = "";
            
        //     // 4. Close
        //     setShowModal(false);
        //     setViewStack(["home"]);
        // };
        // const handleCancelAndReset = () => {
        //   const savedSettings = (grades?.[0]?.settings as any) || {};
        //   const savedColor = savedSettings.primaryColor || DEFAULT_PRIMARY;
        //   const savedTitle = savedSettings.siteTitle || "Grade Durian";
        //   const savedLogo = savedSettings.customLogo || "";

        //   // 1. Revert local modal state
        //   setPendingPrimaryColor(savedColor);
        //   setPendingSiteTitle(savedTitle);
        //   setCustomLogo(savedLogo);
          
        //   // 2. Revert App-level live previews
        //   setSiteTitle(savedTitle);
          
        //   // FIX: Pass the savedLogo directly so the app snaps back immediately
        //   // Arguments: (color, ignoreState, logoOverride)
        //   onColorPreview?.(String(savedColor), false, String(savedLogo));
          
        //   // 3. Reset inputs
        //   if (logoInputRef.current) logoInputRef.current.value = "";
          
        //   // 4. Close
        //   setShowModal(false);
        //   setViewStack(["home"]);
        // };
        // settingsModal.tsx

        const handleCancelAndReset = () => {
            const savedActiveTheme = (themes || PRESET_THEMES_FALLBACK).find(t => t.active) || (themes || PRESET_THEMES_FALLBACK)[0];
            if (savedActiveTheme) applyTheme?.(savedActiveTheme);
            setPendingThemes(structuredClone(themes || PRESET_THEMES_FALLBACK));
            setShowModal(false);
            setViewStack(["home"]);
        };
        const previewTimeout = useRef<NodeJS.Timeout | null>(null);



useEffect(() => {
  document.body.style.overflow = showModal ? 'hidden' : '';
  return () => { document.body.style.overflow = ''; };
}, [showModal]);

useEffect(()=>{
  if(!showModal) return;
  originalDefault.current = structuredClone(settings.default)
  setPendingShowCountdown(showCountdown)
  setPendingHighlightColor((settings as any).highlightColor ?? null)
  setPendingThemes(structuredClone(themes || PRESET_THEMES_FALLBACK))
  setLetterScale(index!=-1 ? (grades?.[period]?.courses[index].settings?.letterScale || undefined) : settings.default.letterScale)
  setRounding(index!=-1 ? (grades?.[period]?.courses[index].settings?.rounding || undefined) : settings.default.rounding)
  setFinals(course.settings.finals)
  setViewStack(["home"])

// eslint-disable-next-line react-hooks/exhaustive-deps
},[period, showModal])



/*
yet to implement:
  semester grades support

  absoltely nothing right now for supporitng optimization, the MOST
  important and MOST useful feature is right now left hanging to dry



  Users will CRAVE a way to quickly and easily check this shit. optimizaiton modal 
  needs a HUGE overhaul. We gotta FINISH this settings shit up. UI doesn't need to be compltely perfect, tho 
  i've basically done most of that already tho. 

  then we go STRAIGHT to brainstorming this whole 
  sudo optimization, secondary grades page for full final type shit tpye thing, viewing it all
  all over

  all over at once. everwhere. everywhere all the time. all at once. forever. everywhere.


  we'll want to 


*/


function mutate(e,letter,bound){
    setLetterScale((prev)=>{
        let temp=structuredClone(prev)
        temp[letter][bound]=(e.target.value)
        return temp
    })
}

//lazy
function mutate2(e,letter,bound){
    setLetterScale((prev)=>{
        let temp=structuredClone(prev)
        temp[letter][1][bound]=parseFloat(e.target.value)
        return temp
    })
}

function deleteLetter(letter){
    let temp=structuredClone(letterScale)
    temp=temp.slice(0,letter).concat(temp.slice(letter+1))
    setLetterScale(temp)

}

function addLetter(){
    let temp=structuredClone(letterScale)
    temp=temp.concat([["X",[0,0]]])
    setLetterScale(temp)

}

function addFinalCategory(){
  let temp=structuredClone(finals);

  temp.categories.unshift({mp:grades?.[period]?.period.index,courseIndex:index!=-1 ? index : NaN,weight:0,type:"exam"})
  setFinals(temp)
}

function addSemesterCategory(semesterIndex){
  let temp=structuredClone(finals);

  temp.semesters[semesterIndex].categories.unshift({mp:grades?.[period]?.period.index,courseIndex:index!=-1 ? index : NaN,weight:0,type:"exam"})
  setFinals(temp)
}

function deleteSemester(semesterIndex){
  let temp = structuredClone(finals)
  temp.semesters.splice(semesterIndex,1)
  setFinals(temp)
}

function addSemester(){
  let temp = structuredClone(finals)
  temp.semesters.push({show:false,categories:[]})
  setFinals(temp)
}


function deleteFinalCategory(index){
  let temp = structuredClone(finals)
  temp.categories.splice(index,1)
  setFinals(temp)

}


function deleteSemesterCategory(semesterIndex,categoryIndex){
  let temp=structuredClone(finals)
  temp.semesters[semesterIndex].categories.splice(categoryIndex,1)
  setFinals(temp);
}


//endpoints
const endpointUrl = process.env.NEXT_PUBLIC_API_URL

async function getSettings(url,userHash){
   const result= await (await fetch(endpointUrl+"/getSettings",
    {'method':'POST',
      'headers':{'Content-Type':'application/json'},
      'body':JSON.stringify({url:url,userHash:userHash})}
  )).json()

  return result
}


async function setSettings(url, userHash,encrypted,passHash,settings){
      const result = await (await fetch(endpointUrl+"/setSettings",{
            'method':'POST',
            'headers':{'Content-Type':'application/json'},
            'body':JSON.stringify({url:url,userHash:userHash,encrypted:encrypted,passHash:passHash,settings:settings})
        })).json()
    return result
}





async function saveAndApply(tempSettings){
  //@ts-expect-error
  if(!client.guest){
    var result=await setSettings(client.district,client.username,client.encrypted,client.password,tempSettings)
  }else{
    result={status:true}
  }
  if(result.status){

  const tempGrades=structuredClone(grades);
            //oh boy. new runtime settings!!! basically need to recalculate and parse everything.


        	for(let key in tempSettings){
		        if(key=="default"||key=="mode"||key=="showCountdown"||key=="primaryColor"||key=="highlightColor"||key=="siteTitle"||key=="customLogo"){continue}
		        else{
			    for(let prop in tempSettings[key]){
				    if(tempSettings[key][prop]==false){
					    tempSettings[key][prop]=tempSettings.default[prop] //fallback to default if a class's settings props are set to false
				}
			}
		}
		tempSettings[key]=initalizeFinals2(grades,tempSettings,key)
	}
        for(let grade of tempGrades){
            grade.settings=tempSettings
            for(let ncourse of grade.courses){
              //our settings obj isn't raw here so we actually have much less processing to do
              if(!tempSettings[ncourse.identifier]){ //fuck your manual mode, for now
                ncourse.settings=initalizeFinals2(grades,tempSettings,ncourse.identifier)
              }
              else{ncourse.settings=tempSettings[ncourse.identifier]} //fuck ur manual mode
              
              ncourse=reCalculateCourse(ncourse)
            }
        }

          setGrades(tempGrades)
          return tempGrades;
        }
        else{
          return false
        }

}







async function saveNew(){
  if(validate()){ 
    const newScale:CourseSettings | any = {
        finals:{...finals,categories:simplifyWeights(finals.categories).sort((a,b)=>a.mp-b.mp)},
        rounding: rounding,
        letterScale: [...letterScale].sort((a, b) => a[1][1] - b[1][1]).reverse() //need to ad shi for the new shi type shi
    };

    const tempSettings=structuredClone(settings)



    //now we examine, did shi really change? is shi rlly diff?
      
    if(index!=-1){
      //finals
      let flag=true

      if(JSON.stringify(courseSettings.finals)!=JSON.stringify(newScale.finals)){
        flag=false;
      }

      if(flag){
        newScale.finals=false;
      }
        
      //letterScale
      if(JSON.stringify(tempSettings.default.letterScale)==JSON.stringify(newScale.letterScale)){
        newScale.letterScale=false; //fuck off mate
      }
      
      //rounding
      if(JSON.stringify(rounding)==JSON.stringify(tempSettings.default.rounding)){
        newScale.rounding=false
      }

    }

    tempSettings[course.identifier]=newScale //cause fuck ur manual mode
    ;(tempSettings as any).showCountdown = pendingShowCountdown
    setShowCountdown(pendingShowCountdown)
    ;(tempSettings as any).highlightColor = pendingHighlightColor
    setHighlightColor(pendingHighlightColor)
    const activeThemeSave = pendingThemes.find(t => t.active) || pendingThemes[0];
    ;(tempSettings as any).primaryColor = activeThemeSave.primaryColor
    ;(tempSettings as any).siteTitle = activeThemeSave.siteTitle
    ;(tempSettings as any).customLogo = activeThemeSave.customLogo
    ;(tempSettings as any).themes = pendingThemes
    setThemes?.(pendingThemes)
    applyTheme?.(activeThemeSave)

    const tempGrades=await saveAndApply(tempSettings)
    if(tempGrades){
      const ham=index!=-1 ? tempGrades[period].courses[index].settings : tempSettings.default
      localStorage.removeItem("xmlCache")
      setLetterScale(ham.letterScale)
      setRounding(ham.rounding)
      setFinals(ham.finals)
      setGrades(tempGrades)
      setShowModal(false)
      setViewStack(["home"])}
    
    else{
        createError("Failed to sync settings with server, try again?")
    }

  }
  else{
    createError("Malformed Grading Scale")
  }


}


async function resetAllClasses(){
  const activeThemeReset = pendingThemes.find(t => t.active) || pendingThemes[0];
  const tempSettings:any={mode:settings.mode,"default":settings.default,showCountdown:pendingShowCountdown,primaryColor:activeThemeReset.primaryColor,highlightColor:pendingHighlightColor,siteTitle:activeThemeReset.siteTitle,customLogo:activeThemeReset.customLogo,themes:pendingThemes}
  const tempGrades=await saveAndApply(tempSettings)
  if(tempGrades){
    setThemes?.(pendingThemes)
    applyTheme?.(activeThemeReset)
    setShowModal(false)
  }
  else{
    createError("Failed to Sync Changes with Server")
  }

}


type field="finals" | "letter" | "rounding" | "semester"


function showDefaults(field){
  const orig = originalGradingScale || originalDefault.current
  if(index!=-1){
    //@ts-ignore
    let hoopDreams=initalizeFinals2(grades,{mode:settings.mode,"default":orig},course.identifier).finals
    const template={...orig,finals:hoopDreams}
    if(field=="finals"){
      setFinals(template["finals"])
    }
    else if(field=="letter"){
      setLetterScale(template["letterScale"].map(l => [l[0], l[1]] as [string, [number, number]]))
    }
    else if(field=="rounding"){
      setRounding(template["rounding"])
    }
    else{
      const temp=structuredClone(finals)
      //@ts-ignore
      const defSem=initalizeFinals2(grades,{mode:settings.mode,"default":orig},course.identifier).finals.semesters
      temp.semesters=defSem
      setFinals(temp)
    }
  }
  else{
    if(field=="letter"){
      setLetterScale(orig.letterScale.map(l => [l[0], l[1]] as [string, [number, number]]))
    }
    else if(field=="rounding"){
      setRounding(orig.rounding)
    }
    else if(field=="finals"){
      setFinals(templateFinals(settings.mode,grades[0].periods))
    }
    else if(field=="semester"){
      const temp=structuredClone(finals)
      temp.semesters=templateFinals(settings.mode,grades[0].periods).semesters
      setFinals(temp)
    }
  }
}



function validate(){
    let temp=structuredClone(letterScale)
    for(var i=0;i<temp.length;i++){
        temp[i][1].sort()

    }

    //consisteny of order
    const raw=temp.map(letter=>letter[1]).flat().sort((a, b) => a - b)
    for(var i=raw.length-1;i>1;i-=2){
        if(temp.findIndex(letter=>letter[1].includes(raw[i]))!=temp.findIndex(letter=>letter[1].includes(raw[i-1]))){
            console.warn("Invalid letter scale: inconsistent order at index", i)
 
            return false
        }

    }

    //duplicate check
    if(hasDuplicatesSorted(raw)){console.warn("Invalid letter scale: duplicate values");return false}

 

    return true;
}

//helper function, most efficient
function hasDuplicatesSorted(arr) {
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] === arr[i - 1]) return true;
  }
  return false;





}


function addGradesCategory(){
  const courseCats=structuredClone((course as Course).categories);
  courseCats.push({name:("Category "+(courseCats.length+1)),weight:0,grade:{letter:"N/A",raw:NaN,color:"gray"},points:{earned:0,possible:0}})
  const copy=structuredClone(grades)
  copy[period].courses[index].categories=courseCats
  setGrades(copy)
}
 
function deleteCourseCategory(i){
  const x = structuredClone(grades)
  const z = x[period].courses[index];
  (z as Course).assignments=(z as Course).assignments.filter(assignment=>assignment.category!=(z as Course).categories[i].name);
  (z as Course).categories.splice(i,1)
  setGrades(x)
}

return(
<div>
{deleteConfirm && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center px-4" onClick={() => setDeleteConfirm(null)}>
    <div className="absolute inset-0 bg-black/40 dark:bg-black/60" />
    <div className="relative w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6" onClick={e => e.stopPropagation()}>
      <p className="text-sm text-gray-700 dark:text-gray-200 mb-5 text-center">Delete theme &ldquo;{deleteConfirm.name}&rdquo;?</p>
      <div className="flex gap-3">
        <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Cancel</button>
        <button onClick={() => { setDeleteConfirm(null); deleteConfirm.onConfirm(); }} className="flex-1 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-sm font-medium text-white transition-colors">Delete</button>
      </div>
    </div>
  </div>
)}
{letterScale!=undefined ? (
<Modal
show={showModal}
//onClose={()=>{ applyPalette((settings as any).primaryColor || DEFAULT_PRIMARY); onColorPreview?.((settings as any).primaryColor || DEFAULT_PRIMARY); setSiteTitle((settings as any).siteTitle ?? ""); setCustomLogo(customLogo ?? ""); setShowModal(false); setViewStack(["home"])}}
onClose={() => handleCancelAndReset()}
className={!isMediumOrLarger && `bg-transparent`}
size="3xl"
>

<Modal.Header className="dark:bg-gray-800 dark:border-gray-700">
	<div className="flex flex-col gap-0.5">
		<p className="text-xl font-semibold text-gray-900 dark:text-white">{index === -1 ? 'Settings' : 'Class Settings'}</p>
		{index !== -1 && <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{course.name}</p>}
	</div>
</Modal.Header>


<Modal.Body style={{maxHeight:isMediumOrLarger ? 400 : 500,minHeight:400}} className="overflow-y-auto dark:bg-gray-800">
{

//Settings Select Page

  true && <>
  <AnimatePresence
    mode="wait"
    initial={false}
    key="urMom"
  >
   {currentView=="home" && 
   <motion.div
      key="home"
      className="flex flex-col gap-4"
    >
    <React.Fragment key="dont fw me twin">
      {index === -1 && <motion.button
        {...animationPropsHome}
        key="countdown"
          onClick={() => setViewStack(["currentclass"])}
        className="w-full bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-700 text-base text-left text-gray-900 dark:text-white px-4 py-3 font-medium transition-colors"
      >
        <div className="flex justify-between items-center">
          Current Class
          <HiArrowCircleRight/>
        </div>
      </motion.button>}
      {index === -1 && <motion.button
        {...animationPropsHome}
        key="sitecolor"
        onClick={() => setViewStack(["themes"])}
        className="w-full bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-700 text-base text-left text-gray-900 dark:text-white px-4 py-3 font-medium transition-colors"
      >
        <div className="flex justify-between items-center">
          Site Theme
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full border border-gray-300" style={{backgroundColor: pendingThemes.find(t => t.active)?.primaryColor || DEFAULT_PRIMARY, transition: 'none'}} />
            <HiArrowCircleRight/>
          </div>
        </div>
      </motion.button>}
      <motion.button
        {...animationPropsHome}
        key="letter"
        onClick={() => setViewStack(["letter"])}
        className="w-full bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-700 text-base text-left text-gray-900 dark:text-white px-4 py-3 font-medium transition-colors">
        <div className="flex justify-between items-center">
          Letter Scale
          <HiArrowCircleRight/>
        </div>
      </motion.button>

{!mcps && <motion.button
        {...animationPropsHome}
        key="finals"
        onClick={() => setViewStack(["finals"])}
        className="w-full bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-700 text-base text-left text-gray-900 dark:text-white px-4 py-3 font-medium transition-colors">
        <div className="flex justify-between items-center">
          Final Grade
          <HiArrowCircleRight/>
        </div>
      </motion.button>}

{mcps && <motion.button
        {...animationPropsHome}
        key="semester"
        onClick={() => setViewStack(["semester"])}
        className="w-full bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-700 text-base text-left text-gray-900 dark:text-white px-4 py-3 font-medium transition-colors">
        <div className="flex justify-between items-center">
          Semester Grade
          <HiArrowCircleRight/>
        </div>
      </motion.button>}

{
//@ts-expect-error
(client.guest && index!=-1) &&
    <motion.button
        {...animationPropsHome}
        key="cats"
        onClick={() => setViewStack(["cats"])}
        className="w-full bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-700 text-base text-left text-gray-900 dark:text-white px-4 py-3 font-medium transition-colors">
        <div className="flex justify-between items-center">
          Categories
          <HiArrowCircleRight/>
        </div>
      </motion.button>
}  
  </React.Fragment>
  </motion.div>}

  
  {
  //Letter Scale Page
  currentView=="letter" && 
<motion.div
  {...animationPropsPage}
  key="letterPage"
>
<React.Fragment key="splat">

  <div className="flex justify-between items-center mb-3">
  <button
    style={{borderWidth:1,padding:5,borderRadius:12}}
    className="dark:text-white font-medium text-sm bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg px-3 py-1.5 border border-gray-200 dark:border-gray-700 transition-colors"
    onClick={()=>{setViewStack(["home"])}}
  >
    <div
      className="flex items-center"
    >
      <HiArrowCircleLeft/>
      <p>Back</p>
    </div>
  </button>
  {!isMediumOrLarger && <p className="dark:text-white text-xl font-bold">Letter Scale</p>}
  </div>

   {isMediumOrLarger && <p className="dark:text-white text-lg font-semibold mb-2">Letter Scale</p>}



  <div 
  style={{maxHeight:350}}
  className="w-full flex justify-center overflow-x-auto overflow-y-auto rounded-lg border border-gray-600">
    <table className="flex-1 mx-auto min-w-max text-left">
      {/* ── header ─────────────────────────────────────────── */}
      <thead>
        <tr className="text-xs uppercase bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-400">
          <th className="px-4 py-3 font-semibold">Letter</th>
          <th className="px-4 py-3 font-semibold">Lower</th>
          <th className="px-4 py-3 font-semibold">Upper</th>

          {/* empty heading to keep the delete column aligned */
      isMediumOrLarger && <th className="px-4 py-2" />

}
        </tr>
      </thead>

      {/* ── body ───────────────────────────────────────────── */}
      <tbody>
        {letterScale.map((letter,i) => (
          <React.Fragment key={`${i}--23`}>
          <tr
            className={i % 2 === 0 ? "bg-neutral-100 dark:bg-gray-900" : "dark:bg-gray-800"}
          >
            {/* letter cell */}
            <td className="px-4 py-2">
              <div style={{alignItems:"center"}} className="flex -mt-1 -ml-2">
              <input 
              type="text"
               key={`${i}-0`}
              value ={active[0]==`${i}-0` ? active[1] : letter[0]}
              onChange={(e)=>{
                    setActive([`${i}-0`,e.target.value])



              }}    


              onBlur={
                (e)=>{
                    setActive(['',''])
                    mutate(e,i,0)}
              }
              style={{borderRadius:10,marginRight:5,padding:0,textOverflow:"ellipsis"}}
              className="w-12 text-center rounded-lg font-bold bg-transparent dark:text-white md:text-lg  focus:ring-primary-500 focus:border-primary-500 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500">
                
              </input>
              <input
              className="w-6 bg-transparent"
              type="color"
              key={`${i}-0.5`}
              value={active[0]==`${i}-0.5` ? active[1] : (letter[2] || colorShit[letterGradeColor(letter[0])])}
                    onChange={(e)=>{
                    setActive([`${i}-0.5`,e.target.value])



              }}    

              onBlur={(e)=>{
                setActive(['',''])
                mutate(e,i,2)
              }}
              >
              
              </input>
              </div>
            </td>

            {/* upper‑bound input */}
            <td className="px-4 py-2">
              <input
                type="number"
                key={`${i}-1`}
                value={   active[0]==`${i}-1` ? active[1] : letter[1][0]}
                onBlur={(e) => {
                               setActive(['',''])
                  mutate2(e,i,0)
                }}

                 onChange={(e)=>{
                        setActive([`${i}-1`,e.target.value])



              }}    
                className="
                  w-16 md:w-24
                  rounded-lg
                  bg-transparent
                  p-1.5
                  font-bold
                  dark:text-white
                  text-right
                  outline-none
                  border border-gray-300  focus:ring-primary-600 focus:border-primary-600   dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500
                "
              />
            </td>

            {/* lower‑bound input */}
            <td className="px-4 py-2">
              <input
                type="number"
                value={   active[0]==`${i}-2` ? active[1] : letter[1][1]}
                 key={`${i}-2`}
                onBlur={(e) => {
                               setActive(['',''])
                    mutate2(e,i,1)
                }}

                 onChange={(e)=>{
                        setActive([`${i}-2`,e.target.value])



              }}    
                className="
                  w-16 md:w-24
                  rounded-lg
                  bg-transparent
                  p-1.5
                  font-bold
                  dark:text-white
                  text-right
                  outline-none
                  border border-gray-300  focus:ring-primary-600 focus:border-primary-600   dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500
                "
              />
            </td>


                       {/* delete button */
         isMediumOrLarger &&
            <td className="px-4 py-2">
              <button
                onClick={() => {
                  deleteLetter(i)
                }}
                className="
                  flex items-center gap-1
                  rounded-lg bg-primary-500
                  px-2 py-2 my-1
                  text-xs font-medium text-white
                  hover:bg-primary-600
                  focus:outline-none focus:ring-4 focus:ring-primary-300
                  dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800
                  sm:text-sm
                "
              >
                <HiOutlineTrash size="1.2rem" />
              </button>
            </td>
          
              }

      
          </tr>
          {!isMediumOrLarger   && <tr className={i % 2 === 0 ? "bg-neutral-100 dark:bg-gray-900" : "dark:bg-gray-800"}>
        <td colSpan={4}>
           <button
                onClick={() => {deleteLetter(i)}}
                className="
                  flex items-center gap-1 ml-2 -mt-3 mb-2
                  rounded-lg bg-primary-500
                  text-xs font-medium text-white
                  hover:bg-primary-600
                  px-1
                  focus:outline-none focus:ring-4 focus:ring-primary-300
                  dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800
                  sm:text-sm
                "
              >
                <p className="dark:text-white">Delete</p>
              </button>
        </td>
          



        </tr>}
          </React.Fragment>
        ))}
      </tbody>
    </table>
  </div>
 <div className="flex   mt-2 justify-between">
    <button className="p-2 px-2 text-sm md:text- bg-primary-500 dark:bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-600 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800" onClick={addLetter}>Add+</button>
      <button
        type="button"
        className="text-white p-2 text-sm md:text- bg-primary-600 hover:bg-primary-800 active:bg-primary-500 rounded-lg text-sm"
        style={{}}
        onClick={()=>{showDefaults("letter")}}
      >
        {"Show Defaults"} 
      </button>

      </div> 

    
{
  //advanced letter scale
}
<details
className="hideCarat"
onToggle={()=>setAdvancedOpen(!advancedOpen)}
>
  <summary
  className="mt-2 dark:text-white flex items-center"
  >{advancedOpen ? <HiArrowCircleDown size={20}/>: <HiArrowCircleRight size={20}/>}<p className="dark:text-white text-lg">Advanced</p></summary>

  <div className="ml-7 flex-col md:flex-row"> 
    <div style={{alignItems:"center"}} className="flex gap-2">
        <p className="dark:text-white">Rounding Enabled</p>
        <input type="checkbox" onChange={(e)=>{setRounding((prev)=>{
          let temp=structuredClone(prev)
          temp.percent=!temp.percent;
          return temp

        })}} checked={rounding.percent}></input>
    </div>
    <div style={{alignItems:"center"}} className="mt-3 flex gap-2">
        <p className="dark:text-white">Round up to:</p>
        <input className="hide-spinner w-10 h-5 rounded-lg bg-neutral-100 dark:bg-gray-600 dark:text-white"  step="1" type="number" 
        onBlur={(e)=>setRounding((prev)=>{
          let temp=structuredClone(prev);temp.percentPlaces=decimalPlaces;return temp})} 
          onChange={(e)=>setDecimalPlaces(parseInt(e.target.value))} value={decimalPlaces ?? rounding.percentPlaces}/>
        <p className="dark:text-white">decimal places</p>
    </div>
    {
  /*  <div style={{alignItems:"center"}} className="mt-3 flex gap-3  justify-center -ml-7">
        <div  style={{alignItems:"center"}} className="flex gap-2"> <p className="dark:text-white text-sm">Round Up</p> <input   type="radio"></input></div>
        <div style={{alignItems:"center"}} className="flex gap-2"> <p className="dark:text-white text-sm">Round Down</p> <input   type="radio"></input></div>
    </div> */
}

        <button
        type="button"
        className=" mt-2 py-1 text-white px-2 bg-primary-600 hover:bg-primary-800 active:bg-primary-500 rounded-lg text-sm"
        style={{}}
        onClick={()=>{showDefaults("rounding")}}
      >
       Reset
      </button>
  </div>

  </details>
</React.Fragment>
</motion.div>

  }




  {
    //Final Grade Page finals page
    currentView=="finals" && 
<motion.div
  {...animationPropsPage}
  key="finalsPage"
>
<React.Fragment key="finals say what?">
   <div className="flex justify-between items-center mb-3">
  <button
    style={{borderWidth:1,padding:5,borderRadius:12}}
    className="dark:text-white font-medium text-sm bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg px-3 py-1.5 border border-gray-200 dark:border-gray-700 transition-colors"
    onClick={()=>{setViewStack(["home"])}}
  >
    <div
      className="flex items-center"
    >
      <HiArrowCircleLeft/>
      <p>Back</p>
    </div>
  </button>
  {!isMediumOrLarger && <p className="dark:text-white text-xl font-bold">Final Grade Categories</p>}
  </div>

   {isMediumOrLarger && <p className="dark:text-white text-lg font-semibold mb-2">Final Grade Categories</p>}


      <div style={{alignItems:"center"}} className="flex gap-2">
        <p className="dark:text-white">Show Final Grade</p>
        <input type="checkbox" onChange={(e)=>{
          let temp=structuredClone(finals)
          temp.show=!temp.show
          setFinals(temp)

        }} checked={finals.show}
        disabled={finals.isSemester}
        ></input>
    </div>


  <div
    style={{maxHeight:350}}
    className="border-gray-600 rounded-lg border mt-2 overflow-x-auto overflow-y-auto"
  >
    <table className="w-full">
      <thead>
        <tr className="dark:bg-gray-700">
          <th style={{textAlign:"center"}} className="py-2 dark:text-white">Type</th>
          <th style={{textAlign:"center"}} className="py-2 dark:text-white">Marking Period</th>
          {(settings.mode!="mcps" ||modify) && <th style={{textAlign:"center"}} className="py-2 dark:text-white">Course</th>}
          <th style={{textAlign:"center"}} className="py-2 pr-4 md:pr-0 dark:text-white">Weight</th>
          {isMediumOrLarger && <th style={{textAlign:"center"}} className="py-2 dark:text-white"></th>}
        </tr>
      </thead>
      
  
      <tbody>
       {finals.categories.map((f,i)=>(
        <React.Fragment key={i}>
        <tr className={i % 2 === 0 ? "bg-neutral-100 dark:bg-gray-900" : "dark:bg-gray-800"}>
          <td 
          style={{textAlign:"center"}}
          >

                {
            //temporarily doing this really stupidly
           }
            <select 
            disabled={finals.isSemester}
           value={f.type}
           onChange={(e)=>{
            let temp=structuredClone(finals)
            //@ts-ignore
            temp.categories[i].type=e.target.value
            setFinals(temp)

           }}
           className="bg-transparent dark:text-white border-0 focus:outline-none focus:ring-0 text-sm"
            >
              <option className="bg-gray-600" value="course">Course</option>
              <option className="bg-gray-600" value="exam">Exam</option>
            </select>

                

          </td>

          <td
            style={{textAlign:"center"}}
          >
            <select value={f.mp} disabled={finals.isSemester} onChange={(e)=>{
              let temp=structuredClone(finals)
              temp.categories[i].mp=parseInt(e.target.value)
              const index=grades[parseInt(e.target.value)].courses.findIndex(c=>c.identifier==course.identifier)
              temp.categories[i].courseIndex=index!=-1 ? index : NaN
              let t=temp.categories[i]
              setFinals(temp)

            }}
              className="bg-transparent dark:text-white border-0 text-elipses focus:outline-none focus:ring-0"
            >
              {grades?.[period]?.periods.map(p=>(<option className="bg-gray-600" key={p.index} value={p.index}>{p.name}</option>))}
            </select>
          </td>


{(settings.mode!="mcps"||modify ) && <td
            style={{textAlign:"center"}}
          >
         
            <select value={f.courseIndex} 
       //     disabled={settings.mode=="automatic"} why have it at all if we disabling it tbh
              className={`bg-transparent ${true ? "text-gray-500" : "dark:text-white"} border-0 focus:outline-none focus:ring-0`}
              onChange={(e)=>{
                let temp=structuredClone(finals)
                temp.categories[i].courseIndex=parseInt(e.target.value)
                let t=temp.categories[i]
                setFinals(temp)

              }}
            >
        <option className="bg-gray-600" value={NaN}>Auto/Unknown</option>
        {grades[f.mp].courses.map((c,j)=>(
          <option className="bg-gray-600" key={j} value={j}>{c.name.trim()}</option>

        ))}
            
            </select>
            
            
          </td>}

          <td
            style={{textAlign:"center"}}
          >
            <div
              className="text-center dark:text-white flex items-center mt-2 md:ml-5"
            >
            <input
            type="text"
            disabled={finals.isSemester}
            className={`bg-transparent w-12 ${finals.isSemester ? "text-gray-400" : "dark:text-white"} focus:outline-none focus:ring-1 focus:ring-primary-500 rounded-lg border-none p-0 md:ml-5`}
            onFocus={(e)=>setKill([i,e.target.value.replaceAll("%","")])}
            onChange={(e)=>{
              setKill([i,e.target.value.replaceAll("%","")])
            }}
            onBlur={(e)=>{
           
              let temp=structuredClone(finals)
              temp.categories[i].weight=parseFloat(e.target.value.replaceAll("%",""))/100
              setFinals(temp)
              setKill([NaN,""])

            }}
            value={kill[0] == i ? kill[1] : Number((f.weight*100).toFixed(4)) + "%"}
            />
            </div>
   
          </td>

  {isMediumOrLarger && <td>
            <button
              disabled={finals.isSemester}
              onClick={() => {deleteFinalCategory(i)}}
              className={`
                  flex items-center gap-1
                  rounded-lg
                  px-2 py-2 my-1
                  text-xs font-medium
                  hover:bg-primary-600
                  focus:outline-none focus:ring-4 focus:ring-primary-300
                  ${finals.isSemester ? "bg-primary-700 text-gray-400" : "bg-primary-500 dark:bg-primary-600 text-white"}  dark:hover:bg-primary-700 dark:focus:ring-primary-800
                  sm:text-sm
                `}
            >
              <HiOutlineTrash size="1.2rem" />
            </button>
          </td>}


        </tr>


   {!isMediumOrLarger  && <tr className={i % 2 === 0 ? "bg-neutral-100 dark:bg-gray-900" : "dark:bg-gray-800"}>
        <td colSpan={(settings.mode!="mcps"||modify) ? 3 : 4}>
           <button
                onClick={() => {deleteFinalCategory(i)}}
                disabled={finals.isSemester}
                className={`
                  flex items-center gap-1 ml-2 -mt-1 mb-1
                  rounded-lg 
                  text-xs font-medium text-white
                  hover:bg-primary-600
                  px-1
                  focus:outline-none focus:ring-4 focus:ring-primary-300
                  ${finals.isSemester ? "bg-primary-700" : "bg-primary-500 dark:bg-primary-600"} dark:hover:bg-primary-700 dark:focus:ring-primary-800
                  sm:text-sm
                `}
              >
                <p className={`${finals.isSemester ? "text-gray-400" : "dark:text-white"}`}>Delete</p>
              </button>
        </td>

        </tr>}
        </React.Fragment>
))}

      </tbody>
    </table>
    </div>
    <div className="flex justify-between">
     <button className={`-ml-2 mt-2 p-2 px-2 ${finals.isSemester ? "bg-primary-600 text-gray-400" : "bg-primary-500 text-white"} dark:bg-primary-600 rounded-lg text-sm hover:bg-primary-600 focus:outline-none focus:ring-1 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800`}
     disabled={finals.isSemester} onClick={()=>{addFinalCategory()}}>Add+</button>
   
       <button disabled={finals.isSemester} className={`-ml-2 mt-2 p-2 px-2 ${finals.isSemester ? "bg-primary-600 text-gray-400" : "bg-primary-500 text-white"} rounded-lg text-sm hover:bg-primary-600 focus:outline-none focus:ring-1 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800`}
     onClick={()=>{showDefaults("finals")}}>Show Defaults</button>
   


   </div>
   </React.Fragment>
    </motion.div>

  }



  {
    //Semester Grades page
    currentView=="semester" && <motion.div
  {...animationPropsPage}
  key="semesterPage"
>
<React.Fragment key="semester says what?">
  <div className="flex justify-between items-center mb-3">
  <button
    style={{borderWidth:1,padding:5,borderRadius:12}}
    className="dark:text-white font-medium text-sm bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg px-3 py-1.5 border border-gray-200 dark:border-gray-700 transition-colors"
    onClick={()=>{setViewStack(["home"])}}
  >
    <div
      className="flex items-center"
    >
      <HiArrowCircleLeft/>
      <p>Back</p>
    </div>
  </button>
  {!isMediumOrLarger && <p className="dark:text-white text-xl font-bold">Semesters</p>}
  </div>

   {isMediumOrLarger && <p className="dark:text-white text-lg font-semibold mb-2">Semesters</p>}

{finals.semesters.map((semester,j)=>{
  if(semester==null){return null}
  return(<div className="mb-8" key={j}>
  <div className="flex items-center justify-between">
    <div>
        <p className="dark:text-white font-semibold">{ordinalSuffix(j+1) +" Semester"}</p>
        <div style={{alignItems:"center"}} className="flex gap-2">
          <p className="dark:text-white text-sm">Show Semester Grade</p>
          <input type="checkbox" onChange={(e)=>{
            let temp=structuredClone(finals)
            temp.semesters[j].show=!semester.show
            setFinals(temp)

          }} checked={semester.show}></input>
      </div>
    </div>


        
  </div>

  <div
    style={{maxHeight:350}}
    className="border-gray-200 dark:border-gray-700 rounded-lg border mt-2 overflow-x-auto overflow-y-auto"
  >
    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
      <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
        <tr>
          <th className="py-3 px-4">Type</th>
          <th className="py-3 px-4">Marking Period</th>
          {(settings.mode!="mcps"||modify) && <th className="py-3 px-4">Course</th>}
          <th className="py-3 px-4">Weight</th>
          {isMediumOrLarger && <th className="py-3 px-4"></th>}
        </tr>
      </thead>
      
  
      <tbody>
       {semester.categories.map((f,i)=>(
        <React.Fragment key={i}>
        <tr className={`h-12 border-b dark:border-gray-700 ${i % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-800"}`}>
          <td className="py-2 px-4">

                {
            //temporarily doing this really stupidly
           }
            <select 
           value={f.type}
           onChange={(e)=>{
            let temp=structuredClone(finals)
            //@ts-ignore
            temp.semesters[j].categories[i].type=e.target.value
            setFinals(temp)

           }}
           className="bg-transparent dark:text-white border-0 focus:outline-none focus:ring-0 text-sm"
            >
              <option className="bg-gray-600" value="course">Course</option>
              <option className="bg-gray-600" value="exam">Exam</option>
            </select>

                

          </td>

          <td className="py-2 px-4">
            <select value={f.mp} onChange={(e)=>{
              let temp=structuredClone(finals)
              temp.semesters[j].categories[i].mp=parseInt(e.target.value)
              const index=grades[parseInt(e.target.value)].courses.findIndex(c=>c.identifier==course.identifier)
              temp.semesters[j].categories[i].courseIndex=index!=-1 ? index : NaN
              setFinals(temp)
            }}
              className="bg-transparent dark:text-white border-0 focus:outline-none focus:ring-0 text-sm"
            >
              {grades?.[period]?.periods.map(p=>(<option className="bg-gray-600" key={p.index} value={p.index}>{p.name}</option>))}
            </select>
          </td>

{(settings.mode!="mcps"||modify) && <td className="py-2 px-4">
            <select value={f.courseIndex}
              className="bg-transparent text-gray-500 border-0 focus:outline-none focus:ring-0 text-sm"
              onChange={(e)=>{
                let temp=structuredClone(finals)
                temp.semesters[j].categories[i].courseIndex=parseInt(e.target.value)
                setFinals(temp)
              }}
            >
              <option className="bg-gray-600" value={NaN}>Auto/Unknown</option>
              {grades[f.mp].courses.map((c,k)=>(
                <option className="bg-gray-600" key={k} value={k}>{c.name.trim()}</option>
              ))}
            </select>
          </td>}

          <td className="py-2 px-4">
            <input
              className="bg-transparent w-14 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500 rounded-lg border-none p-0 text-sm"
              type="text"
              onFocus={(e)=>setKill([i,e.target.value.replaceAll("%","")])}
              onChange={(e)=>setKill([i,e.target.value.replaceAll("%","")])}
              onBlur={(e)=>{
                let temp=structuredClone(finals)
                temp.semesters[j].categories[i].weight=parseFloat(e.target.value.replaceAll("%",""))/100
                setFinals(temp)
                setKill([NaN,""])
              }}
              value={kill[0]==i ? kill[1] : Number((f.weight*100).toFixed(4)) + "%"}
            />
          </td>

  {isMediumOrLarger && <td className="py-2 px-4 text-right">
            <button
              onClick={() => {deleteSemesterCategory(j,i)}}
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-primary-500 text-white hover:bg-primary-600 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 transition-colors duration-200"
            >
              <HiOutlineTrash size="1rem" />
            </button>
          </td>}


        </tr>


   {!isMediumOrLarger && <tr className={`border-b dark:border-gray-700 ${i % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-800"}`}>
        <td colSpan={settings.mode!="mcps" ? 3 : 4} className="px-4 pb-2">
           <button
                onClick={() => {deleteSemesterCategory(j,i)}}
                className="flex items-center gap-1 rounded-lg bg-primary-500 px-2 py-1.5 text-xs font-medium text-white hover:bg-primary-600 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 transition-colors duration-200"
              >
                <HiOutlineTrash size="1rem" />
                <p>Delete</p>
              </button>
        </td>
        </tr>}
        </React.Fragment>
))}

      </tbody>
    </table>
    </div>
    <div className="flex justify-between">
     <button className="mt-2 p-2 px-2 bg-primary-500 dark:bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-600 focus:outline-none focus:ring-1 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
     onClick={()=>{addSemesterCategory(j)}}>Add+</button>

       <button className="mt-2 p-2 px-2 bg-primary-500 dark:bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-600 focus:outline-none focus:ring-1 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
     onClick={()=>{showDefaults("semester")}}>Show Defaults</button>
   


   </div></div>
  )})}
  
    </React.Fragment>
    </motion.div>
  }

  {
    //Categories Page
    (currentView=="cats" && index!=-1) && <>
    <motion.div
      {...animationPropsPage}
      key="catsPage"
    >
      <div className="flex justify-between items-center mb-3">
        <button
          style={{borderWidth:1,padding:5,borderRadius:12}}
          className="dark:text-white font-medium text-sm bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg px-3 py-1.5 border border-gray-200 dark:border-gray-700 transition-colors"
          onClick={()=>{setViewStack(["home"])}}
        >
          <div
            className="flex items-center"
          >
            <HiArrowCircleLeft/>
            <p>Back</p>
          </div>
        </button>
        {false && <p className="dark:text-white text-xl font-bold">Categories</p>}
      </div>

      {true && <p className="dark:text-white text-lg font-semibold mb-2">Categories</p>}

    
      <div className="flex flex-col relative gap-1 w-fit">
        <p className="dark:text-white text-sm">Marking Period</p>
        <select
        value={period}

        className="-ml-1.5 bg-transparent dark:text-white w-fit text-sm rounded-lg !ring-0 outline-none border-1 focus:border-primary-500"
        >
          {grades[0].periods.map((mp,k)=>{

            return(
              <option className="bg-gray-600" key={k} value={mp.index}>{mp.name}</option>
            )
          })}
        </select>
      </div>

   <div
    style={{maxHeight:350}}
    className="border-gray-600 rounded-lg border mt-2 overflow-x-auto overflow-y-auto"
  >
    <table className="w-full">
      <thead>
        <tr className="dark:bg-gray-700">
          <th style={{textAlign:"center"}} className="py-2 dark:text-white">Name</th>
          <th style={{textAlign:"center"}} className="py-2 pr-4 md:pr-0 dark:text-white">Weight</th>
          {true && <th style={{textAlign:"center"}} className="py-2 dark:text-white"></th>}
        </tr>
      </thead>
      
  
      <tbody>
       {
       //@ts-ignore idk why it's going off here, the index!=-1 ensures that it would be fine
       course.categories.map((f,i)=>(
        <React.Fragment key={i}>
        <tr className={i % 2 === 0 ? "bg-neutral-100 dark:bg-gray-900" : "dark:bg-gray-800"}>
          <td 
          style={{textAlign:"center",textOverflow:"elipsis"}}
          >
            <p className="dark:text-white">
              {f.name}
            </p>
          </td>

          <td
            style={{textAlign:"center"}}
          >
            <div
              className="text-center dark:text-white flex items-center mt-2"
            >
            <input
            type="text"
            style={{marginLeft:155}}
            className="bg-transparent w-12 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500 rounded-lg border-none p-0"
            onFocus={(e)=>setKill([i,e.target.value.replaceAll("%","")])}
            onChange={(e)=>{
              setKill([i,e.target.value.replaceAll("%","")])
            }}
            onBlur={(e)=>{
           //this is being re-worked to only serve the Guest page so womp womp it was deprecated before anyway
              let temp=structuredClone(finals)
              temp.categories[i].weight=parseFloat(e.target.value.replaceAll("%",""))/100
              setFinals(temp)

              const fuck=structuredClone(grades)
            
              fuck[period].courses[index].categories[i].weight=parseFloat(e.target.value.replaceAll("%",""))/100
              fuck[period].courses[index]=reCalculateCourse(fuck[period].courses[index])
              setGrades(fuck)
              setKill([NaN,""])

            }}
            value={kill[0] == i ? kill[1] : Number((f.weight*100).toFixed(4)) + "%"}
            />
            </div>
   
          </td>

  {true && <td>
            <button
              onClick={() => {deleteCourseCategory(i)}}
              className="
                  flex items-center gap-1
                  rounded-lg bg-primary-500
                  px-2 py-2 my-1
                  text-xs font-medium text-white
                  hover:bg-primary-600
                  focus:outline-none focus:ring-4 focus:ring-primary-300
                  dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800
                  sm:text-sm
                "
            >
              <HiOutlineTrash size="1.2rem" />
            </button>
          </td>}


        </tr>


   {!isMediumOrLarger  && <tr className={i % 2 === 0 ? "bg-neutral-100 dark:bg-gray-900" : "dark:bg-gray-800"}>
        <td colSpan={settings.mode!="mcps" ? 3 : 4}>
           <button
                onClick={() => {deleteFinalCategory(i)}}
                className="
                  flex items-center gap-1 ml-2 -mt-1 mb-1
                  rounded-lg bg-primary-500
                  text-xs font-medium text-white
                  hover:bg-primary-600
                  px-1
                  focus:outline-none focus:ring-4 focus:ring-primary-300
                  dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800
                  sm:text-sm
                "
              >
                <p className="dark:text-white">Delete</p>
              </button>
        </td>

        </tr>}
        </React.Fragment>
))}

      </tbody>
    </table>
      </div>
        <button className="p-2 px-2 mt-2 -ml-1.5 text-sm bg-primary-500 dark:bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-600 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800" onClick={addGradesCategory}>Add+</button>
    </motion.div>
    </>
  }

  {currentView === "themes" &&
    <motion.div {...animationPropsPage} key="themesPage">
      <div className="flex justify-between items-center mb-4">
        <button
          style={{borderWidth:1, padding:5, borderRadius:12}}
          className="dark:text-white font-medium text-sm bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg px-3 py-1.5 border border-gray-200 dark:border-gray-700 transition-colors"
          onClick={() => setViewStack(["home"])}
        >
          <div className="flex items-center"><HiArrowCircleLeft/><p>Back</p></div>
        </button>
        {isMediumOrLarger && <p className="dark:text-white text-lg font-semibold">Site Theme</p>}
      </div>

      <div className="flex flex-col gap-2">
        {pendingThemes.map((theme) => (
          <div
            key={theme.id}
            className={`flex items-center justify-between p-3 rounded-lg border ${theme.active ? 'border-gray-300 dark:border-gray-600 bg-neutral-100 dark:bg-gray-700' : 'border-gray-300 dark:border-gray-600 bg-neutral-50 dark:bg-gray-800'}`}
          >
            <button
              className="flex items-center gap-2.5 flex-1 text-left"
              onClick={() => {
                setPendingThemes(prev => prev.map(t => ({...t, active: t.id === theme.id})));
                applyTheme?.(theme);
              }}
            >
              <div className="w-5 h-5 rounded-full border border-gray-300 flex-shrink-0" style={{backgroundColor: theme.primaryColor}} />
              <div>
                <p className="dark:text-white font-semibold text-sm">{theme.name}</p>
                {theme.active && <p className="text-xs text-primary-500 dark:text-primary-400">Selected</p>}
              </div>
            </button>
            {!theme.preset && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setThemeEditorData({name: theme.name, primaryColor: theme.primaryColor, siteTitle: theme.siteTitle, customLogo: theme.customLogo});
                    setThemeEditorMode('edit');
                    setEditingThemeId(theme.id);
                    setTitleOpen(false);
                    setViewStack(prev => [...prev, "themeeditor"]);
                  }}
                  className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <HiPencil size="1rem" />
                </button>
                <button
                  onClick={() => setDeleteConfirm({
                    name: theme.name,
                    onConfirm: () => {
                      const wasActive = theme.active;
                      const newThemes = pendingThemes.filter(t => t.id !== theme.id);
                      if (wasActive && newThemes.length > 0) {
                        newThemes[0] = {...newThemes[0], active: true};
                        applyTheme?.(newThemes[0]);
                      }
                      setPendingThemes(newThemes);
                    }
                  })}
                  className="p-1.5 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                >
                  <HiOutlineTrash size="1rem" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        className="mt-3 w-full p-2 text-sm bg-primary-500 dark:bg-primary-600 text-white rounded-lg hover:bg-primary-600 focus:outline-none"
        onClick={() => {
          const activePt = pendingThemes.find(t => t.active);
          setThemeEditorData({name: '', primaryColor: activePt?.primaryColor || DEFAULT_PRIMARY, siteTitle: '', customLogo: ''});
          setThemeEditorMode('add');
          setEditingThemeId(null);
          setTitleOpen(false);
          setViewStack(prev => [...prev, "themeeditor"]);
        }}
      >
        + Add Theme
      </button>
    </motion.div>
  }

  {currentView === "themeeditor" &&
    <motion.div {...animationPropsPage} key="themeeditorPage">
      <div className="flex justify-between items-center mb-4">
        <button
          style={{borderWidth:1, padding:5, borderRadius:12}}
          className="dark:text-white font-medium text-sm bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg px-3 py-1.5 border border-gray-200 dark:border-gray-700 transition-colors"
          onClick={() => {
            const revertTo = pendingThemes.find(t => t.active);
            if (revertTo) applyTheme?.(revertTo);
            setViewStack(["themes"]);
          }}
        >
          <div className="flex items-center"><HiArrowCircleLeft/><p>Back</p></div>
        </button>
        {isMediumOrLarger && <p className="dark:text-white text-lg font-semibold">{themeEditorMode === 'add' ? 'Add Theme' : 'Edit Theme'}</p>}
      </div>

      <div className="flex flex-col gap-3">
        <div className="rounded-lg border border-gray-300 dark:border-gray-600 bg-neutral-50 dark:bg-gray-800 p-3">
          <p className="dark:text-white font-semibold text-sm mb-1.5">Name</p>
          <input
            type="text"
            placeholder="My Theme"
            value={themeEditorData.name}
            onChange={(e) => setThemeEditorData(prev => ({...prev, name: e.target.value}))}
            className="w-full bg-white dark:bg-gray-700 text-sm dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded border border-gray-300 dark:border-gray-600 px-2 py-1.5 focus:outline-none focus:ring-0 focus:border-primary-500"
          />
        </div>

        <label className="flex items-center justify-between p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-neutral-50 dark:bg-gray-800 cursor-pointer">
          <div className="flex items-center gap-1.5">
            <p className="dark:text-white font-semibold text-sm">Color</p>
            <HiPencil size="0.8rem" className="text-gray-400 dark:text-gray-500" />
          </div>
          <div className="w-6 h-6 rounded border border-gray-300 overflow-hidden" style={{backgroundColor: themeEditorData.primaryColor, transition: 'none'}}>
            <input
              type="color"
              className="opacity-0 w-full h-full cursor-pointer"
              value={themeEditorData.primaryColor}
              onChange={(e) => {
                const newColor = e.target.value;
                setThemeEditorData(prev => ({...prev, primaryColor: newColor}));
                if (previewTimeout.current) clearTimeout(previewTimeout.current);
                previewTimeout.current = setTimeout(() => {
                  applyTheme?.({...themeEditorData, primaryColor: newColor, id: editingThemeId || 'preview', active: true, preset: false});
                }, 150);
              }}
            />
          </div>
        </label>

        <div className="rounded-lg border border-gray-300 dark:border-gray-600 bg-neutral-50 dark:bg-gray-800 overflow-hidden">
          <button className="flex items-center justify-between p-3 w-full" onClick={() => { setTitleOpen(v => !v); if (!titleOpen) setTimeout(() => titleInputRef.current?.focus(), 50); }}>
            <div className="flex items-center gap-1.5">
              <p className="dark:text-white font-semibold text-sm">Site Title</p>
              <HiPencil size="0.8rem" className="text-gray-400 dark:text-gray-500" />
            </div>
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-400 dark:text-gray-500 truncate max-w-[8rem]">{themeEditorData.siteTitle || "Grade Durian"}</p>
              <HiArrowCircleDown className="dark:text-white flex-shrink-0" style={{transform: titleOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.15s'}} />
            </div>
          </button>
          {titleOpen && (
            <div className="px-3 pb-3">
              <input
                ref={titleInputRef}
                type="text"
                placeholder="Grade Durian"
                value={themeEditorData.siteTitle}
                onChange={(e) => {
                  setThemeEditorData(prev => ({...prev, siteTitle: e.target.value}));
                  setSiteTitle?.(e.target.value);
                }}
                className="w-full bg-white dark:bg-gray-700 text-sm dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded border border-gray-300 dark:border-gray-600 px-2 py-1.5 focus:outline-none focus:ring-0 focus:border-primary-500"
              />
            </div>
          )}
        </div>

        <label className="flex items-center justify-between p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-neutral-50 dark:bg-gray-800 cursor-pointer">
          <div className="flex items-center gap-1.5">
            <p className="dark:text-white font-semibold text-sm">Logo</p>
            <HiPencil size="0.8rem" className="text-gray-400 dark:text-gray-500" />
          </div>
          <div className="flex items-center gap-2">
            {themeEditorData.customLogo
              ? <>
                  <img src={themeEditorData.customLogo} alt="" className="w-6 h-6 rounded object-contain" />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      const updated = {...themeEditorData, customLogo: ''};
                      setThemeEditorData(updated);
                      applyTheme?.({...updated, id: editingThemeId || 'preview', active: true, preset: false});
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xs"
                  >
                    ✕
                  </button>
                </>
              : <span className="text-sm text-gray-400 dark:text-gray-500">Default</span>
            }
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                e.target.value = "";
                const { dataUrl, dominantColor } = await processLogoUpload(file, themeEditorData.primaryColor);
                const updated = {...themeEditorData, customLogo: dataUrl, primaryColor: dominantColor};
                setThemeEditorData(updated);
                applyTheme?.({...updated, id: editingThemeId || 'preview', active: true, preset: false});
              }}
            />
          </div>
        </label>
      </div>

      <div className="flex gap-2 mt-4">
        {themeEditorMode === 'add' ? (
          <button
            className="flex-1 p-2 text-sm bg-primary-500 dark:bg-primary-600 text-white rounded-lg hover:bg-primary-600 dark:hover:bg-primary-700 disabled:opacity-50 focus:outline-none transition-none"
            disabled={!themeEditorData.name.trim()}
            onClick={() => {
              const nameClean = themeEditorData.name.trim();
              const titleClean = themeEditorData.siteTitle.trim();
              if (profanityFilter.isProfane(nameClean) || (titleClean && profanityFilter.isProfane(titleClean))) {
                createError("Keep it clean!");
                return;
              }
              const newTheme: Theme = {
                id: Date.now().toString(36) + Math.random().toString(36).slice(2),
                name: nameClean,
                primaryColor: themeEditorData.primaryColor,
                siteTitle: themeEditorData.siteTitle || 'Grade Durian',
                customLogo: themeEditorData.customLogo,
                active: true,
                preset: false,
              };
              setPendingThemes(prev => [...prev.map(t => ({...t, active: false})), newTheme]);
              applyTheme?.(newTheme);
              setViewStack(["themes"]);
            }}
          >
            Add
          </button>
        ) : (
          <>
            <button
              className="flex-1 p-2 text-sm bg-primary-500 dark:bg-primary-600 text-white rounded-lg hover:bg-primary-600 dark:hover:bg-primary-700 disabled:opacity-50 focus:outline-none transition-none"
              disabled={!themeEditorData.name.trim()}
              onClick={() => {
                const nameClean = themeEditorData.name.trim();
                const titleClean = themeEditorData.siteTitle.trim();
                if (profanityFilter.isProfane(nameClean) || (titleClean && profanityFilter.isProfane(titleClean))) {
                  createError("Keep it clean!");
                  return;
                }
                const updatedThemes = pendingThemes.map(t =>
                  t.id === editingThemeId
                    ? {...t, ...themeEditorData, name: nameClean, siteTitle: themeEditorData.siteTitle || 'Grade Durian'}
                    : t
                );
                setPendingThemes(updatedThemes);
                const updatedTheme = updatedThemes.find(t => t.id === editingThemeId);
                if (updatedTheme?.active) applyTheme?.(updatedTheme);
                setViewStack(["themes"]);
              }}
            >
              Save
            </button>
            <button
              className="flex-1 p-2 text-sm bg-gray-500 dark:bg-gray-800 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-900 focus:outline-none transition-none"
              onClick={() => {
                const revertTo = pendingThemes.find(t => t.active);
                if (revertTo) applyTheme?.(revertTo);
                setViewStack(["themes"]);
              }}
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </motion.div>
  }







  {currentView === "currentclass" &&
    <motion.div {...animationPropsPage} key="currentclassPage">
      <div className="flex justify-between items-center mb-4">
        <button
          style={{borderWidth:1, padding:5, borderRadius:12}}
          className="dark:text-white font-medium text-sm bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg px-3 py-1.5 border border-gray-200 dark:border-gray-700 transition-colors"
          onClick={() => setViewStack(["home"])}
        >
          <div className="flex items-center"><HiArrowCircleLeft/><p>Back</p></div>
        </button>
        {isMediumOrLarger && <p className="dark:text-white text-lg font-semibold">Current Class</p>}
      </div>

      <div className="flex flex-col gap-3">
        <div style={{borderWidth:1}} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-3 flex justify-between items-center">
          <p className="text-base font-semibold dark:text-white">Countdown</p>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={pendingShowCountdown} onChange={(e) => setPendingShowCountdown(e.target.checked)} />
            <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-primary-500 dark:peer-checked:bg-primary-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
          </label>
        </div>

        <div style={{borderWidth:1}} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-3 flex justify-between items-center">
          <div>
            <p className="text-base font-semibold dark:text-white">Highlight</p>
            {/* <p className="text-xs text-gray-500 dark:text-gray-400">Highlight the active class card</p> */}
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={!!pendingHighlightColor} onChange={(e) => setPendingHighlightColor(e.target.checked ? "on" : null)} />
            <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-primary-500 dark:peer-checked:bg-primary-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
          </label>
        </div>
      </div>
    </motion.div>
  }

  </AnimatePresence>
  
  
  </>


}


</Modal.Body>



<Modal.Footer className="dark:bg-gray-800 dark:border-gray-700">
<div className="w-full flex justify-start gap-3">
      <button
      className="text-white text-sm md:text-base hover:bg-primary-600 focus:outline-none focus:ring-4 focus:ring-primary-300 bg-primary-500 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 p-2 px-3 rounded-lg disabled:opacity-50 transition-colors duration-200"
      disabled={currentView === "themeeditor" && !themeEditorData.name.trim()}
      onClick={() => {
        if (currentView === "themeeditor") {
          const nameClean = themeEditorData.name.trim();
          const titleClean = themeEditorData.siteTitle.trim();
          if (profanityFilter.isProfane(nameClean) || (titleClean && profanityFilter.isProfane(titleClean))) {
            createError("Keep it clean!");
            return;
          }
          if (themeEditorMode === 'add') {
            const newTheme: Theme = {
              id: Date.now().toString(36) + Math.random().toString(36).slice(2),
              name: nameClean,
              primaryColor: themeEditorData.primaryColor,
              siteTitle: themeEditorData.siteTitle || 'Grade Durian',
              customLogo: themeEditorData.customLogo,
              active: true,
              preset: false,
            };
            setPendingThemes(prev => [...prev.map(t => ({...t, active: false})), newTheme]);
            applyTheme?.(newTheme);
            setViewStack(["themes"]);
          } else {
            const updatedThemes = pendingThemes.map(t =>
              t.id === editingThemeId
                ? {...t, ...themeEditorData, name: nameClean, siteTitle: themeEditorData.siteTitle || 'Grade Durian'}
                : t
            );
            setPendingThemes(updatedThemes);
            const updatedTheme = updatedThemes.find(t => t.id === editingThemeId);
            if (updatedTheme?.active) applyTheme?.(updatedTheme);
            setViewStack(["themes"]);
          }
        } else {
          saveNew();
        }
      }}
      >
        {currentView === "themeeditor" ? (themeEditorMode === 'add' ? 'Add' : 'Save') : 'Save'}
      </button>

      <button
        className="rounded-lg bg-gray-500 px-4 py-2 text-sm font-medium text-white hover:bg-gray-600 focus:outline-none focus:ring-4 focus:ring-gray-300 dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-800 transition-colors duration-200"
        onClick={() => {
          if (currentView === "themeeditor") {
            const revertTo = pendingThemes.find(t => t.active);
            if (revertTo) applyTheme?.(revertTo);
            setViewStack(["themes"]);
          } else {
            handleCancelAndReset();
          }
        }}
        >
        Cancel
      </button>

      {index ==-1 &&
          <button
        type="button"
        className="ml-auto md:text-base text-white bg-primary-600 hover:bg-primary-800 active:bg-primary-500 px-3 p-2 rounded-lg text-sm transition-colors duration-200"
        style={{}}
        onClick={()=>{resetAllClasses()}}
      >
        Reset Classes
      </button>
      }

</div>


</Modal.Footer>


</Modal>)
: <></>}



</div>


)

}