import React, { useEffect, useState, createRef } from 'react'
import { animated, useSpring, config, to } from 'react-spring'
import * as peggy from "peggy"
import parserSource from "../math-parser.pegjs"
import uniqid from "uniqid"
import MN from './MathWrappers/MN'
import MI from './MathWrappers/MI'
import MO from './MathWrappers/MO'
import MROW from './MathWrappers/MROW'
import MTABLE from './MathWrappers/MTABLE'
import MTR from './MathWrappers/MTR'
import MTD from "./MathWrappers/MTD"
import MFRAC from './MathWrappers/MFRAC'
import MATH from "./MathWrappers/MATH"

//should be replaced with pre-generated file in production context
//for now this allows hot reloading when changes are made to math-parser.pegjs
//could consider writing a custom webpack loader
const parser = peggy.generate(parserSource)

/* AMath component
**
** Used to render dynamically generated math expressions with MathML. An 
** expression is rendered from the initial value of the math prop. Animated
** transitions are automatically executed when the parent supplies a new 
** math prop.
**
** Transition animations work by mounting the MathML components invisibly (opacity = 0)
** and then cloning certain MathML elements to be individually animated (see TransitionClone component).
** Once all the individual transition elements have completed, the transition clones are deleted and
** and the invisible MathML components are made visible (opacity = 1).
**
** Props: 
**     math: string containing math expression in custom latex-inspired syntax.
**           The parent can trigger an animated transition to a new expression by
**           supplying a new value for this prop.
**     mathStyle: inline style object passed to MathML math elements (fontsize, color, ...).
*/
function AMath({ math = "x", mathStyle={} }) {

	/* -------------------------------------------------------------------------- */
	/*                          state variables and hooks                         */
	/* -------------------------------------------------------------------------- */

	//an array of objects which hold generated jsx components and related data
	const [mathQueue, setMathQueue] = useState([])

	//set to signal that an animation should start or end
	const [animationActive, setAnimationActive] = useState()

	//when an animation is in progress, this will hold the TransitionClone components
	const [transitionClones, setTransitionClones] = useState([])

	//tracks the number of transition clones that have finished their animation
	const [restingTransitionCloneCount, setRestingTransitionCloneCount] = useState(0)


	/* -------------------------------------------------------------------------- */
	/*                               useEffect hooks                              */
	/* -------------------------------------------------------------------------- */

	//respone to a change in the math prop (passed down from parent)
	useEffect(() => {
		//for now completely ignore new changes to math prop when animation in progress
		//show implement a queueing system so this doesn't happen
		if (animationActive) {
			return
		}

		//whenever the math prop changes we push we generate a new math queue entry from it
		addMathToQueue(math)

		//then we trigger the animation start
		setAnimationActive(true)
	}, [math])

	//response to animation start and end triggers
	useEffect(() => {
		if (animationActive) {
			const transitionClones = []

			//find components with fromIDs
			let compsWithFromIDs = getFilteredComponents(mathQueue[mathQueue.length - 1].jsx,
				//match condition
				component => {
					return component.props.fromid !== undefined && component.props.fromid !== null
				})

			//find components with toIDs
			let compsWithToIDs = []
			if (mathQueue.length > 1) {
				compsWithToIDs = getFilteredComponents(mathQueue[mathQueue.length - 2].jsx,
					//match condition
					(component) => {
						return component.props.toid !== undefined && component.props.toid !== null
					})
			}

			//find components that should have transitions but which are not parented by a component that will already transition
			let leafComponents = getFilteredComponents(mathQueue[mathQueue.length - 1].jsx,
				//match condition
				(component) => {
					return component.type && ["MI", "MO", "MN"].includes(component.type.displayName)
				},
				//recurse condition
				(component, isMatch) => {
					return component.props && !component.props.fromid
				},
			)

			//create transition clones for leaf components
			leafComponents.forEach((component, index) => {
				transitionClones.push(
					<TransitionClone
						key={"leaf" + index} toComponent={component} fromComponent={component}
						onRest={() => setRestingTransitionCloneCount(prev => prev + 1)}
					/>
				)
			})

			//create transition clones for components which transition from exisiting elements
			compsWithFromIDs.forEach((component, index) => {
				//determine from which component we transition
				let fromComponent = undefined
				compsWithToIDs.forEach((fromComp, index) => {
					if (component.props.fromid === fromComp.props.toid) {
						fromComponent = fromComp
					}
				})

				//transition from self if no no existing component found
				if (!fromComponent) {
					fromComponent = component
				}

				//create the transition clone
				transitionClones.push(
					<TransitionClone
						key={index} toComponent={component} fromComponent={fromComponent}
						onRest={() => setRestingTransitionCloneCount(prev => prev + 1)}
					/>
				)
			})

			//update the state related to the new transitions clones
			setTransitionClones(transitionClones)
			setRestingTransitionCloneCount(0)

			console.log("animation started")
		} else if (animationActive === false) {
			//clear the transition clones and set the top element of mathQueue to active(will be visible next render)
			setTransitionClones([])
			setMathQueue(prev => {
				prev[mathQueue.length - 1].active = true
				return prev
			})

			console.log("animation ended")
		}
	}, [animationActive])

	//response to an update to the number of resting transition clones
	useEffect(() => {
		//we dont want anything to happen if restingTransitionCloneCount changes when there is no animation active
		if (!animationActive) {
			return
		}

		//if all the transition clones are resting, signal the end of the animation
		if (restingTransitionCloneCount === transitionClones.length) {
			setAnimationActive(false)
		}
	}, [restingTransitionCloneCount])



	/* -------------------------------------------------------------------------- */
	/*                           data structure methods                           */
	/* -------------------------------------------------------------------------- */

	//parses mathString and generates an entry for the mathQueue from the result
	function addMathToQueue(mathString) {
		//recursively traverses the node tree to generate a jsx hierarchy
		function recurse(activeNode, componentMap) {
			//initialize the componentProps
			const componentProps = { style: {}, children: [], ref: createRef() }

			//add the node props to the componentProps
			activeNode.props && activeNode.props.forEach(prop => {
				if (prop.name === "color") {
					componentProps.style.color = prop.value
				} else {
					componentProps[prop.name] = prop.value
				}
			})

			//recurse to generate child components and add them to the children array in componentProps
			activeNode.children.forEach(childNode => {
				const childComponent = recurse(childNode, componentMap)
				componentProps.children.push(childComponent)
			})

			//generate a jsx component for the activeNode, add it to the componentMap, return it
			const key = uniqid()
			let component = null
			switch (activeNode.type) {
				case "root":
					component = <MATH children={componentProps.children} key={key} style={{ color: "white", fontSize: "32px", ...mathStyle }} />
					break
				case "mfrac":
					component = <MFRAC {...componentProps} key={key} />
					break
				case "mrow":
					component = <MROW {...componentProps} key={key} />
					break
				case "mn":
					component = <MN {...componentProps} key={key} />
					break
				case "mi":
					component = <MI {...componentProps} key={key} />
					break
				case "mo":
					component = <MO {...componentProps} key={key} />
					break
				case "mtable":
					component = <MTABLE {...componentProps} key={key} />
					break
				case "mtr":
					component = <MTR {...componentProps} key={key} />
					break
				case "mtd":
					component = <MTD {...componentProps} key={key} />
					break
				case "string":
					component = activeNode.content
					break
			}
			componentMap[key] = component
			return component
		}

		//parse the math string and generate a jsx hierarchy
		const rootNode = parser.parse(mathString)
		const componentMap = {}
		const rootComponent = recurse(rootNode, componentMap)

		//update the jsx state so that the math components are rendered
		setMathQueue(prev => {
			return [...prev, { jsx: rootComponent, componentMap: componentMap, mathString: mathString, active: false }]
		})
	}

	//preorder search of jsx component hierarchy
	//matches are determined by the return value of a the given filterFunction callback
	//traversal of descendants will stop or continue based on the return value of the given shouldRecurseFunction callback
	function getFilteredComponents(headComponent, filterFunction, shouldRecurseFunction = (() => true)) {
		const matches = []

		//preorder traversal
		function recurse(activeComponent) {
			//if not a React component, there can be no match. Stop further descendant traversal. 
			if (!React.isValidElement(activeComponent) || !activeComponent.props) {
				return
			}

			const isMatch = filterFunction(activeComponent)
			const shouldRecurse = shouldRecurseFunction(activeComponent, isMatch)

			isMatch && matches.push(activeComponent)
			shouldRecurse && React.Children.map(activeComponent.props.children, child => recurse(child))
		}
		
		recurse(headComponent)

		return matches
	}



	/* -------------------------------------------------------------------------- */
	/*                               render methods                               */
	/* -------------------------------------------------------------------------- */

	//maps mathQueue entries to an array of jsx components which can be rendered by React
	function renderMath() {
		const comps = []
		mathQueue.forEach(queueEntry => {
			const component = React.cloneElement(queueEntry.jsx, {
				style: { ...queueEntry.jsx.props.style, opacity: queueEntry.active ? 1 : 0 }
			})
			comps.push(component)
			comps.push(<br key={`br-${queueEntry.jsx.key}`} />)
		})
		return comps
	}

	//maps transitionClones to a renderable component
	function renderClones() {
		return transitionClones.map((transitionClone, index) => {
			return transitionClone
		})
	}

	return (
		<React.Fragment>
			{renderMath()}
			{renderClones()}
		</React.Fragment>
	)
}

