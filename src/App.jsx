import { useState } from "react";
import "./App.css";
import { LoadingScreen } from "./components/LoadingScreen.jsx";
import Update from "./components/Update.jsx";

export default function App() {
  const [session, setSession] = useState(null);

  // כל עוד אין session -> נשארים במסך הכניסה
  if (!session) {
    return <LoadingScreen onEnter={(nextSession) => setSession(nextSession)} />;
  }

  return <Update session={session} />;
}
