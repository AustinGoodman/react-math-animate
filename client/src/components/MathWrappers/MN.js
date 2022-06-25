import React, { forwardRef, useEffect, useRef, useState } from 'react'
import { animated, useSpring, useTransition, config, to } from 'react-spring'

const MN = React.forwardRef((props, ref) => {
	return (
		<mn ref={ref} {...props}>
			{props.children}
		</mn>
	)
})
MN.displayName = "MN"

export default MN