import React, { useState, useEffect,useRef } from "react";
import { DarkThemeToggle } from "flowbite-react";
import Link from "next/link";
import { FiLogOut } from "react-icons/fi";
import { BsQuestionLg } from "react-icons/bs";
import { RiCloseCircleLine } from "react-icons/ri";
import { MdOutlinePrivacyTip } from "react-icons/md";
import Cookies from "js-cookie";
import dynamic from "next/dynamic";
import {useRouter} from "next/router";

interface TopBarProps {
	studentInfo: any;
	client: any;
	logout: () => void;
}

const DarkModeToggle = dynamic(() => import('../components/Toggle'), {
	ssr: false,
  });




export default function TopBar({ studentInfo, logout, client }: TopBarProps) {
	const [dropdown, setDropdown] = useState(false);
	const [advertisePWA, setAdvertisePWA] = useState(false);
	const [advertiseDiscord, setAdvertiseDiscord] = useState(false);
	const [advertiseBrowser,setAdvertiseBrowser]=useState(false);
	const [partner,setPartner]=useState(false);
	const [fade,setFade]=useState(false)
	const [closed,setClosed]=useState(false);
	const router = useRouter();
	const elementRef=useRef(null)
	const animationRef = useRef(null);
	const opacityRef = useRef(200);

	const fadeTime=20000

	useEffect(() => {
	const ua = window.navigator.userAgent || "";
	const isChromebook = /\bCrOS\b/i.test(ua);
		if (!window.matchMedia("(display-mode: standalone)").matches&&!isChromebook) {
			if (localStorage.getItem("advertisePWA") === null&&(Number(localStorage.getItem('pwaCount'))<10||localStorage.getItem('pwaCount')==null)) {
				setAdvertisePWA(true);
				if(localStorage.getItem('pwaCount')==null){localStorage.setItem('pwaCount','0')}
				else{
					localStorage.setItem('pwaCount',(Number(localStorage.getItem('pwaCount'))+1).toString())
				}
				//localStorage.setItem("advertisePWA", "true");
			}
		}
	}, []);

	useEffect(() => {
	const ua = window.navigator.userAgent || "";
	const isChromebook = /\bCrOS\b/i.test(ua);
		let m=localStorage.getItem("advertiseDiscord")
		let n=localStorage.getItem("disCount");
			if ((m=== null&&(Number(n)<10||n==null))&&!isChromebook) {
				setAdvertiseDiscord(true);
				if(n==null){localStorage.setItem('disCount','0')}
				else{
					localStorage.setItem('disCount',(Number(n)+1).toString())
				}
				//localStorage.setItem("advertisePWA", "true");
			}

	


			if (navigator.userAgent.includes('Instagram') === true) {
				setAdvertiseBrowser(true);
				
			}
		
	}, []);


	const fadeOut = () => {
try{
		if(opacityRef.current ==200){
			opacityRef.current=100;
			elementRef.current.style.opacity=1
		}

		if (opacityRef.current <= 0) {
		  cancelAnimationFrame(animationRef.current);
			setPartner(false)
		  return;
		}
	  
		// Decrease by 1 every frame (~16.7ms at 60fps)
		// To take 10 seconds, we need to decrease by 0.167 per frame
		// (100 / (10 * 60))
		opacityRef.current -= 0.167;
		
		if (elementRef.current) {
		  elementRef.current.style.opacity = opacityRef.current / 100;
		}
	  
		animationRef.current = requestAnimationFrame(fadeOut);
	  }catch(error){console.error("Ad animation error:", error)}};

	useEffect(()=>{
		/*
		if (Cookies.get("partner") == undefined&&["/faq","/"].includes(router.pathname)) {
			setPartner(true);
			opacityRef.current=200
			

			
		}
		else{setPartner(false)}


*/
	},[router])


	useEffect(()=>{
		if(partner)fadeOut();
	},[partner])




	const closeAdvertisePWA = () => {
		setAdvertisePWA(false);
		localStorage.setItem("advertisePWA", "false");
	};


	const closePartner = () => {
		setPartner(false);
		Cookies.set("partner","false",{expires:14})
	};

	const closeAdvertiseDiscord = () => {
		setAdvertiseDiscord(false);
		localStorage.setItem("advertiseDiscord", "false");
	};


	return (
		<div className="fixed top-0 w-full z-50">
			{/* Main nav - always visible */}
			<nav className="bg-white border-gray-200 px-2 sm:px-4 py-2.5 rounded dark:bg-gray-800 relative z-10">
				<div className="flex flex-wrap justify-between items-center">
					<Link href={client ? "/grades" : "/"} className="flex items-center">
						<img
							src={`${process.env.NEXT_PUBLIC_BASE_PATH}/assets/logo.png`}
							className="mr-3 h-6 sm:h-9"
							alt="Grade Durian Logo"
						/>
						<span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">
							Grade Durian
						</span>
					</Link>
					<div className="flex items-center md:order-2 gap-2">
							<div>
								<DarkModeToggle />
							</div>
							{studentInfo && (
								<div
									tabIndex={100}
									onBlur={(e) => {
										const target = e.currentTarget;

										requestAnimationFrame(() => {
											if (!target.contains(document.activeElement)) {
												setDropdown(false);
											}
										});
									}}
								>
									<button
										type="button"
										className="flex mr-3 text-sm bg-gray-800 rounded-full md:mr-0 focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
										onClick={() => setDropdown(!dropdown)}
									>
										<span className="sr-only">Open user menu</span>
										<img
											className="w-10 h-10 object-cover rounded-full"
											src={
												studentInfo?.photo
													? `data:image/png;base64,${studentInfo.photo}`
													: `${process.env.NEXT_PUBLIC_BASE_PATH}/assets/default-avatar.svg`
											}
											alt="User Icon"
										/>
									</button>

									{dropdown && (
										<div className="top-10 right-4 absolute z-30 my-4 text-base list-none bg-white rounded divide-y divide-gray-100 shadow dark:bg-gray-700 dark:divide-gray-600">
											<div className="py-3 px-4">
												<span className="block text-sm text-gray-900 truncate dark:text-white">
													{studentInfo?.student.name}
												</span>
												<span className="block text-sm font-medium text-gray-500 truncate dark:text-gray-400">
													{studentInfo?.currentSchool}
												</span>
											</div>
											<ul className="py-1" aria-labelledby="user-menu-button">
												<li>
													<Link
														href="/faq"
														onClick={() => setDropdown(false)}
														className="flex gap-2 items-center cursor-pointer py-2 px-4 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
													>
														<BsQuestionLg /> FAQ & Info
													</Link>
												</li>
											</ul>
																						<ul className="py-1" aria-labelledby="user-menu-button">
												<li>
													<Link
														href="/privacy/web"
														onClick={() => setDropdown(false)}
														className="flex gap-2 items-center cursor-pointer py-2 px-4 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
													>
														<MdOutlinePrivacyTip /> Privacy Policy
													</Link>
												</li>
											</ul>
											<ul className="py-1" aria-labelledby="user-menu-button">
												<li>
													<a
														onClick={() => {
															setDropdown(false);
															logout();
														}}
														className="flex gap-2 items-center cursor-pointer py-2 px-4 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
													>
														<FiLogOut /> Log out
													</a>
												</li>
											</ul>
										</div>
									)}
								</div>
							)}
						</div>
					</div>
				</nav>

			<div className="absolute top-0 left-0 w-full z-40">
				{!advertiseBrowser && partner && (
					<div ref={elementRef} className={`w-full bg-primary-11 px-4 py-3 text-white bg-opacity-90`}>
						<p className="text-center text-sm font-medium flex gap-2 justify-center items-center">
							<img src={`${process.env.NEXT_PUBLIC_BASE_PATH}/assets/partner.webp`} alt="" />
							<Link
								onClick={closePartner}
								href="https://klinn.works/"
								className="underline decoration-2 pl-1"
							>
								Find internships, research programs, competitions and more with Klinn!
							</Link>
							{/*
							<button onClick={closePartner}>
								<RiCloseCircleLine className="inline-block" size="1.1rem" />
							</button>*/}
						</p>
					</div>
				)}

				{!advertiseBrowser && !partner && advertisePWA && client && (
					<div className="w-full bg-primary-600 px-4 py-3 text-white bg-opacity-90">
						<p className="text-center text-sm font-medium flex gap-2 justify-center">
							<span>
								Want to use Grade Durian as an app?
								<Link
									onClick={() => setAdvertisePWA(false)}
									className="underline decoration-2 pl-1"
									href="/faq?refer=app"
								>
									Check out how!
								</Link>
							</span>
							<button onClick={closeAdvertisePWA}>
								<RiCloseCircleLine className="inline-block" size="1.1rem" />
							</button>
						</p>
					</div>
				)}

				{false && !advertiseBrowser && !advertisePWA && advertiseDiscord && client && (
					<div className="w-full bg-primary-600 px-4 py-3 text-white bg-opacity-90">
						<p className="text-center text-sm font-medium flex gap-2 justify-center ">
							<span>
								Want to contribute?
								<Link
									onClick={() => setAdvertiseDiscord(false)}
									className="underline decoration-2 pl-1"
									href="https://discord.gg/nwRs8WcQGc"
								>
									Join the Discord!
								</Link>
							</span>
							<button onClick={closeAdvertiseDiscord}>
								<RiCloseCircleLine className="inline-block" size="1.1rem" />
							</button>
						</p>
					</div>
				)}

				{advertiseBrowser && !closed && (
					<div className="w-full bg-primary-600 px-4 py-3 text-white bg-opacity-90 ">
						<p className="text-center text-sm font-medium flex gap-2 justify-center">
							<span>
								You&apos;re viewing in Instagram!
								<p className="underline decoration-2 pl-1">
									Try it in your browser!
								</p>
							</span>
							<button onClick={() => setClosed(true)}>
								<RiCloseCircleLine className="inline-block" size="1.1rem" />
							</button>
						</p>
					</div>
				)}
			</div>
		</div>
	);
}