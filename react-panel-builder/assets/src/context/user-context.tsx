import { createContext, useContext } from "react";
import { User } from "../types";
import usePersistedState from "../hooks/usePersistedState";
import LoaderScreen from "../components/app/LoaderScreen";

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
}

const UserContext = createContext<UserContextType>({
  user: null,
  setUser: (user: User) => {},
} as UserContextType);

export default UserContext;

interface UserContextProviderProps {
  children: React.ReactNode;
}

export const UserContextProvider = ({ children }: UserContextProviderProps) => {
  const [user, setUser] = usePersistedState<User | null>("_user", null);

  return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
};

interface UserContextTypeReturn extends UserContextType {
  token: string | null;
}

export const useUserContext = (): UserContextTypeReturn => {
  const { user, setUser } = useContext(UserContext);
  return { user, setUser, token: user?.token || null };
};
