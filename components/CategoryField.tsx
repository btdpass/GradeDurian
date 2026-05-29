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
			className="block w-full p-2 text-sm text-gray-900 bg-white rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
		>
			{children}
		</select>
	);
}
