import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function parseJwt (token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
}

export default function AuthRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("token", token);
      const decoded = parseJwt(token);
      if (decoded && decoded.email) {
        localStorage.setItem("userEmail", decoded.email);
      } else if (decoded && decoded.sub) { // Fallback for email
        localStorage.setItem("userEmail", decoded.sub);
      }
      if (decoded && decoded.role) {
        localStorage.setItem("userRole", decoded.role);
      }
      // Redirect based on role
      if (decoded && decoded.role === 'admin') {
        navigate("/admin", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } else {
      navigate("/login", { replace: true });
    }
  }, [navigate]);
  return null;
}
