import React, { useState, useEffect, useRef } from "react";
import "../styles/globals.css";
import StudentVue, { Client } from "studentvue";
import { useRouter } from "next/router";
import { Flowbite, Toast, useTheme } from "flowbite-react";
import Topbar from "../components/TopBar";
import SideBar from "../components/SideBar";
import MobileBar from "../components/MobileBar";
import { Grades,parseGrades,findCurrentPeriod,getCache,initalizeFinals2,reCalculateCourse,Cache} from "../utils/grades";
import { applyPalette, DEFAULT_PRIMARY, recolorImage, updateFavicon } from "../utils/colorPalette";
import Head from "next/head";
import { HiX } from "react-icons/hi";
import { AnimateSharedLayout,MotionConfig, motion, useAnimation, useMotionValue, useAnimationFrame, animate } from "framer-motion";
import dynamic from "next/dynamic";
const DarkModeToggle = dynamic(() => import('../components/Toggle'), { ssr: false });
import Cookies from "js-cookie";
import useWindowSize from '../hooks/useWindowSize';
import allDistricts from "../lib/districts";
import { springConfig,reducedMotionConfig } from "../utils/motionConfig";
import { SchoolsListType } from "../utils/grades";
import {grades as sample,studentInfo as info,document as sampleDocument,schedule,attendance} from "../utils/sample"

interface Toast {
	title: string;
	type: "success" | "error" | "warning" | "info";
}



const noShowNav = ["/login", "/", "/privacy/ios","/privacy/web", "/letter","/faq"];
const noShowSidebar = ["/login", "/"];

function LogoButton({ openInFrame, basePath, logoSrc }: { openInFrame: () => void, basePath: string, logoSrc: string }) {
	const rotation = useMotionValue(0);
	const scaleVal = useMotionValue(1);
	const isHovered = useRef(false);
	const [hovered, setHovered] = useState(false);

	useAnimationFrame((_, delta) => {
		if (!isHovered.current) {
			rotation.set(rotation.get() + delta * 0.05);
		}
	});

	const handleHoverStart = async () => {
		isHovered.current = true;
		setHovered(true);
		animate(scaleVal, 1.15, { duration: 0.2 });
		await animate(rotation, rotation.get() + 180, { duration: 0.8, ease: "easeInOut" });
	};

	const handleHoverEnd = () => {
		isHovered.current = false;
		setHovered(false);
		animate(scaleVal, 1, { duration: 0.3, ease: "easeOut" });
	};

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ delay: 0.4, duration: 0.4 }}
			className="flex flex-col items-center gap-3"
			onClick={openInFrame}
		>
			<motion.div
				className="relative cursor-pointer"
				onHoverStart={handleHoverStart}
				onHoverEnd={handleHoverEnd}
			>
				<motion.div
					animate={{ scale: hovered ? 1 : [0.91, 1.12, 0.91], opacity: hovered ? 0 : 0.25 }}
					transition={{ scale: { duration: 2, repeat: hovered ? 0 : Infinity, ease: "easeInOut" }, opacity: { duration: 0.4 } }}
					className="absolute inset-0 rounded-full bg-primary-400"
				/>
				<motion.img
					src={logoSrc}
					style={{ rotate: rotation, scale: scaleVal, clipPath: 'circle(50%)' }}
					className="w-24 h-24 relative"
				/>
			</motion.div>
			<span className="text-sm font-medium text-gray-400 dark:text-gray-500 tracking-widest uppercase cursor-pointer">Tap to Launch</span>
		</motion.div>
	);
}

