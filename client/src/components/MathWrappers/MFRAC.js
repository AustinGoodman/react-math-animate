import React, { forwardRef, useEffect, useRef, useState } from 'react'
import { animated, useSpring, useTransition, config, to } from 'react-spring'

const MFRAC = React.forwardRef((props, ref) => {
	return (
		<mfrac ref={ref} {...props}>
			{props.children}
		</mfrac>
	)
})
MFRAC.displayName = "MFRAC"

export default MFRAC