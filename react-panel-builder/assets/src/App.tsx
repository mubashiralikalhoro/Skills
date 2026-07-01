import { AppContextProvider } from "./context/app-context";
import { UserContextProvider } from "./context/user-context";
import AppRoutes from "./pages/routes";
import { ToastContainer } from "react-toastify";

const App = () => {
  return (
    <AppContextProvider>
      <UserContextProvider>
        <AppRoutes />
        <ToastContainer />
      </UserContextProvider>
    </AppContextProvider>
  );
};

export default App;
