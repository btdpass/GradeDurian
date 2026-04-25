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
					<Main />
					<NextScript />
				</body>
			</Html>
		);
	}
}
