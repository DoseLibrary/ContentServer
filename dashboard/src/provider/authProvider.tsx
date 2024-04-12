import axios from "axios";
import { createContext, useContext, useEffect, useMemo, useState, ReactNode, SetStateAction } from "react";

const AuthContext = createContext<{ token: string; setToken: (newToken: SetStateAction<string>) => void; isClaimed: boolean } | undefined>({ token: "", setToken: () => {}, isClaimed: false });


const AuthProvider = ({ children }: { children: ReactNode }) => {
  // State to hold the authentication token
  const [token, setToken_] = useState(localStorage.getItem("token") || "");
  const [isClaimed, setIsClaimed_] = useState(false);
  // Function to set the authentication token
  const setToken = (newToken: SetStateAction<string>) => {
    setToken_(newToken);
  };
  const setIsClaimed = (neIsClaimed: SetStateAction<boolean>) => {
    setIsClaimed_(neIsClaimed);
  };

  const claimed = async () => {
    try {
        const response = await axios.get<{ claimed: boolean }>("http://localhost:3001/api/dashboard/claimed");
        console.log(response.data.claimed);
        setIsClaimed(response.data.claimed);
    } catch (error) {
        console.error(error);
        setIsClaimed(false);
    }
};
  useEffect(() => {

    claimed();

    if (token) {
      axios.defaults.headers.common["Authorization"] = "Bearer " + token;
      localStorage.setItem('token',token);
    } else {
      delete axios.defaults.headers.common["Authorization"];
      localStorage.removeItem('token')
    }
  }, [token]);

    // Memoized value of the authentication context
    const contextValue = useMemo(
        () => ({
            token,
            setToken,
            isClaimed,
            setIsClaimed
        }),
        [token, isClaimed]
    );

    return (
        <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
    );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthProvider;
