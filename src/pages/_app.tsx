import "@/styles/globals.css"
import type { AppProps } from "next/app"

function MyApp({ Component, pageProps }: AppProps) {
  return <Component className='overscroll-behavior: none' {...pageProps} />
}

export default MyApp
