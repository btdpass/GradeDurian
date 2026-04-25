import Document, { Html, Head, Main, NextScript } from "next/document";

export default class MyDocument extends Document {
	render() {
		return (
			<Html>
				<Head>
          <link rel="manifest" href={`${process.env.NEXT_PUBLIC_BASE_PATH}/manifest.json`} />
					<link rel="icon" href={`${process.env.NEXT_PUBLIC_BASE_PATH}/favicon.ico`} />
					<link rel="apple-touch-icon" href={`${process.env.NEXT_PUBLIC_BASE_PATH}/assets/icon.png`} />
				</Head>
				<body>
					<script dangerouslySetInnerHTML={{ __html: `
						(function() {
							try {
								var theme = document.cookie.match(/theme=([^;]+)/);
								var isDark = theme ? theme[1] === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
								if (isDark) document.documentElement.classList.add('dark');
								document.documentElement.style.backgroundColor = isDark ? '#111827' : '#f9fafb';
							} catch(e) {}
						})();
					`}} />
					<Main />
					<NextScript />
				</body>
			</Html>
		);
	}
}
