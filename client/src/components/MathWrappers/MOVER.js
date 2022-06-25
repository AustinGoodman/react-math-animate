import React, { forwardRef, useEffect, useRef, useState } from 'react'
import { animated, useSpring, useTransition, config, to } from 'react-spring'

const MOVER = React.forwardRef((props, ref) => {
	return (
		<mover ref={ref} {...props}>
			{props.children}
		</mover>
	)
})
MOVER.displayName = "MOVER"

export default MOVER