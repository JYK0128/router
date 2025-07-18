import { createContext, useContext, useState, type Dispatch, type PropsWithChildren, type SetStateAction } from "react";

const initialValue = 'hi';
const Context = createContext<[string, Dispatch<SetStateAction<string>>] | null>(null);
export const ContextProvider = ({children}: PropsWithChildren) => {
  const [value, setValue] = useState(initialValue);

  return (
    <Context.Provider value={[value, setValue]}>
      {children}
    </Context.Provider>
  );
}
export const useAppContext = () => {
  const context = useContext(Context);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
