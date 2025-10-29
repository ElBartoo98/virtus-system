import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";

function Login() {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim() === "") return;
    navigate(`/inventario/${username}`);
  };

  return (
    <div className="app">
      <h1>Accesso VUT</h1>
      <form onSubmit={handleSubmit} className="login-form">
        <input
          type="text"
          placeholder="Inserisci il tuo nome utente"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="login-input"
        />
        <button type="submit" className="login-btn">Accedi</button>
      </form>
    </div>
  );
}

export default Login;
