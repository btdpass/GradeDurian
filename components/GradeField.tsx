import React, { useState, useRef } from "react";

interface GradeFieldProps {
	value: number;
	onChange: any;
	onBlur?:any;
}

export default function GradeField({ value, onChange,onBlur=()=>{} }: GradeFieldProps) {
	const [focus, setFocus] = useState(false);
	const [valasString, setValasString] = useState(value.toString());
	const ref = useRef(null);

	const onFocus = async () => {
		setValasString(value.toString());
		await setFocus(true);
		await ref.current.focus();
	};

	const onUpdate = async (e) => {
		setValasString(e.target.value);
		await onChange(e);
	};

	async function onBlurFunc(e){
		await onBlur(e);
	}


	return (
		<div
			onClick={onFocus}
			onBlur={() => {
				setTimeout(()=>{
					setFocus(false)
				},100);
				
			}}
			className="cursor-pointer"
		>
			{!focus ? (
				<p className="py-2">
				{!isNaN(value) ? value : "NG"}
				</p>
			) : (
				<input
					ref={ref}
					type="number"
					value={valasString}
					onChange={onUpdate}
					onBlur={(e)=>onBlurFunc(e)}
					className="w-12 inline-block text-lg bg-gray-50 border-none bg-transparent p-2 md:p-1 text-gray-900 sm:text-xs rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
				/>
			)}
		</div>
	);
}
