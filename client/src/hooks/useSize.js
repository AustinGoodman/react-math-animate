import { useState, useEffect, useRef } from "react";

export default function useSize(elementRef) {
	const [size, setSize] = useState({ width: 0, height: 0, scrollWidth: 0, scrollHeight: 0, left: 0, right: 0, top: 0, bottom: 0 })
	const observerRef = useRef()

	function onResize() {
		if (!elementRef || !elementRef.current) return
		const rect = elementRef.current.getBoundingClientRect()

		setSize({
			width: rect.width,
			height: rect.height,
			scrollWidth: elementRef.current.scrollWidth,
			scrollHeight: elementRef.current.scrollHeight,
			left: rect.left, 
			right: rect.right, 
			top: rect.top, 
			bottom: rect.bottom, 
		})
	}

	useEffect(() => {
		if (!elementRef || !elementRef.current) return

		observerRef.current = new ResizeObserver(() => {onResize}).observe(elementRef.current)
		window.addEventListener("resize", onResize)
		onResize()

		return () => {
			if (observerRef.current) observerRef.current.disconnect()
		}
	}, [])

	useEffect(() => {
		observerRef.current = new ResizeObserver(onResize).observe(elementRef.current)
		onResize()
	}, [elementRef])

	return size
}     