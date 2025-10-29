import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import Inventario from "./Inventario";
import Formazione from "./Formazione";
import Admin from "./pages/Admin";
import Classifica from "./pages/Classifica"; // ✅ Import aggiunto
import "./App.css";

// ======================================================
// 🧩 COMPONENTE LOGIN / HOME UTENTE
// ======================================================
function Login() {
  const [username, setUsername] = useState(localStorage.getItem("vutUser") || "");
  const navigate = useNavigate();

  const handleLogin = () => {
    if (username.trim() === "") return;
    localStorage.setItem("vutUser", username);
    navigate(`/inventario/${username}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("vutUser");
    setUsername("");
    navigate("/");
  };

  return (
    <div className="app">
      {!localStorage.getItem("vutUser") ? (
        <>
          <h1>⚽ Accesso VUT</h1>
          <div className="login-form">
            <input
              type="text"
              placeholder="Inserisci il tuo nome utente"
              className="login-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <button className="login-btn" onClick={handleLogin}>
              Accedi
            </button>
          </div>
        </>
      ) : (
        <>
          <h1>Benvenuto, {username} 👋</h1>
          <button className="login-btn" onClick={handleLogout}>
            Esci
          </button>
          <p>Puoi chiudere e riaprire il sito: resterai loggato automaticamente.</p>

          <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
            <button
              className="login-btn"
              onClick={() => navigate(`/inventario/${username}`)}
            >
              🧾 Vai al mio inventario
            </button>
            <button
              className="login-btn"
              onClick={() => navigate("/classifica")}
            >
              🏆 Classifica
            </button>
          </div>

          <div style={{ marginTop: "20px" }}>
            <button
              className="btn-admin"
              style={{
                backgroundColor: "#333",
                color: "#ffd700",
                padding: "10px 20px",
                borderRadius: "8px",
              }}
              onClick={() => navigate("/admin")}
            >
              ⚙️ Accesso Admin
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ======================================================
// 🧭 ROUTER PRINCIPALE
// ======================================================
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/inventario/:username" element={<Inventario />} />
        <Route path="/formazione/:username" element={<Formazione />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/classifica" element={<Classifica />} /> {/* ✅ Rotta Classifica */}
      </Routes>
    </Router>
  );
}

export default App;
