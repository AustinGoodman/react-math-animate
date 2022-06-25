import React, { forwardRef, useEffect, useRef, useState } from 'react'
import { animated, useSpring, useTransition, config, to } from 'react-spring'

const MI = React.forwardRef((props, ref) => {
	return (
		<mi ref={ref} {...props}>
			{props.children}
		</mi>
	)
})
MI.displayName = "MI"

export default MI