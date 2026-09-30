import { createContext } from "react";

// Only the context object lives here, so AuthContext.jsx can export just the component.
export const AuthContext = createContext(null);