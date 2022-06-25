import React, { useState } from 'react'

const colors = {
	white: "#ffffff",
	gray: "#f0f0f0"
}

const margin = {
	s: "4px",
	m: "8px",
	l: "12px",
	xl: "16px",
	raw: {
		s: 4,
		m: 8,
		l: 12,
		xl: 16
	}
}

const padding = {
	s: "4px",
	m: "8px",
	l: "12px",
	xl: "16px",
	raw: {
		s: 4,
		m: 8,
		l: 12,
		xl: 16
	}
}

const borderRadius = {
	s: "4px",
	m: "8px",
	l: "12px",
	xl: "16px",
	raw: {
		s: 4,
		m: 8,
		l: 12,
		xl: 16
	}
}

const boxShadow = {
	soft: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
}

const lightTheme = {
	margin: {...margin},
	padding: {...padding},
	borderRadius: {...borderRadius},
	boxShadow: {...boxShadow},

	background: {
		back: colors.white,
		front: colors.gray
	}
}

const gridData = {
	cellSize: 32.0
}

const defaultData = {
	colors: { ...colors },
	theme: { ...lightTheme },
	gridData: { ...gridData }
}

export default function ContextProvider({ children }) {
	const MainContext = React.createContext()

	const [data, setData] = useState({
		...defaultData
	})

	ContextProvider.useContext = () => {
		return [React.useContext(MainContext), setData]
	}

	return (
		<MainContext.Provider value={data}>
			{children}
		</MainContext.Provider>
	)
}
