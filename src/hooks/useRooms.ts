import { useContext } from "react";
import type { RoomContextData } from "../context/RoomContext";
import RoomContext from "../context/RoomContext";

export function useRooms(): RoomContextData {
  const context = useContext(RoomContext);

  if (!context) {
    throw new Error("useRooms must be used within a RoomProvider");
  }

  return context;
}
