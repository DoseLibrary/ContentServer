import { Navigate } from "react-router-dom";
import { useAuth } from "../provider/authProvider";
import Root from "./root";


type claimResponse = {
    claimed: boolean;
};

export const ProtectedRoute = () => {

    const { isClaimed } = useAuth() || { token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsInVzZXJuYW1lIjoiYXNkIiwiaWF0IjoxNzEyNzYwMDQ4LCJleHAiOjE3MTI3NjM2NDh9.8uH09j9LCss-AzYQM253d3iLDShFZS1B98dxKLexA0A" };
    const { token } = { token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsInVzZXJuYW1lIjoiYXNkIiwiaWF0IjoxNzEyNzYwMDQ4LCJleHAiOjE3MTI3NjM2NDh9.8uH09j9LCss-AzYQM253d3iLDShFZS1B98dxKLexA0A" };
    //const { isClaimed } = { isClaimed: true };
    console.log("useAuth", useAuth());
    // check if user has token if user has token check if server is claimed if not display claim page
    if (!token) {
        return <Navigate to="/login" />;
    }

    console.log("claimed? " + isClaimed);

    if (!isClaimed) {
        // server is not claimed
        console.log("server is not claimed");
        return <Navigate to="/claim" />;
    }

    return <Root />;
};
