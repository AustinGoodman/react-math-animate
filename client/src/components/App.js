import "../reset.css"
import React, { useEffect, useRef, useState } from 'react'
import AMath from "./AMath"

export default function App() {
	//use these math strings to see all math symbols transition in from nothing
	const simpleTransitionStrings = [
		String.raw`z(x + y)`,
		String.raw`zx + zy`
	]

	//use these math strings to see some math symbols transition to a new line from the previous line
	const complexTransitionStrings = [
		String.raw`\props{toid: "z"}{z}(x+y)`,
		String.raw`\props{fromid: "z"}{z}x+\props{fromid: "z"}{z}y`
	]

	//change this to see the difference between the simple transition and the complex transition
	const mathStringsToUse = complexTransitionStrings

	//stateful variable holding the currently active math string
	const [math, setMath] = useState(mathStringsToUse[0])

	//click anywhere to start the transition 
	//YOU MUST WAIT A MOMENT FOR THE INITIAL TRANSITION TO FINISH (fix for this is on the backburner)
	useEffect(() => {
		window.addEventListener("click", e => {
			setMath(mathStringsToUse[1])
		})
	}, [])

	return (
		<div
			style={{
				position: "fixed", 
				width: "100%", height: "100%",
				padding: "32px",
				background: "#202020"
			}}
		>

			<AMath
				math={math}
			/>

		</div>
	)
}

