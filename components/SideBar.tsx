import React, { useState, useEffect } from "react";
import { Sidebar } from "flowbite-react";
import { useRouter } from "next/router";
import {
	AiOutlineOrderedList,
	AiOutlineCalendar,
	AiOutlineBook,
} from "react-icons/ai";
import { FiLogOut } from "react-icons/fi";
import { IoDocumentTextOutline } from "react-icons/io5";
import { BsGear, BsTable } from "react-icons/bs";
import { TbLayoutGrid } from "react-icons/tb";
import { BsQuestionLg } from "react-icons/bs";
import Link from "next/link";

interface NavProps {
	studentInfo: any;
	logout: () => void;
	setTime:(time:number)=>void;
	timestamp:number;
	settingsModal:boolean;
	setSettingsModal:(b:boolean)=>void
	setModalBg:(b:boolean)=>void
	client:any

}

export default function SideBar({ studentInfo, logout,
	setTime,
	timestamp,settingsModal,setSettingsModal,setModalBg,client
	 }: NavProps) {
	const router = useRouter();

	return (
		<div className="flex w-fit flex-col items-center">
		<div className="w-fit h-full py-10 pl-10 sticky top-16 hidden md:block max-w-min">
			<aside className="w-64" aria-label="Sidebar">
				<div className="overflow-y-auto py-4 px-3 bg-white rounded-lg dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700">
					<ul className="space-y-2">
						<li>
							<Link
								href="/schedule"
								className="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
							>
								<AiOutlineOrderedList className="flex-shrink-0 w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
								<span className="ml-3">Schedule</span>
							</Link>
						</li>
						<li>
							<Link
								href={client.guest ? "/guest" : "/grades"}
								className="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
							>
								<AiOutlineBook className="flex-shrink-0 w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
								<span className="flex-1 ml-3 whitespace-nowrap">Gradebook</span>
							</Link>
						</li>
						<li>
							<Link
								href="/attendance"
								className="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
							>
								<AiOutlineCalendar className="flex-shrink-0 w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
								<span className="flex-1 ml-3 whitespace-nowrap">
									Attendance
								</span>
							</Link>
						</li>
						<li>
							<Link
								href="/documents"
								className="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
							>
								<IoDocumentTextOutline className="flex-shrink-0 w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
								<span className="flex-1 ml-3 whitespace-nowrap">Documents</span>
							</Link>
						</li>
						<li>
							<Link
								href="/faq"
								className="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
							>
								<svg className="flex-shrink-0 w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" fill="currentColor" viewBox="1 0 14 16"><path d="M3 4.075a.423.423 0 0 0 .43.44H4.9c.247 0 .442-.2.475-.445.159-1.17.962-2.022 2.393-2.022 1.222 0 2.342.611 2.342 2.082 0 1.132-.668 1.652-1.72 2.444-1.2.872-2.15 1.89-2.082 3.542l.005.386c.003.244.202.44.446.44h1.445c.247 0 .446-.2.446-.446v-.188c0-1.278.487-1.652 1.8-2.647 1.086-.826 2.217-1.743 2.217-3.667C12.667 1.301 10.393 0 7.903 0 5.645 0 3.17 1.053 3.001 4.075zm2.776 10.273c0 .95.758 1.652 1.8 1.652 1.085 0 1.832-.702 1.832-1.652 0-.985-.747-1.675-1.833-1.675-1.04 0-1.799.69-1.799 1.675z"/></svg>
								<span className="flex-1 ml-3 whitespace-nowrap">
									FAQ & Info
								</span>
							</Link>
						</li>
						<li>
							<a
								onClick={logout}
								className="cursor-pointer flex items-center p-2 text-base font-normal text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
							>
								<FiLogOut className="flex-shrink-0 w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
								<span className="flex-1 ml-3 whitespace-nowrap">Logout</span>
							</a>
						</li>
					</ul>
					{(router.pathname === "/grades" || router.pathname.includes("/grades") || router.pathname ==="/guest" || router.pathname.includes("/guest") ) && (
						<ul className="pt-4 mt-4 space-y-2 border-t border-gray-200 dark:border-gray-700">
							<li>
								<div
									onClick={()=>{setSettingsModal(true);setModalBg(true)}}
									className="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
								>
									<BsGear className="flex-shrink-0 w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
									<span className="flex-1 ml-3 whitespace-nowrap">Settings</span>
								</div>
							</li>
							{router.pathname==="/grades" && 
							<React.Fragment>
							<li>
								<Link
									href="?view=card"
									className="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg transition duration-75 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white group"
								>
									<TbLayoutGrid className="flex-shrink-0 w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
									<span className="ml-3">Card View</span>
								</Link>
							</li>

							<li>
								<Link
									href="?view=table"
									className="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg transition duration-75 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white group"
								>
									<BsTable className="flex-shrink-0 w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
									<span className="ml-3">Table View</span>
								</Link>
							</li>
							</React.Fragment>
	 						}
						</ul>
					)}
				</div>
			</aside>
		</div>
		</div>
	);
}
