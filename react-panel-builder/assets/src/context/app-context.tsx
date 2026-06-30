import { createContext, useContext, useEffect, useState } from "react";
import usePersistedState from "../hooks/usePersistedState";
import LoaderScreen from "../components/app/LoaderScreen";

interface AppDataObject {}

interface AppContextType {
  appData: AppDataObject;
  setAppData: (appData: Partial<AppDataObject>) => void;
}

const defaultAppData = {};

const AppContext = createContext<AppContextType>({
  appData: defaultAppData,
  setAppData: () => {},
});

export default AppContext;

interface AppContextProviderProps {
  children: React.ReactNode;
}

export const AppContextProvider = ({ children }: AppContextProviderProps) => {
  const [appData, setData] = usePersistedState<AppDataObject>("app_data", defaultAppData);
  const [isLoading, setIsLoading] = useState(false);

  const setAppData = (appData: Partial<AppDataObject>) => {
    setData((prev) => ({ ...prev, ...appData }));
  };

  useEffect(() => {
    const fetchData = async () => {
      if (isLoading) return;
      setIsLoading(true);
      const appData = await fetchAppData();
      setAppData(appData);
      setIsLoading(false);
    };

    fetchData();
  }, []);

  return (
    <AppContext.Provider value={{ appData, setAppData }}>
      {isLoading ? <LoaderScreen /> : children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  return useContext(AppContext);
};

// fetch app data
const fetchAppData = async (): Promise<AppDataObject> => {
  return {};
};
