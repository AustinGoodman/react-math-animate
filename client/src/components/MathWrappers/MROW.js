import React, { forwardRef, useEffect, useRef, useState } from 'react'
import { animated, useSpring, useTransition, config, to } from 'react-spring'

const MROW = React.forwardRef((props, ref) => {
	return (
		<mrow ref={ref} {...props}>
			{props.children}
		</mrow>
	)
})
MROW.displayName = "MROW"

export default MROW