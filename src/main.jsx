import { createRoot } from "react-dom/client";
import App from "./app/App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { NotificationProvider } from "./context/NotificationContext.jsx";

import "./index.css";

createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <NotificationProvider>
      <App />
    </NotificationProvider>
  </AuthProvider>,
);
