import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// The site is also reachable over plain http, where browsers switch off the
// crypto features the /food page needs. Send real visitors to https; leave
// localhost and LAN addresses used in development alone.
const { protocol, hostname } = window.location;
const isDevHost = hostname === "localhost" || hostname.endsWith(".localhost") || /^[\d.]+$/.test(hostname) || hostname.includes(":");
if (protocol === "http:" && !isDevHost) {
  window.location.replace(window.location.href.replace(/^http:/, "https:"));
} else {
  createRoot(document.getElementById("root")!).render(<App />);
}
