import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../../hooks/useAuth";
import type { LoginUserData } from "../../services/authService";
import { LogIn, Loader2, AlertCircle } from "lucide-react";

interface LoginFormProps {
  onSwitch: () => void;
}

export function LoginForm({ onSwitch }: LoginFormProps) {
  const { login } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginUserData>();

  const onSubmit = async (data: LoginUserData) => {
    setServerError(null);
    try {
      await login(data);
    } catch (err: unknown) {
      const errorObj = err as { code?: string; message?: string };
      if (
        errorObj.code === "auth/invalid-credential" ||
        errorObj.code === "auth/user-not-found" ||
        errorObj.code === "auth/wrong-password"
      ) {
        setServerError("Invalid email or password.");
      } else {
        setServerError(
          errorObj.message || "Failed to sign in. Please try again.",
        );
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <h2 className="text-xl font-bold text-gray-800 mb-2">Welcome Back</h2>

      {serverError && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email Address
        </label>
        <input
          type="email"
          {...register("email", {
            required: "Email is required.",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Please enter a valid email address.",
            },
          })}
          placeholder="name@example.com"
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 ${
            errors.email
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:ring-blue-500"
          }`}
        />
        {errors.email && (
          <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <input
          type="password"
          {...register("password", {
            required: "Password is required.",
          })}
          placeholder="••••••••"
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 ${
            errors.password
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:ring-blue-500"
          }`}
        />
        {errors.password && (
          <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow transition duration-150 disabled:opacity-50 cursor-pointer"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Signing in...</span>
          </>
        ) : (
          <>
            <LogIn className="w-4 h-4" />
            <span>Sign In</span>
          </>
        )}
      </button>

      <p className="text-center text-sm text-gray-600 pt-2">
        Don't have an account?{" "}
        <button
          type="button"
          onClick={onSwitch}
          className="text-blue-600 hover:underline font-medium cursor-pointer"
        >
          Register here
        </button>
      </p>
    </form>
  );
}
