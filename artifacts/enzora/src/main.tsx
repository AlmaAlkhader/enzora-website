import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./lib/auth-fetch";

createRoot(document.getElementById("root")!).render(<App />);
