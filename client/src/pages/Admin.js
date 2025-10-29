import React, { useState, useEffect } from "react";
import axios from "axios";
import "../App.css";

function Admin() {
  const [autenticato, setAutenticato] = useState(false);
  const [password, setPassword] = useState("");
  const [giornate, setGiornate] = useState([]);
  const [nome, setNome] = useState("");
  const [scadenza, setScadenza] = useState("");
  const [messaggio, setMessaggio] = useState("");

  // ✅ PASSWORD segreta
  const PASSWORD_CORRETTA = "virtus2025";

  // --- Login ---
  const gestisciLogin = () => {
    if (password === PASSWORD_CORRETTA) {
      setAutenticato(true);
      localStorage.setItem("adminAuth", "true");
    } else {
      alert("Password errata ❌");
    }
  };

  useEffect(() => {
    if (localStorage.getItem("adminAuth") === "true") {
      setAutenticato(true);
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("adminAuth");
    setAutenticato(false);
  };

  // --- Carica giornate ---
  const caricaGiornate = async () => {
    try {
      const res = await axios.get("http://localhost:3001/giornate");
      setGiornate(Object.entries(res.data || {}));
    } catch (err) {
      console.error("Errore caricamento giornate:", err);
      alert("Errore durante il caricamento delle giornate ❌");
    }
  };

  useEffect(() => {
    if (autenticato) caricaGiornate();
  }, [autenticato]);

  // --- Crea nuova giornata ---
  const creaGiornata = async () => {
    if (!nome || !scadenza) {
      alert("Inserisci un nome e una data di scadenza!");
      return;
    }

    try {
      await axios.post("http://localhost:3001/giornate", { nome, scadenza });
      setMessaggio("✅ Giornata creata con successo!");
      setNome("");
      setScadenza("");
      caricaGiornate();
    } catch (err) {
      console.error("Errore creazione giornata:", err);
      alert("Errore durante la creazione della giornata ❌");
    }
  };

  // --- Chiudi giornata ---
  const chiudiGiornata = async (id) => {
    if (!window.confirm("Chiudere questa giornata?")) return;
    try {
      await axios.put(`http://localhost:3001/giornate/${id}`, { stato: "chiusa" });
      setMessaggio("🔒 Giornata chiusa");
      caricaGiornate();
    } catch (err) {
      console.error("Errore chiusura giornata:", err);
      alert("Errore durante la chiusura della giornata ❌");
    }
  };

  // --- Riapri giornata ---
  const riapriGiornata = async (id) => {
    try {
      await axios.put(`http://localhost:3001/giornate/${id}`, { stato: "aperta" });
      setMessaggio("🔓 Giornata riaperta");
      caricaGiornate();
    } catch (err) {
      console.error("Errore riapertura giornata:", err);
      alert("Errore durante la riapertura della giornata ❌");
    }
  };

  // --- Elimina giornata ---
  const eliminaGiornata = async (id) => {
    if (!window.confirm("Vuoi eliminare definitivamente questa giornata?")) return;
    try {
      await axios.delete(`http://localhost:3001/giornate/${id}`);
      setMessaggio("🗑️ Giornata eliminata");
      caricaGiornate();
    } catch (err) {
      console.error("Errore eliminazione giornata:", err);
      alert("Errore durante l'eliminazione della giornata ❌");
    }
  };

  // --- SE NON AUTENTICATO ---
  if (!autenticato) {
    return (
      <div
        style={{
          height: "100vh",
          background: "linear-gradient(135deg, #1a1a1a, #705f2f, #d4af37)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          color: "white",
          textAlign: "center",
        }}
      >
        <h2>🔒 Accesso Admin</h2>
        <input
          type="password"
          placeholder="Inserisci la password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            padding: "10px",
            borderRadius: "8px",
            border: "none",
            outline: "none",
            width: "220px",
            textAlign: "center",
            marginBottom: "10px",
          }}
        />
        <button className="login-btn" onClick={gestisciLogin}>
          Entra
        </button>
      </div>
    );
  }

  // --- SE AUTENTICATO ---
  return (
    <div className="formazione-layout" style={{ flexDirection: "column", padding: "20px", color: "white" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>⚙️ Pannello Admin - Gestione Giornate</h1>
        <button className="btn-logout" onClick={logout}>Esci 🔓</button>
      </div>

      {/* --- CREA GIORNATA --- */}
      <div style={{ marginBottom: "30px", background: "#111", padding: "15px", borderRadius: "10px" }}>
        <h2>Crea nuova giornata</h2>
        <input
          type="text"
          placeholder="Nome giornata (es. Giornata 1 - Virtus vs Roma)"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          style={{ width: "100%", marginBottom: "10px", padding: "8px", borderRadius: "6px" }}
        />
        <input
          type="datetime-local"
          value={scadenza}
          onChange={(e) => setScadenza(e.target.value)}
          style={{ width: "100%", marginBottom: "10px", padding: "8px", borderRadius: "6px" }}
        />
        <button className="login-btn" onClick={creaGiornata}>➕ Crea Giornata</button>
        {messaggio && <p style={{ marginTop: "10px", color: "#00e676" }}>{messaggio}</p>}
      </div>

      {/* --- ELENCO GIORNATE --- */}
      <div>
        <h2>📅 Elenco giornate</h2>
        {giornate.length > 0 ? (
          giornate.map(([id, g]) => (
            <div key={id}
              style={{
                background: g.stato === "aperta" ? "#004d00" : "#3d0000",
                marginBottom: "10px",
                padding: "10px",
                borderRadius: "8px",
              }}
            >
              <h3>{g.nome}</h3>
              <p>
                <strong>Scadenza:</strong> {new Date(g.scadenza).toLocaleString()} <br />
                <strong>Stato:</strong> {g.stato}
              </p>

              {g.stato === "aperta" ? (
                <button className="btn-logout" onClick={() => chiudiGiornata(id)} style={{ marginRight: "10px" }}>
                  🔒 Chiudi
                </button>
              ) : (
                <button className="btn-inventario" onClick={() => riapriGiornata(id)} style={{ marginRight: "10px" }}>
                  🔓 Riapri
                </button>
              )}
              <button className="btn-logout" onClick={() => eliminaGiornata(id)}>🗑️ Elimina</button>

              {/* 👇 FORMAZIONI GIORNATA */}
              <FormazioniGiornata nomeGiornata={g.nome} />
            </div>
          ))
        ) : (
          <p>Nessuna giornata creata</p>
        )}
      </div>

      {/* 👇 SEZIONE VOTI */}
      <GestioneVoti />
    </div>
  );
}

// ====================================================
// 🧩 COMPONENTE: Formazioni inviate per giornata
// ====================================================
function FormazioniGiornata({ nomeGiornata }) {
  const [formazioni, setFormazioni] = useState([]);
  const [mostra, setMostra] = useState(false);
  const [dettaglio, setDettaglio] = useState(null);

  const caricaFormazioni = async () => {
    try {
      const res = await axios.get(`http://localhost:3001/admin/formazioni/${encodeURIComponent(nomeGiornata)}`);
      setFormazioni(res.data);
      setMostra(true);
    } catch (err) {
      console.error("Errore caricamento formazioni:", err);
      alert("Errore durante il caricamento delle formazioni inviate ❌");
    }
  };

  const scaricaJSON = (formazione) => {
    const blob = new Blob([JSON.stringify(formazione, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${formazione.username}_${nomeGiornata}.json`;
    link.click();
  };

  if (!mostra) {
    return (
      <button className="btn-inventario" style={{ marginTop: "10px" }} onClick={caricaFormazioni}>
        👀 Vedi formazioni inviate
      </button>
    );
  }

  return (
    <div style={{ marginTop: "10px", background: "#222", padding: "10px", borderRadius: "8px" }}>
      <h4>📋 Formazioni inviate ({formazioni.length})</h4>
      {formazioni.length === 0 ? (
        <p>Nessuna formazione inviata</p>
      ) : (
        formazioni.map((f, i) => (
          <div
            key={i}
            style={{
              borderBottom: "1px solid rgba(255,255,255,0.1)",
              padding: "5px 0",
              cursor: "pointer",
            }}
            onClick={() => setDettaglio(f)}
          >
            <strong>{f.username}</strong> — Modulo: {f.formazione}
          </div>
        ))
      )}

      {dettaglio && (
        <div style={{ marginTop: "10px", background: "#333", padding: "10px", borderRadius: "8px" }}>
          <h4>🧩 Formazione di {dettaglio.username}</h4>
          <p>
            <strong>Modulo:</strong> {dettaglio.formazione}
            <br />
            <strong>Data invio:</strong> {new Date(dettaglio.data).toLocaleString("it-IT")}
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
            {dettaglio.posizioni &&
              Object.entries(dettaglio.posizioni).map(([slot, carta]) => (
                <div key={slot} style={{ textAlign: "center" }}>
                  <img
                    src={`/carte/${carta}.png`}
                    alt={carta}
                    style={{ width: "80px", borderRadius: "8px" }}
                    onError={(e) => (e.target.src = "/carte/default.png")}
                  />
                  <p style={{ fontSize: "0.8rem" }}>{slot}</p>
                </div>
              ))}
          </div>

          <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
            <button className="btn-logout" onClick={() => setDettaglio(null)}>
              Chiudi dettaglio
            </button>
            <button className="btn-inventario" onClick={() => scaricaJSON(dettaglio)}>
              💾 Scarica formazione
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ====================================================
// 🧮 COMPONENTE: Inserisci voti + aggiorna classifica
// ====================================================
function GestioneVoti() {
  const [giornate, setGiornate] = useState([]);
  const [giornataSelezionata, setGiornataSelezionata] = useState("");
  const [voti, setVoti] = useState({});
  const [messaggio, setMessaggio] = useState("");

  useEffect(() => {
    caricaGiornate();
  }, []);

  const caricaGiornate = async () => {
    const res = await axios.get("http://localhost:3001/giornate");
    setGiornate(Object.values(res.data || {}));
  };

  const salvaVoti = async () => {
    if (!giornataSelezionata) {
      alert("Seleziona una giornata!");
      return;
    }
    try {
      await axios.post("http://localhost:3001/admin/voti", {
        giornata: giornataSelezionata,
        voti,
      });
      alert("✅ Voti salvati e classifica aggiornata!");
      setVoti({});
      setMessaggio(`Voti aggiornati per ${giornataSelezionata}`);
    } catch (err) {
      console.error(err);
      alert("Errore durante il salvataggio dei voti ❌");
    }
  };

  return (
    <div style={{ marginTop: "40px", background: "#111", padding: "15px", borderRadius: "10px" }}>
      <h2>🧮 Inserisci voti giocatori</h2>

      <select
        style={{ padding: "8px", borderRadius: "6px", marginBottom: "10px", width: "100%" }}
        value={giornataSelezionata}
        onChange={(e) => setGiornataSelezionata(e.target.value)}
      >
        <option value="">-- Seleziona giornata --</option>
        {giornate.map((g) => (
          <option key={g.nome} value={g.nome}>
            {g.nome}
          </option>
        ))}
      </select>

      <textarea
        rows="8"
        placeholder="Inserisci voti (esempio: Buffon=7.5, Chiellini=6, Tevez=8)"
        onChange={(e) => {
          const righe = e.target.value.split(",");
          const nuoviVoti = {};
          righe.forEach((r) => {
            const [nome, val] = r.split("=").map((x) => x.trim());
            if (nome && val) nuoviVoti[nome] = parseFloat(val);
          });
          setVoti(nuoviVoti);
        }}
        style={{
          width: "100%",
          marginBottom: "10px",
          borderRadius: "6px",
          padding: "10px",
          background: "#222",
          color: "white",
        }}
      ></textarea>

      <button className="btn-inventario" onClick={salvaVoti}>
        💾 Salva voti e aggiorna classifica
      </button>

      {messaggio && <p style={{ marginTop: "10px", color: "#00e676" }}>{messaggio}</p>}
    </div>
  );
}

export default Admin;
