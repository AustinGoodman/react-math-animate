import React, { forwardRef, useEffect, useRef, useState } from 'react'
import { animated, useSpring, useTransition, config, to } from 'react-spring'

const MTD = React.forwardRef((props, ref) => {
	return (
		<mtd ref={ref} {...props}>
			{props.children}
		</mtd>
	)
})
MTD.displayName = "MTD"

export default MTD