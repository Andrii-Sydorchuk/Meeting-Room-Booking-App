import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../../hooks/useAuth";
import type { RegisterUserData } from "../../services/authService";
import { UserPlus, Loader2, AlertCircle } from "lucide-react";

interface RegisterFormData extends RegisterUserData {
  confirmPassword: string;
}

interface RegisterFormProps {
  onSwitch: () => void;
}

export function RegisterForm({ onSwitch }: RegisterFormProps) {
  const { register: registerAuthUser } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>();

  const passwordValue = watch("password");

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null);
    try {
      await registerAuthUser({
        name: data.name.trim(),
        email: data.email.trim(),
        password: data.password,
      });
    } catch (err: unknown) {
      const errorObj = err as { code?: string; message?: string };
      if (errorObj.code === "auth/email-already-in-use") {
        setServerError("This email address is already registered.");
      } else if (errorObj.code === "auth/invalid-email") {
        setServerError("Please enter a valid email address.");
      } else if (errorObj.code === "auth/weak-password") {
        setServerError("Password is too weak. Choose a stronger password.");
      } else {
        setServerError(
          errorObj.message || "Failed to create account. Please try again.",
        );
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <h2 className="text-xl font-bold text-gray-800 mb-2">
        Create an Account
      </h2>

      {serverError && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Full Name
        </label>
        <input
          type="text"
          {...register("name", {
            required: "Full Name is required.",
            minLength: {
              value: 2,
              message: "Name must be at least 2 characters.",
            },
          })}
          placeholder="John Smith"
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 ${
            errors.name
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:ring-blue-500"
          }`}
        />
        {errors.name && (
          <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
        )}
      </div>

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
            minLength: {
              value: 6,
              message: "Password must be at least 6 characters long.",
            },
          })}
          placeholder="At least 6 characters"
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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Confirm Password
        </label>
        <input
          type="password"
          {...register("confirmPassword", {
            required: "Please confirm your password.",
            validate: (value) =>
              value === passwordValue || "Passwords do not match.",
          })}
          placeholder="Repeat password"
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 ${
            errors.confirmPassword
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:ring-blue-500"
          }`}
        />
        {errors.confirmPassword && (
          <p className="mt-1 text-xs text-red-600">
            {errors.confirmPassword.message}
          </p>
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
            <span>Creating account...</span>
          </>
        ) : (
          <>
            <UserPlus className="w-4 h-4" />
            <span>Register</span>
          </>
        )}
      </button>

      <p className="text-center text-sm text-gray-600 pt-2">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onSwitch}
          className="text-blue-600 hover:underline font-medium cursor-pointer"
        >
          Sign in here
        </button>
      </p>
    </form>
  );
}
