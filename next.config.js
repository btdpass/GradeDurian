const withPwa = require("next-pwa")({
	dest: "public",
	register: true,
	skipWaiting: true,
});
const { basePath } = require("./site.config");

/** @type {import('next').NextConfig} */
const nextConfig = withPwa({
	swcMinify: false,
	reactStrictMode: true,
	output: 'export',
	basePath,
	trailingSlash: true,
	images: {
		unoptimized: true,
	},
	env: {
		NEXT_PUBLIC_BASE_PATH: basePath,
		NEXT_PUBLIC_GITHUB_REPO: process.env.GITHUB_REPOSITORY || '',
	},
});

module.exports = nextConfig;
