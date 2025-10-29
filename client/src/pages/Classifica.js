import React, { useEffect, useState } from "react";
import axios from "axios";
import "../App.css";

function Classifica() {
  const [giornate, setGiornate] = useState([]);
  const [classificaGiornate, setClassificaGiornate] = useState({});
  const [classificaTotale, setClassificaTotale] = useState({});
  const [giornataSelezionata, setGiornataSelezionata] = useState("");
  const [loading, setLoading] = useState(true);

  // ================================
  // 🔄 CARICAMENTO DATI
  // ================================
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [giornRes, classRes, totalRes] = await Promise.all([
          axios.get("http://localhost:3001/giornate"),
          axios.get("http://localhost:3001/classifica"),
          axios.get("http://localhost:3001/classifica/totale"),
        ]);

        setGiornate(Object.values(giornRes.data || {}));
        setClassificaGiornate(classRes.data || {});
        setClassificaTotale(totalRes.data || {});
      } catch (err) {
        console.error("Errore caricamento classifiche:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const classificaAttuale = giornataSelezionata
    ? classificaGiornate[giornataSelezionata] || {}
    : {};

  // ================================
  // 📊 UTILITY ORDINAMENTO
  // ================================
  const ordina = (obj) =>
    Object.entries(obj)
      .sort(([, a], [, b]) => b - a)
      .map(([utente, punteggio], i) => ({ pos: i + 1, utente, punteggio }));

  const classificaTotArray = Object.entries(classificaTotale).map(
    ([utente, { punti, giornate }]) => ({
      utente,
      media: giornate > 0 ? (punti / giornate).toFixed(2) : "0.00",
      giornate,
    })
  );

  classificaTotArray.sort((a, b) => b.media - a.media);

  // ================================
  // 🖼️ RENDER
  // ================================
  if (loading) {
    return (
      <div style={{ textAlign: "center", color: "white", marginTop: "100px" }}>
        ⏳ Caricamento classifiche...
      </div>
    );
  }

  return (
    <div
      style={{
        color: "white",
        padding: "30px",
        minHeight: "100vh",
        background: "linear-gradient(160deg, #0d0d0d, #1a1a1a)",
      }}
    >
      <h1 style={{ textAlign: "center", marginBottom: "30px" }}>🏆 Classifiche</h1>

      {/* ================================
          CLASSIFICA GIORNATA
      ================================= */}
      <div
        style={{
          background: "#111",
          padding: "20px",
          borderRadius: "10px",
          marginBottom: "40px",
        }}
      >
        <h2>📅 Classifica Giornata</h2>
        <select
          style={{
            width: "100%",
            marginTop: "10px",
            padding: "8px",
            borderRadius: "6px",
            background: "#222",
            color: "white",
          }}
          value={giornataSelezionata}
          onChange={(e) => setGiornataSelezionata(e.target.value)}
        >
          <option value="">-- Seleziona giornata --</option>
          {giornate.map((g, i) => (
            <option key={i} value={g.nome}>
              {g.nome}
            </option>
          ))}
        </select>

        {giornataSelezionata ? (
          Object.keys(classificaAttuale).length > 0 ? (
            <table
              style={{
                width: "100%",
                marginTop: "15px",
                borderCollapse: "collapse",
                textAlign: "center",
              }}
            >
              <thead>
                <tr style={{ borderBottom: "1px solid #555" }}>
                  <th>Pos</th>
                  <th>Utente</th>
                  <th>Media Voto</th>
                </tr>
              </thead>
              <tbody>
                {ordina(classificaAttuale).map((riga) => (
                  <tr key={riga.utente} style={{ borderBottom: "1px solid #333" }}>
                    <td>{riga.pos}</td>
                    <td>{riga.utente}</td>
                    <td>{riga.punteggio}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ marginTop: "10px" }}>Nessuna classifica disponibile per questa giornata.</p>
          )
        ) : (
          <p style={{ marginTop: "10px" }}>Seleziona una giornata per vedere i risultati.</p>
        )}
      </div>

      {/* ================================
          CLASSIFICA TOTALE
      ================================= */}
      <div
        style={{
          background: "#111",
          padding: "20px",
          borderRadius: "10px",
        }}
      >
        <h2>🌍 Classifica Totale</h2>
        {classificaTotArray.length > 0 ? (
          <table
            style={{
              width: "100%",
              marginTop: "15px",
              borderCollapse: "collapse",
              textAlign: "center",
            }}
          >
            <thead>
              <tr style={{ borderBottom: "1px solid #555" }}>
                <th>Pos</th>
                <th>Utente</th>
                <th>Giornate</th>
                <th>Media Totale</th>
              </tr>
            </thead>
            <tbody>
              {classificaTotArray.map((r, i) => (
                <tr key={r.utente} style={{ borderBottom: "1px solid #333" }}>
                  <td>{i + 1}</td>
                  <td>{r.utente}</td>
                  <td>{r.giornate}</td>
                  <td>{r.media}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ marginTop: "10px" }}>Nessuna classifica totale disponibile.</p>
        )}
      </div>
    </div>
  );
}

export default Classifica;
