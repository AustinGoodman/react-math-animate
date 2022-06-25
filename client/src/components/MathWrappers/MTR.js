import React, { forwardRef, useEffect, useRef, useState } from 'react'
import { animated, useSpring, useTransition, config, to } from 'react-spring'

const MTR = React.forwardRef((props, ref) => {
	return (
		<mtr ref={ref} {...props}>
			{props.children}
		</mtr>
	)
})
MTR.displayName = "MTR"

export default MTR