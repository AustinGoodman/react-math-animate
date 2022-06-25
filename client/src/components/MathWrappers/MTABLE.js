import React, { forwardRef, useEffect, useRef, useState } from 'react'
import { animated, useSpring, useTransition, config, to } from 'react-spring'

const MTABLE = React.forwardRef((props, ref) => {
	return (
		<mtable ref={ref} {...props}>
			{props.children}
		</mtable>
	)
})
MTABLE.displayName = "MTABLE"

export default MTABLE