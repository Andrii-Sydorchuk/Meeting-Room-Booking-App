import { useAuth } from "./hooks/useAuth";
import { AuthPage } from "./components/auth/AuthPage";
import { Navbar } from "./components/layout/Navbar";
import { RoomList } from "./components/rooms/RoomList";
import { BookingList } from "./components/bookings/BookingList";
import { RoomProvider } from "./context/RoomContext";
import { BookingProvider } from "./context/BookingContext";
import { Loader2 } from "lucide-react";

export function App() {
  const { firebaseUser, loading } = useAuth();

  // 1. Initial Auth Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-sm font-medium text-gray-600">
          Loading application session...
        </p>
      </div>
    );
  }

  // 2. If user is logged out, render AuthPage
  if (!firebaseUser) {
    return <AuthPage />;
  }

  // 3. If user is logged in, render main dashboard layout
  return (
    <RoomProvider>
      <BookingProvider>
        <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
          <Navbar />

          <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
            {/* Room Management Grid */}
            <RoomList />

            {/* Selected Room Booking Schedule */}
            <BookingList />
          </main>
        </div>
      </BookingProvider>
    </RoomProvider>
  );
}

export default App;
