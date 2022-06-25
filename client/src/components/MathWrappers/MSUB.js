import React, { forwardRef, useEffect, useRef, useState } from 'react'
import { animated, useSpring, useTransition, config, to } from 'react-spring'

const MSUB = React.forwardRef((props, ref) => {
	return (
		<msub ref={ref} {...props}>
			{props.children}
		</msub>
	)
})
MSUB.displayName = "MSUB"

export default MSUB