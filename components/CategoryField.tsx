import React from "react";

interface CategoryFieldProps {
	children: any;
	value: number;
	onChange: any;
}

export default function CategoryField({ children, value, onChange }: CategoryFieldProps) {
	return (
		<select
			onChange={onChange}
			value={value}
			className="w-full bg-transparent border-none text-sm text-gray-500 dark:text-gray-400 focus:ring-0 focus:outline-none cursor-pointer p-0"
		>
			{children}
		</select>
	);
}
