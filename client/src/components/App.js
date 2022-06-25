import React, { useEffect } from 'react'
import "../reset.css"
import ContextProvider from './ContextProvider'

export default function App() {

	//test server connection
	useEffect(() => {
		async function fetchGet() {
			const getResponse = await fetch("/api/test", {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json'
				}
			})

			if (!getResponse) {
				console.error("failed to get from server")
			}

			if (getResponse.ok) {
				console.log(await getResponse.text())
				console.log(getResponse)
			}
		}

		async function fetchPost() {
			const postResponse = await fetch("/api/test", {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(
					{
						postMessage: "testing post",
					}
				)
			})

			if (!postResponse) {
				console.error("failed to post to server")
			}

			if (postResponse.ok) {
				console.log(await postResponse.text())
				console.log(postResponse)
			}
		}

		fetchGet()
		fetchPost()
	}, [])

	return (
		<ContextProvider>
			<h1>React Template</h1>
		</ContextProvider>
	)
}
