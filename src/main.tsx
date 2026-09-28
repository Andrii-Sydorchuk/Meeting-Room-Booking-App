import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { AuthPage } from "./components/auth/AuthPage";
import { AuthProvider } from "./context/AuthContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <AuthPage />
    </AuthProvider>
  </StrictMode>,
);