function MyApp({ Component, pageProps }) {
	const router = useRouter();
	const [districtURL, setDistrictURL] = useState(
		undefined
	);
	const [client, setClient] = useState<Awaited<ReturnType<typeof StudentVue.login>>["client"]>(undefined);
	const [settingsModal,setSettingsModal]=useState<boolean>(false);
	const [showCountdown,setShowCountdown]=useState<boolean>(true);
	const [highlightColor,setHighlightColor]=useState<string|null>(null);
	const [siteTitle,setSiteTitle]=useState<string>(() => {
		if (typeof window !== 'undefined') return localStorage.getItem('siteTitle') ?? "";
		return "";
	});
	const prevSiteTitleRef = useRef("");
	useEffect(() => {
		const APP_NAME = "Grade Durian";
		const isLoggedInPage = !noShowNav.includes(router.pathname);
		const prev = prevSiteTitleRef.current;
		const applyTitle = () => {
			let t = document.title;
			if (prev && prev !== APP_NAME) t = t.replace(prev, APP_NAME);
			if (isLoggedInPage && siteTitle && siteTitle !== APP_NAME) t = t.replace(APP_NAME, siteTitle);
			if (t !== document.title) document.title = t;
		};
		prevSiteTitleRef.current = isLoggedInPage ? (siteTitle || "") : "";
		localStorage.setItem('siteTitle', siteTitle || "");
		applyTitle();
		if (!isLoggedInPage || !siteTitle || siteTitle === APP_NAME) return;
		const titleEl = document.querySelector('title');
		if (!titleEl) return;
		const observer = new MutationObserver(() => {
			const updated = document.title.replace(APP_NAME, siteTitle);
			if (updated !== document.title) document.title = updated;
		});
		observer.observe(titleEl, { childList: true });
		return () => observer.disconnect();
	}, [siteTitle, router.pathname]);
	const [originalGradingScale,setOriginalGradingScale]=useState<any>(null);
	const [logoSrc, setLogoSrc] = useState<string>(`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/assets/logo.png`);
	const [studentInfo, setStudentInfo] = useState(undefined);
	const [toasts, setToasts] = useState<Toast[]>([]);
	const [cacheLoading,setCacheLoading]=useState(true)
	const [grades, setGrades] = useState<Grades[]>();
	const [mp, setMP] = useState<number>();
	const [loading, setLoading] = useState(false);
	const [referal,setReferal]=useState(false);
	const [districts, setDistricts] = useState(allDistricts);
	const [timestamp,setTime]=useState(0);
	const { width } = useWindowSize();
	const [modalBg,setModalBg] = useState(false)
	const scrollPos=useRef(0)
	const [schoolsList,setSchoolsList] = useState<SchoolsListType[]>(undefined)
	const [schoolIndex,setSchoolIndex]=useState(0)
	const [donation,setDonation]=useState(undefined)
	const isMediumOrLarger = width >= 768;
	const [gated, setGated] = useState(true); // url masking
	const logoColorApplied = useRef(false);

	const applyColor = (hex: string) => {
		applyPalette(hex);
		logoColorApplied.current = true;
		const base = process.env.NEXT_PUBLIC_BASE_PATH || '';
		if (hex === '#f43f5e') {
			setLogoSrc(`${base}/assets/logo1.png`);
			updateFavicon(`${base}/favicon1.ico`);
		} else if (hex === DEFAULT_PRIMARY) {
			setLogoSrc(`${base}/assets/logo.png`);
			updateFavicon(`${base}/favicon.ico`);
		} else {
			recolorImage(`${base}/assets/logo.png`, hex).then(url => {
				setLogoSrc(url);
				updateFavicon(url);
			});
		}
	};

	useEffect(() => {
		if (router.pathname === '/' || router.pathname === '/login') {
			applyPalette(DEFAULT_PRIMARY);
			const base = process.env.NEXT_PUBLIC_BASE_PATH || '';
			recolorImage(`${base}/assets/logo.png`, DEFAULT_PRIMARY).then(url => setLogoSrc(url));
			updateFavicon(`${base}/favicon.ico`);
			return;
		}
		if (gated) return;
		const cached = localStorage.getItem('primaryColor');
		if (cached) {
			applyPalette(cached);
			if (!logoColorApplied.current) {
				logoColorApplied.current = true;
				applyColor(cached);
			}
		}
	}, [router.pathname, gated]);

	useEffect(() => {
		const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
		if (isMobile || window !== window.top || window.location.hostname === 'localhost') {
			setGated(false);
		}

	}, []);

	const openInFrame = () => {
		const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
		if (isMobile) {
			setGated(false);
			return;
		}
		const w = window.open('about:blank', '_blank');
		if (w) {
			w.document.write(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="icon" href="${window.location.origin}${process.env.NEXT_PUBLIC_BASE_PATH || ''}/favicon.ico"><style>*{margin:0;padding:0;border:0;overflow:hidden}html,body{width:100%;height:100%}</style></head><body><iframe id="f" src="${window.location.href}" style="width:100%;height:100%;border:none;"></iframe><script>const f=document.getElementById('f');f.addEventListener('load',function(){try{const t=f.contentDocument.querySelector('title');if(t){document.title=t.innerText;new MutationObserver(()=>{document.title=t.innerText;}).observe(t,{childList:true,subtree:true})}}catch(e){}});<\/script></body></html>`);
			w.document.close();
			window.open(location.href, '_self', '');
			window.close();
			window.location.replace('https://www.google.com');
		}
	};

	//const apiUrl="http://localhost:3001"
	//const apiUrl="https://gradedurianproxy1.up.railway.app"
	//const apiUrl="https://cloudproxy.gradedurian.workers.dev"
	const apiUrl = process.env.NEXT_PUBLIC_API_URL
	//const apiUrl="https://studentvuelibtest.up.railway.app"


	function guestLogin(){
		//@ts-expect-error
		setClient({guest:true,loadedAttendance:attendance,loadedSchedule:schedule,loadedDocuments:[{file:{date:new Date(),type:"Sample"},comment:"Sample Document",get:()=>{return [{base64:sampleDocument}]	}}]})
		setGrades(sample)
		setStudentInfo(info)
		setMP(0);
		if(!gated&&(router.pathname=="/"||router.pathname=="/login")){router.push("/guest")}
	}






	const login = async (
		username: string,
		password: string,
		save: boolean,
		url?: string,
		encrypted?:boolean
	) => {
		await setLoading(true);
		localStorage.removeItem("infoCache")
		localStorage.removeItem("xmlCache2")

		const encryptedPass=getCourseSettings(username,password,encrypted,url);


/*
you'd do it it in parallel

wherever you do a setGrades()
you'd also do in tandem, a setGradesCache() so they continously match up
could add a flag to see if it's changed so that you know if you need to refetch it upon a refresh

could cause some eroneous re-renders.

but actually it could work.


may be neater to reFactor grades obj to BE gradesCache and then create a seperate index prop to control which
one is the "active" one rather than maintain a whole "active" version as its own prop which is what grades effectively becomes now

refactor would be annoying as hell though. okay I'll do seperate for now and refactor later prob.




Also:

the settings modal is inconsitent. finals settings update live, letterScale and rounding don't
also the weights don't automagically change respectively yet
also exams / general full functionality and saving doesn't exist as a practical matter yet


the animation is janky now that there can be instantaneous switching

it's annoying and unuintuitive that switching from one marking period to the next on the same class
has no regard for moving classes, though, that was also how the og worked

optimization modal not done yet


it would probably be a good idea to show the final grade also on the Home Screen grades cards/table 




*/


		await StudentVue.login(url || districtURL, {
			username: username,
			password: password,
			encrypted:encrypted ||false
		},apiUrl)
			.then(async (res) => {
				const fetchedClient=res.client;
				let extraData:any={}
				for(let resp of res.responses){
					extraData={...extraData,...resp[1]} //combines all the extraData objs. lets later ones override
				}

				const isIPhone = /iPhone/.test(navigator.userAgent);
				if(isIPhone){
//window.location.href="https://apps.apple.com/us/app/grademelon/id6757350540";

					// createError("Grade Durian is better as an app!")

				}


				Cookies.set("token",extraData.token,{expires:5/(60*24)})
				setClient(fetchedClient);
				
				districts.forEach(district=>{
					if(district.parentVueUrl==districtURL){Cookies.set("districtURL",JSON.stringify(district),{expires:14})}
				});
				if (save) {
					localStorage.setItem("remember", "true");
					Cookies.set("username",username,{expires:7,secure:false,sameSite:"Lax"})
					let myTemp;
					if(!encrypted){
						myTemp=await encryptedPass;
					}
					else{myTemp=password}
				Cookies.set("password",myTemp,{expires:7})


				} else {
					localStorage.setItem("remember", "false");
					Cookies.remove("username");
					Cookies.remove("password");
					Cookies.remove("districtURL");
				}
				/*sigh. I could implement lazy loading here so that we do this inital fetch of no report period
				and display that and put up blockers for the finals elements that need the full gradesCache
				that get chagned asynchronossly via an additional useState hook call it loading2 or smthn

				but then there also needs to be handling for if the user immediately decides they want a different
				report period, cuz then it's most optimal to await the already fetching stuff. SO I guess I could
				make it a ref or memo or smthn so it only ever changes once cause after that intial load you're never
				gunna need to fetch all MP's at once again, the user can't ask for it in current design 
				*/


				//let g=parseGrades(gradebook[]) or smthn so its a list of them or whatever. 

				extraData.gradingScale.mode=fetchedClient.district=="https://md-mcps-psv.edupoint.com/Service/PXPCommunication.asmx" ? "mcps" : undefined
				res.responses[0][0].gradingScale=extraData.gradingScale;
				
				const freshCache = getCache(res.responses.map(resp=>resp[0]));
				setOriginalGradingScale(structuredClone(extraData.gradingScale.default));
				setGrades(freshCache);
				setMP(findCurrentPeriod(freshCache));

				// Load and apply saved user settings
				fetch(apiUrl + "/getSettings", {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ url: fetchedClient.district, userHash: fetchedClient.username })
				}).then(r => r.json()).then(result => {
					if (!result.status) return;
					const saved = result.settings;
					if (saved.showCountdown !== undefined) setShowCountdown(Boolean(saved.showCountdown));
				if (saved.highlightColor !== undefined) setHighlightColor(saved.highlightColor ?? null);
				if (saved.siteTitle !== undefined) setSiteTitle(saved.siteTitle ?? "");
				if (saved.primaryColor) { applyPalette(saved.primaryColor, true); applyColor(saved.primaryColor); }
					const cache: Cache = structuredClone(freshCache);
					for (const key in saved) {
						if (key === "default" || key === "mode" || key === "showCountdown" || key === "primaryColor" || key === "highlightColor") continue;
						for (const prop in saved[key]) {
							if (saved[key][prop] === false) saved[key][prop] = saved.default[prop];
						}
						saved[key] = initalizeFinals2(cache, saved, key);
					}
					for (const grade of cache) {
						grade.settings = saved;
						for (const ncourse of grade.courses) {
							ncourse.settings = saved[ncourse.identifier]
								? saved[ncourse.identifier]
								: initalizeFinals2(cache, saved, ncourse.identifier);
							reCalculateCourse(ncourse);
						}
					}
					setGrades(cache);
				}).catch(() => {});

				fetchedClient.schedule().then(([sched]) => {
					(fetchedClient as any).loadedSchedule = sched;
				}).catch(() => {});

				if(!gated&&(router.pathname=="/"||router.pathname=="/login")){router.push("/grades")}
				
				await setLoading(false);
				return true;
			})
			.catch((err) => {
				console.error("Login failed:", err);
				createError(err.message)
				setLoading(false);
			});

		return false;
	};




	async function getCourseSettings(username,password,encrypted,url){
				if(!encrypted){
						const result =await(await fetch(apiUrl + "/encryptPassword", {
							'method': 'POST',
							'headers': { 'Content-Type': 'application/json' },
							'body': JSON.stringify({ 'password': password })
						})).json()
						password=result.encryptedPassword

	}
	/*
				const settingsFetch=await (await fetch('https://studentvuelib-clean.up.railway.app/getSettings',{
					'method':'POST',
					'headers':{'Content-Type':'application/json'},
					'body':JSON.stringify({username:username,'password':password,url:url})
						

				})).json()


				if(settingsFetch.status){
					setCourseSettings(settingsFetch.settings)
				}
				else{
					setCourseSettings(false)
				}
*/
				return password
			}





	useEffect(()=>{
		const params = new URLSearchParams(window.location.search);
		if(params.get("guest")=="true"&&!client){
			guestLogin()
		}

	})
async function checkDonations(){
	const data = await (await fetch(apiUrl+"/checkSuppression",{'method':"POST","headers":{'content-type':'application/json'},'body':JSON.stringify({url:new URL(client.district).host,username:client.username})})).json()
	if(data.status){
		setDonation(data.data)
	}else{
		setDonation(false)
	}
}

	// useEffect(()=>{
	// 	//@ts-expect-error
	// 	if(!donation&&client&&!client?.guest){
	// 		checkDonations()
	// }
	// })
	useEffect(()=>{
		//@ts-expect-error
		if(!donation&&client&&!client?.guest){
			checkDonations()
	}
	},[client])


 


async function buildConcurrentCache(gu):Promise<SchoolsListType>{
	const initalFetch=await client.gradebook(null,gu)

	const remainder=await Promise.all(initalFetch[0].reportingPeriod.available.map(period=>{if(period.index==initalFetch[0].reportingPeriod.current.index){return initalFetch}else{return client.gradebook(period.index,gu)}}))
	
	let extraData:any={}
	for(let resp of remainder){
	extraData={...extraData,...resp[1]} //combines all the extraData objs. lets later ones override
	}
	const gradingScale=extraData.gradingScale;
	remainder[0][0].gradingScale=gradingScale
	const builtCache=getCache(remainder.map(remain=>remain[0]))
	const builtMp=findCurrentPeriod(builtCache)
	return {mp:builtMp,cache:builtCache,gu:gu}
}


useEffect(()=>{
	if(studentInfo?.schools?.length>0&&grades&&!schoolsList){
		const schoolsData=Promise.all(studentInfo.schools.map(async(school)=>({...await buildConcurrentCache(school.GU),name:school.name})))
		let xa;   
		schoolsData.then(data=>{xa=[{name:info.currentSchool,cache:grades,mp:mp,gu:null},...data].filter(school=>school.cache.every(markingPeriod=>markingPeriod.courses.length>0));    if(xa.length>1){
      setSchoolsList(xa);
    }})
	}

},[studentInfo,grades,schoolsList])



  useEffect(() => {
    const handleRouteChange = (url: string) => {
      if(url.includes("grades/")&&!isMediumOrLarger){
		scrollPos.current=window.scrollY;

	  }
    };

	const handleRouteNavigate = (url:string) => {
		if(url.includes("grades")&&!url.includes("grades/")&&!isMediumOrLarger){
			window.scrollTo(0,scrollPos.current)
		}
	}

    router.events.on("routeChangeStart", handleRouteChange);
	router.events.on("routeChangeComplete", handleRouteNavigate);
    return () => {
      router.events.off("routeChangeStart", handleRouteChange);
      router.events.off("routeChangeComplete", handleRouteNavigate);
    };


  }, [router]);

 

	useEffect(()=>{ //Hook responsible for fetching studentInfo
		if(client!==undefined&&studentInfo==undefined){
			if(localStorage.getItem("infoCache")!=undefined){ //temporarily re-enabling infoCache
				const cache=JSON.parse(localStorage.getItem("infoCache"));
				if(cache.user==client.username){
					setStudentInfo(cache.info);

//log login
 fetch(apiUrl + "/logLogin", {
	'method': 'POST',
	'headers': { 'Content-Type': 'application/json' },
	'body': JSON.stringify({ 'username': client.username,'schoolName':cache.info.currentSchool,url:districtURL})
})

					return

		


				}
			}


//vercel test2
			client.ChildList().then(([info])=>{
				setStudentInfo(info)
				localStorage.setItem("infoCache",JSON.stringify({user:client.username,info:info,url:districtURL}))


 
			}).catch(error=>{console.error("Child list failed, falling back to StudentInfo:", error);client.studentInfo().then(([info])=>{
				setStudentInfo(info);
				localStorage.setItem("infoCache",JSON.stringify({user:client.username,info:info}))


			}).catch(()=>{console.error("StudentInfo fallback failed")})
		
		})
		}
	},[client])

	useEffect(() => {
				const params = new URLSearchParams(window.location.search);
		const guest=params.get("guest")=="true"&&!client||router.pathname.includes("guest")

		var refURL: string="";
		async function doLogin(){
			await login(Cookies.get("username"),Cookies.get("password"),true,districtURL,true)}
		if(Cookies.get("districtURL")!=undefined&&districtURL==undefined){
			let cookieDistrict=JSON.parse(Cookies.get("districtURL"));
			if(districts.findIndex(district=>district.parentVueUrl==cookieDistrict.parentVueUrl)==-1){let temp=districts;temp.push(cookieDistrict);setDistricts(temp)}
			setDistrictURL(cookieDistrict.parentVueUrl);
			refURL=cookieDistrict.parentVueUrl;

		}else{if(districtURL==undefined){setDistrictURL("https://md-mcps-psv.edupoint.com")}}
		if(!gated&&client===undefined&&Cookies.get("username")!=undefined&&Cookies.get("password")!=undefined&&districtURL!==undefined){
			doLogin();
			
		}else{if(!gated&&client===undefined&&(!noShowNav.includes(router.pathname)||router.pathname=="/")&&!refURL&&!guest){router.push("/login")}}
	}, [client,districtURL]);

	function createError(message:string){
		console.log("Verbose Error: ",message)
		const preSets={"upgraded":"API Token Expired, come back soon?","incorrect":"Username or Password is Incorrect","invalid":"Username or Password is Incorrect","load failed":"Network Error","failed to fetch":"Network Error: Try Again Later","socket":"Network Error","upstream error":"Synergy Unavailable (405): Try Again Later"};
		for(let key in preSets){
			if(message.toLowerCase().includes(key)){var message=preSets[key];break}
		}
		setToasts((toasts) => [...toasts, { title: message, type: "error" }]);
			setTimeout(() => {
				setToasts((toasts) => toasts.slice(1));
			}, 5000);
	}

const logout = async () => {
	await Cookies.remove("password");
	localStorage.removeItem("mps")
	localStorage.removeItem("infoCache")
	localStorage.removeItem("xmlCache2")
	await router.push("/login");
	
	setSchoolsList(undefined)
	setSchoolIndex(0)
	setClient(undefined);
	setGrades(undefined);
	
	
	 setStudentInfo(undefined);
	
	if(localStorage.getItem("remember")=="false"){Cookies.remove("username")}
	//Cookies.remove("districtURL");

};

	// useEffect(() => {
	// 	let username = localStorage.getItem("username");
	// 	let password = localStorage.getItem("password");
	// 	let remember = localStorage.getItem("remember");
	// 	let storedDistrictURL = localStorage.getItem("districtURL");
	// 	storedDistrictURL && setDistrictURL(storedDistrictURL);
	// 	if (remember === "true" && username && password && storedDistrictURL) {
	// 		login(username, password, true, districtURL);
	// 	}
	// }, []);

	if (gated) return (
		<Flowbite theme={{ usePreferences: false }}>
			<Head><title>Grade Durian</title></Head>
			<div className="min-h-screen bg-gray-50 dark:bg-gray-900 relative">
				<div className="absolute top-4 right-4">
					<DarkModeToggle />
				</div>
				<div className="flex flex-col items-center justify-center text-center min-h-screen">
					<motion.h1
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.15, duration: 0.4 }}
						className="text-5xl font-bold tracking-tight md:text-5xl xl:text-6xl mb-3 animated-gradient-text"
					>
						Grade Durian
					</motion.h1>
					<motion.p
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.25, duration: 0.4 }}
						className="text-xl font-medium tracking-tight md:text-2xl dark:text-white mb-10 text-gray-600"
					>
						Stay in control of your grades.
					</motion.p>
					<LogoButton openInFrame={openInFrame} basePath={process.env.NEXT_PUBLIC_BASE_PATH} logoSrc={logoSrc} />
				</div>
			</div>
		</Flowbite>
	);

	return (
		<Flowbite theme={{ usePreferences: false }}>
			<Head>
				<title>{(!noShowNav.includes(router.pathname) && siteTitle) || "Grade Durian"}</title>
				</Head>
			<div className="fixed p-5 z-[60]">
				{toasts.map(({ title, type }, i) => (
					<div className="mb-5 z-50" key={i}>
						<Toast>
							<div
								onClick={() =>
									setToasts((prev) => {
										prev.splice(i, 1);
										return prev;
									})
								}
								className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-500 dark:bg-red-800 dark:text-red-200"
							>
								<HiX className="h-5 w-5" />
							</div>
							<div className="ml-3 text-sm font-normal">{title}</div>
							<Toast.Toggle />
						</Toast>
					</div>
				))}
			</div>
		
			<div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
				<Topbar studentInfo={noShowSidebar.includes(router.pathname) ? undefined : studentInfo} logout={logout} client={noShowSidebar.includes(router.pathname) ? undefined : client} logoSrc={logoSrc} siteTitle={noShowNav.includes(router.pathname) ? "" : siteTitle} />
				<div>
					{(!client || noShowSidebar.includes(router.pathname)) && (
					<MotionConfig transition={springConfig}>
						<AnimateSharedLayout>
							<Component
								{...pageProps}
								districtURL={districtURL}
								setDistrictURL={setDistrictURL}
								login={login}
								client={client}
								grades={grades}
								setGrades={setGrades}
								setToasts={setToasts}
								loading={loading}
								mp={mp}
								setMP={setMP}
								createError={createError}
								districts={districts}
								setDistricts={setDistricts}
								isMediumOrLarger={isMediumOrLarger}
								timestamp={timestamp}
								setTime={setTime}
								width={width}
								modalBg={modalBg}
								setModalBg={setModalBg}
						 		scrollPos={scrollPos}
								schoolsList={schoolsList}
								setSchoolsList={setSchoolsList}
								schoolIndex={schoolIndex}
								setSchoolIndex={setSchoolIndex}
								guestLogin={guestLogin}
								donation={donation}
								showCountdown={showCountdown}
								highlightColor={highlightColor}
								setHighlightColor={setHighlightColor}
								setShowCountdown={setShowCountdown}
								siteTitle={siteTitle}
								setSiteTitle={setSiteTitle}
								originalGradingScale={originalGradingScale}
								onColorPreview={applyColor}

							/>
						</AnimateSharedLayout>
					</MotionConfig>
					)}

					{client && isMediumOrLarger && !noShowSidebar.includes(router.pathname) && (
						<div className="pb-16 md:pb-0">
							<div className="flex overflow-x-auto">
								<SideBar 						
										client={client}
										timestamp={timestamp}
										setTime={setTime}
										settingsModal={settingsModal}
										setSettingsModal={setSettingsModal}
										setModalBg={setModalBg}
										studentInfo={studentInfo} logout={logout}/>
								<MotionConfig transition={springConfig}>
								<AnimateSharedLayout>
									<Component
										{...pageProps}
										districtURL={districtURL}
										setDistrictURL={setDistrictURL}
										client={client}
										login={login}
										grades={grades}
										setGrades={setGrades}
										setToasts={setToasts}
										loading={loading}
										mp={mp}
										setMP={setMP}
										createError={createError}
										districts={districts}
										setDistricts={setDistricts}
										isMediumOrLarger={isMediumOrLarger}
										timestamp={timestamp}
										setTime={setTime}
										settingsModal={settingsModal}
										setSettingsModal={setSettingsModal}
										width={width}
										scrollPos={scrollPos}
										modalBg={modalBg}
										setModalBg={setModalBg}
										schoolsList={schoolsList}
										setSchoolsList={setSchoolsList}
										schoolIndex={schoolIndex}
										setSchoolIndex={setSchoolIndex}
							 			guestLogin={guestLogin}
										donation={donation}
											showCountdown={showCountdown}
								highlightColor={highlightColor}
								setHighlightColor={setHighlightColor}
											setShowCountdown={setShowCountdown}
								siteTitle={siteTitle}
								setSiteTitle={setSiteTitle}
								originalGradingScale={originalGradingScale}
								onColorPreview={applyColor}
									/>
								</AnimateSharedLayout>
								</MotionConfig>
							</div>
						</div>
					)}
					{client && !isMediumOrLarger && !noShowSidebar.includes(router.pathname) && (
						<div className="pb-16 md:pb-0">
							<div className="md:hidden">
								<MotionConfig transition={reducedMotionConfig}>
								<AnimateSharedLayout>
									<Component
										{...pageProps}
										districtURL={districtURL}
										client={client}
										login={login}
										setClient={setClient}
										grades={grades}
										setGrades={setGrades}
										setToasts={setToasts}
										loading={loading}
										mp={mp}
										setMP={setMP}
										createError={createError}
										districts={districts}
										setDistricts={setDistricts}
										isMediumOrLarger={isMediumOrLarger}
										settingsModal={settingsModal}
										setSettingsModal={setSettingsModal}
										timestamp={timestamp}
										setTime={setTime}
										width={width}
										modalBg={modalBg}
										setModalBg={setModalBg}
										scrollPos={scrollPos}
										schoolsList={schoolsList}
										setSchoolsList={setSchoolsList}
										schoolIndex={schoolIndex}
										setSchoolIndex={setSchoolIndex}
										guestLogin={guestLogin}
										donation={donation}
											showCountdown={showCountdown}
								highlightColor={highlightColor}
								setHighlightColor={setHighlightColor}
											setShowCountdown={setShowCountdown}
								siteTitle={siteTitle}
								setSiteTitle={setSiteTitle}
								originalGradingScale={originalGradingScale}
								onColorPreview={applyColor}
									/>
								</AnimateSharedLayout>
								</MotionConfig>
								<div className="px-4 fixed bottom-5 w-full">
									<MobileBar client={client} />
								</div>
								{modalBg && <div style={{opacity:0.1}} className="fixed inset-0 bg-gray-500 z-0"></div>}
							</div>
						</div>
					)}
				</div>
			</div>
		</Flowbite>
	);
}

export default MyApp;
