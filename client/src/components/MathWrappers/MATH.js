import React, { forwardRef, useEffect, useRef, useState } from 'react'
import { animated, useSpring, useTransition, config, to } from 'react-spring'

const MATH = React.forwardRef((props, ref) => {
	return (
		<math ref={ref} {...props}>
			{props.children}
		</math>
	)
})
MATH.displayName = "MATH"

export default MATH