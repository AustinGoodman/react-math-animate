import React from 'react'
import { useRef } from 'react'

export default function useDebouncedValue(onUpdate, initialValue = null, duration = 300) {
	const debounceRef = useRef({ id: null, value: initialValue })

	function onChange(value) {
		debounceRef.current.value = value
		if (debounceRef.current.id !== null) {
			clearTimeout(debounceRef.current.id)
			debounceRef.current.id = null
		}
		debounceRef.current.id = setTimeout(() => {
			onUpdate(debounceRef.current.value)
			debounceRef.current.id = null
		}, duration)
	}

	return onChange
}
