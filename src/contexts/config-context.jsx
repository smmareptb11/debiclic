import { createContext } from 'preact'

const ConfigContext = createContext()

export const ConfigProvider = ({ children, ...props }) => (
	<ConfigContext.Provider value={props}>
		{children}
	</ConfigContext.Provider>
)

export default ConfigContext