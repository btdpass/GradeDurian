import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Modal, Spinner } from "flowbite-react";
import { BiSearchAlt } from "react-icons/bi";
import Head from "next/head";
import StudentVue from "studentvue";
import Script from "next/script";

import Cookies from "js-cookie";
import Link from "next/link";
import ClientOnly from "../components/ClientOnly";

interface LoginProps {
	districtURL: string;
	setDistrictURL: any;
	client: any;
	login: (username: string, password: string, save: boolean) => any;
	guestLogin: ()=>void;
	setToasts: any;
	loading: boolean;
	createError:(message:string)=>void;
	setDistricts:any;
	districts:{
		address: string;
		name: string;
		parentVueUrl: string;
		zipcode?: string;
	}[];
}

export default function Login({
	login,
	client,
	districtURL,
	setDistrictURL,
	setToasts,
	loading,
	createError,setDistricts,districts,guestLogin
}: LoginProps) {
	const router = useRouter();
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [checkbox, setCheckbox] = useState(false);
	const [showModal, setShowModal] = useState(false);
	const [zipCode, setZipCode] = useState("");
	
	const [trouble, setTrouble] = useState(false);


	useEffect(()=>{
		if(districts[districts.findIndex((d) => d.parentVueUrl === districtURL)
									]?.address.includes(" GA ")){
								createError("Grade Durian is unavailable in Georgia")
									}

        if(districtURL!="https://md-mcps-psv.edupoint.com"&&districtURL!=undefined){ // disabled cuz i think support is strong enough now
		
							//	window.location.assign("https://old.grademelon.org");

									}

	},[districtURL])


	const handleSubmit = async (e) => {
		e.preventDefault();
		if(username==""&&password==""){
			guestLogin();
			return
		}

		let success = await login(username, password, checkbox);
		if (!success) {
			setTrouble(true);
		}
		await setPassword("");
		if (success) {
			await setUsername("");
		}
	};


	useEffect(() => {
		if (localStorage.getItem("remember") === "true") {
			setCheckbox(true);
		}
    if (Cookies.get("username")!=undefined){
        setUsername(Cookies.get("username"))
        }
	}, []);

	const findDistricts = async () => {
		StudentVue.findDistricts(zipCode)
			.then((res) => {
				if(res.length===0){createError("No districts found for that zip code");return}
				else{
				setDistricts(res);
				setDistrictURL(res[0].parentVueUrl)}
			})
			.catch((err) => {
				console.error("District search failed:", err);
				createError(err.message)
			});
	};

	return (
		<div>
			<Head>
				<title>Login</title>
			</Head>
			<ClientOnly>
			<Modal show={showModal} onClose={() => setShowModal(false)}>
				<Modal.Header>Choose School District</Modal.Header>
				<Modal.Body>
					<div>
						<div>
							<label
								htmlFor="email"
								className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
							>
								Zip Code
							</label>
							<div className="flex gap-2">
								<input
									type="text"
									value={zipCode}
									onChange={(e) => setZipCode(e.target.value)}
									className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
									placeholder="20901"
									required
								/>
								<button
									onClick={findDistricts}
									className="text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-2.5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
								>
									<BiSearchAlt size="1.2rem" />
								</button>
							</div>
							<div>
								<label
									htmlFor="countries"
									className="block my-2 text-sm font-medium text-gray-900 dark:text-white"
								>
									School Districts
								</label>
								<select
									id="districts"
									value={districtURL}
									onChange={(e) => {setDistrictURL(e.target.value);}}
									className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
								>
									{districts.map((district, i) => (
										<option key={i} value={district.parentVueUrl}>
											{district.name}
										</option>
									))}
								</select>
							</div>
						</div>
					</div>
				</Modal.Body>
				<Modal.Footer>
					<button
						onClick={() => setShowModal(false)}
						className="rounded-lg bg-gray-500 px-2.5 py-2.5 text-center text-xs sm:text-sm font-medium text-white hover:bg-gray-600 focus:outline-none focus:ring-4 focus:ring-gray-300 dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-800"
					>
						Close
					</button>
				</Modal.Footer>
			</Modal>
			</ClientOnly>
			<div className="flex flex-col items-center justify-center pb-6 py-8 px-6 mx-auto md:pt-28 lg:pb-0">
				<div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
					<div className="p-6 space-y-4 md:space-y-6 sm:p-8">
			 
						<h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
							Sign in to your account
						</h1>
			
				 
						<form className="space-y-4 md:space-y-6">
							<div>
								<label
									htmlFor="email"
									className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
								>
									Username
								</label>
								<input
									type="text"
									value={username}
									disabled={districts[districts.findIndex((d) => d.parentVueUrl === districtURL)
									]?.address.includes(" GA ")}
									onChange={(e) => setUsername(e.target.value)}
									className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
									placeholder="123456"
									required
								/>
							</div>
							<div>
								<label
									htmlFor="password"
									className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
								>
									Password
								</label>
								<input
									type="password"
									disabled={districts[districts.findIndex((d) => d.parentVueUrl === districtURL)
									]?.address.includes(" GA ")}
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									placeholder="••••••••"
									className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
									required
								/>
							</div>

							<div className="flex items-center justify-between">
								<div className="flex items-start">
									<div className="flex items-center h-5">
										<input
											id="remember"
											aria-describedby="remember"
											type="checkbox"
											checked={checkbox}
											onChange={(e) => setCheckbox(e.target.checked)}
											className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800"
											required
										/>
									</div>

									<div className="ml-3 text-sm">
										<label
											htmlFor="remember"
											className="text-gray-500 dark:text-gray-300"
										>
											Remember me
										</label>
									</div>
								</div>
							</div>
							<button
								disabled={loading}
								type="button"
								onClick={() => setShowModal(true)}
								className="w-full text-black dark:text-white bg-gray-200 hover:bg-gray-300 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-800"
							>
								{
									districts[
										districts.findIndex((d) => d.parentVueUrl === districtURL)
									]?.name
								}
							</button>
							<button
								onClick={handleSubmit}
								disabled={loading||districts[districts.findIndex((d) => d.parentVueUrl === districtURL)
									]?.address.includes(" GA ")}
								type="submit"
								className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 p-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
							>
								{(username==""&&password=="") ? "Sign in as Guest" : "Sign in"}
								{loading && (
									<div className="pl-4 inline-block">
										<div style={{color:"rgb(var(--primary-500))"}} className="[&_svg]:fill-primary-500"><Spinner color="warning" /></div>
									</div>
								)}
							</button>
							{trouble && (
								<div
								className="flex-col space-y-2"
								>
								<p className="text-center text-sm dark:text-gray-100">
									Having trouble logging in? Make sure you can login{" "}
									<a
										target="blank"
										href={districtURL}
										className="text-primary-500"
									>
										here
									</a>
								</p>

								<p className="text-center text-sm dark:text-gray-100">
									{"Still won't work? Try re-setting your password "}
									<a
										target="blank"
										href={districtURL+"/PXP2_Password_Help.aspx"}
										className="text-primary-500"
									>
										here
									</a>
								</p>
							</div>
							)}
					 		 
						</form>
					</div>
				</div>
				<Link href="/guest" style={{display:"none"}}>Login As Guest</Link>

			</div>
		</div>
	);
}
