import { useAuth } from "../../hooks/useAuth";
import { CalendarDays, LogOut, User } from "lucide-react";

export function Navbar() {
  const { profile, logout } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* App branding */}
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-600 text-white rounded-lg shadow-sm">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-lg leading-none">
              Furman Agency
            </h1>
            <span className="text-xs text-gray-500">Meeting Room App</span>
          </div>
        </div>

        {/* User info and logout */}
        {profile && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <div className="p-1.5 bg-gray-100 rounded-full text-gray-600">
                <User className="w-4 h-4" />
              </div>
              <div className="text-left hidden sm:block">
                <p className="font-semibold text-gray-800 leading-tight">
                  {profile.displayName}
                </p>
                <p className="text-xs text-gray-400">{profile.email}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 border border-red-200 rounded-md transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
