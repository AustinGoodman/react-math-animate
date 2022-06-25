import React, { forwardRef, useEffect, useRef, useState } from 'react'
import { animated, useSpring, useTransition, config, to } from 'react-spring'

const MO = React.forwardRef((props, ref) => {
	return (
		<mo ref={ref} {...props}>
			{props.children}
		</mo>
	)
})
MO.displayName = "MO"

export default MO