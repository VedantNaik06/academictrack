import { useContext } from "react";
import { AuthContext } from "../context/AuthContextObject.js";

const useAuth = () => useContext(AuthContext);

export default useAuth;