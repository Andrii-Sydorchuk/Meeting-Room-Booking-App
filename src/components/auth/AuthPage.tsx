import { useState } from "react";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
import { CalendarDays } from "lucide-react";

export function AuthPage() {
  const [authType, setAuthType] = useState<"login" | "register">("login");

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 p-6 text-white text-center">
          <div className="flex justify-center items-center gap-2 mb-2">
            <CalendarDays className="w-8 h-8" />
            <h1 className="text-2xl font-bold tracking-tight">Furman Agency</h1>
          </div>
          <p className="text-blue-100 text-sm">
            Meeting Room Booking Application
          </p>
        </div>

        {/* Login / Register toggle */}
        <div className="flex border-b border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={() => setAuthType("login")}
            className={`flex-1 py-3 text-sm font-medium text-center border-b-2 transition-colors cursor-pointer ${
              authType === "login"
                ? "border-blue-600 text-blue-600 bg-white"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setAuthType("register")}
            className={`flex-1 py-3 text-sm font-medium text-center border-b-2 transition-colors cursor-pointer ${
              authType === "register"
                ? "border-blue-600 text-blue-600 bg-white"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Register
          </button>
        </div>

        {/* Form body */}
        <div className="p-6">
          {authType === "login" ? (
            <LoginForm onSwitch={() => setAuthType("register")} />
          ) : (
            <RegisterForm onSwitch={() => setAuthType("login")} />
          )}
        </div>
      </div>
    </div>
  );
}