/* TransitionClone component
**
** Used by the AMath component to create a visual clone of a MathML element. Uses a
** span element, animated by React Spring, to wrap a given MathML element. Wraps a 
** clone of the DOM element referenced by the toComponent's ref prop. Layout and style
** data is used for animated transitions. Transitions between layout and style data in
** the fromComponent to that in the toComponent. To indicate the the clone should transition
** in from nothing, rather than from an existing component, fromComponent should equal toComponent.
**
** Not indended to be reusable and therefore only available to the AMath component.
**
** Props: 
**     fromComponent: one of the components in the MathWrappers directory.
**     toComponent: one of the components in the MathWrappers directory.
**     onRest: function that reports the end of the transition animation 
**             to the parent AMath component.
*/
function TransitionClone({ fromComponent, toComponent, onRest }) {

	//returns the spring transition data
	function getSpringFromAndTo() {
		//get layout and computed style data from fromComponent and toComponent
		const fromRect = fromComponent.ref.current.getBoundingClientRect()
		const fromStyle = getComputedStyle(fromComponent.ref.current)
		const toRect = toComponent.ref.current.getBoundingClientRect()
		const toStyle = getComputedStyle(toComponent.ref.current)

		//when we transition in from nothing
		if (fromComponent === toComponent) {
			return {
				from: {
					x: fromRect.x,
					y: fromRect.y,
					rotationX: 45,
					rotationY: 90,
					rotationZ: 45,
					width: fromRect.width,
					height: fromRect.height,
					opacity: 0,
					fontSize: parseFloat(fromStyle.fontSize)
				},
				to: {
					x: toRect.x,
					y: toRect.y,
					rotationX: 0,
					rotationY: 0,
					rotationZ: 0,
					width: toRect.width,
					height: toRect.height,
					opacity: 1,
					fontSize: parseFloat(toStyle.fontSize)
				}
			}
		}
		//when we transition from an existing MathML element
		else {
			return {
				from: {
					x: fromRect.x,
					y: fromRect.y,
					rotationX: 0,
					rotationY: 0,
					rotationZ: 0,
					width: fromRect.width,
					height: fromRect.height,
					opacity: 1,
					fontSize: parseFloat(fromStyle.fontSize)
				},
				to: {
					x: toRect.x,
					y: toRect.y,
					rotationX: 0,
					rotationY: 0,
					rotationZ: 0,
					width: toRect.width,
					height: toRect.height,
					opacity: 1,
					fontSize: parseFloat(toStyle.fontSize)
				},
			}
		}
	}

	//the animation spring
	const spring = useSpring({
		...getSpringFromAndTo(),
		onRest: (val) => {
			onRest && onRest(val)
		},
		config: config.gentle
	})

	//convert spring properties to a value to be passed to the css transform attribute 
	function getTransform() {
		return to([spring.x, spring.y, spring.rotationX, spring.rotationY, spring.rotationZ], (x, y, rotationX, rotationY, rotationZ) => {
			return `translateX(${x}px) translateY(${y}px) rotateX(${rotationX}deg) rotateY(${rotationY}deg) rotateZ(${rotationZ}deg)`
		})
	}

	return (
		<animated.span /* animated container*/
			style={{
				display: "flex", alignItems: "center", justifyContent: "center",
				position: "absolute", left: 0, top: 0, color: "white",

				width: spring.width.to(width => `${width}px`),
				height: spring.height.to(height => `${height}px`),
				opacity: spring.opacity.to(opacity => opacity),
				fontSize: spring.fontSize.to(fontSize => `${fontSize}px`),
				transform: getTransform()
			}}
		>
			<math /* cloned MathML elements must be parented by this math element */
				style={{
					display: "block", minWidth: 0, minHeight: 0, left: 0, right: 0,
				}}
			>
				{ /* the cloned component */
					React.cloneElement(toComponent, { style: { display: "block" } })
				}
			</math>
		</animated.span>
	)
}

export default AMath