import { createContext } from 'preact'

const ThemeContext = createContext()

export const ThemeProvider = ({ children, ...props }) => (
	<ThemeContext.Provider value={props}>
		{children}
	</ThemeContext.Provider>
)

export default ThemeContext