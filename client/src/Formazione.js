import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./App.css";

function Formazione() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [carte, setCarte] = useState([]);
  const [formazione, setFormazione] = useState("3-3-1");
  const [posizioni, setPosizioni] = useState({});
  const [nomeFormazione, setNomeFormazione] = useState("");
  const [formazioniSalvate, setFormazioniSalvate] = useState([]);
  const [giornataAttiva, setGiornataAttiva] = useState(null);
  const [inviata, setInviata] = useState(false);

  // =====================================================
  // 📍 POSIZIONI PER OGNI MODULO
  // =====================================================
  const posizioniFormazioni = {
    "3-3-1": [
      { id: "por", x: 50, y: 72 },
      { id: "dif1", x: 25, y: 44 },
      { id: "dif2", x: 50, y: 44 },
      { id: "dif3", x: 75, y: 44 },
      { id: "cen1", x: 30, y: 16 },
      { id: "cen2", x: 50, y: 16 },
      { id: "cen3", x: 70, y: 16 },
      { id: "att", x: 50, y: -11 },
    ],
    "2-4-1": [
      { id: "por", x: 50, y: 72 },
      { id: "dif1", x: 38, y: 44 },
      { id: "dif2", x: 62, y: 44 },
      { id: "cen1", x: 20, y: 20 },
      { id: "cen2", x: 38, y: 16 },
      { id: "cen3", x: 62, y: 16 },
      { id: "cen4", x: 80, y: 20 },
      { id: "att", x: 50, y: -11 },
    ],
    "2-2-3": [
      { id: "por", x: 50, y: 72 },
      { id: "dif1", x: 35, y: 44 },
      { id: "dif2", x: 65, y: 44 },
      { id: "cen1", x: 40, y: 16 },
      { id: "cen2", x: 60, y: 16 },
      { id: "att1", x: 25, y: -11 },
      { id: "att2", x: 50, y: -11 },
      { id: "att3", x: 75, y: -11 },
    ],
  };

  // =====================================================
  // 🔄 CARICA CARTE, FORMAZIONI E GIORNATA
  // =====================================================
  useEffect(() => {
    const caricaDati = async () => {
      try {
        const carteRes = await axios.get(`http://localhost:3001/inventario/${username}`);
        setCarte(carteRes.data);

        const formRes = await axios.get(`http://localhost:3001/formazioni/${username}`);
        setFormazioniSalvate(formRes.data);

        const giornRes = await axios.get("http://localhost:3001/giornate");
        const giornate = Object.values(giornRes.data || {});
        const ora = new Date();

        const attiva = giornate.find(
          (g) => g.stato === "aperta" && new Date(g.scadenza).getTime() > ora.getTime()
        );
        setGiornataAttiva(attiva || null);
      } catch (err) {
        console.error("Errore caricamento dati:", err);
      }
    };

    caricaDati();
  }, [username]);

  // =====================================================
  // 🖐️ DRAG & DROP
  // =====================================================
  const handleDragStart = (e, carta) => {
    if (inviata) return;
    e.dataTransfer.setData("carta", carta);
  };

  const handleDrop = (slotId, e) => {
    if (inviata) return;
    e.preventDefault();
    const carta = e.dataTransfer.getData("carta");
    setPosizioni((prev) => ({ ...prev, [slotId]: carta }));
  };

  const handleDragOver = (e) => e.preventDefault();

  // =====================================================
  // 💾 SALVA FORMAZIONE
  // =====================================================
  const salvaFormazione = async () => {
    if (!nomeFormazione.trim()) {
      alert("Dai un nome alla formazione!");
      return;
    }
    try {
      const res = await axios.post(`http://localhost:3001/salvaFormazione/${username}`, {
        nome: nomeFormazione.trim(),
        modulo: formazione,
        posizioni,
      });
      alert(res.data.messaggio || "Formazione salvata!");
      setNomeFormazione("");
      aggiornaFormazioni();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.errore || "Errore nel salvataggio");
    }
  };

  // =====================================================
  // 🧭 GESTIONE FORMAZIONI SALVATE
  // =====================================================
  const caricaFormazione = (form) => {
    // 🩹 Compatibilità con le formazioni ufficiali (che usano "formazione" anziché "modulo")
    const modulo = form.modulo || form.formazione || "3-3-1";
    const pos = form.posizioni || {};
    setFormazione(modulo);
    setPosizioni(pos);
    setInviata(!!form.locked); // Se ufficiale, blocca
  };

  const eliminaFormazione = async (nome) => {
    if (!window.confirm(`Vuoi eliminare "${nome}"?`)) return;
    await axios.delete(`http://localhost:3001/formazioni/${username}/${nome}`);
    aggiornaFormazioni();
  };

  const aggiornaFormazioni = async () => {
    const res = await axios.get(`http://localhost:3001/formazioni/${username}`);
    setFormazioniSalvate(res.data);
  };

  // =====================================================
  // 📤 INVIO FORMAZIONE UFFICIALE
  // =====================================================
  const inviaFormazione = async () => {
    if (!giornataAttiva) {
      alert("Nessuna giornata attiva!");
      return;
    }
    if (Object.keys(posizioni).length < 8) {
      alert("Completa tutti gli slot prima di inviare!");
      return;
    }

    try {
      const res = await axios.post("http://localhost:3001/formazione/invia", {
        username,
        formazione,
        posizioni,
      });
      alert(res.data.message || "✅ Formazione inviata correttamente!");
      setInviata(true);
    } catch (err) {
      console.error(err);
      alert("Errore durante l'invio della formazione.");
    }
  };

  // =====================================================
  // 🖼️ RENDER
  // =====================================================
  const slots = posizioniFormazioni[formazione] || [];

  return (
    <div className="formazione-layout">
      {/* Sidebar */}
      <div className="sidebar">
        <h2>Le tue carte</h2>
        {carte.length > 0 ? (
          carte.map((item, index) => (
            <div
              key={index}
              className="carta mini-carta"
              draggable={!inviata}
              onDragStart={(e) => handleDragStart(e, item.carta)}
            >
              <img
                src={`/carte/${item.carta}.png`}
                alt={item.carta}
                className="immagine-carta"
              />
            </div>
          ))
        ) : (
          <p>Nessuna carta trovata</p>
        )}
      </div>

      {/* Campo */}
      <div className="campo-disegnato">
        <div className="campo-header">
          <h1>Formazione di {username}</h1>
          <select
            className="selettore-modulo"
            value={formazione}
            disabled={inviata}
            onChange={(e) => {
              setFormazione(e.target.value);
              setPosizioni({});
            }}
          >
            <option value="3-3-1">3-3-1</option>
            <option value="2-4-1">2-4-1</option>
            <option value="2-2-3">2-2-3</option>
          </select>
          <button className="login-btn" onClick={() => navigate(`/inventario/${username}`)}>
            Torna all'inventario
          </button>
        </div>

        {/* Formazioni salvate */}
        <div className="formazioni-salvate">
          <h3>📁 Formazioni salvate</h3>
          {formazioniSalvate.length > 0 ? (
            formazioniSalvate.map((f, i) => (
              <div key={i} className="formazione-salvata">
                <strong>{f.nome || f.giornata || "Formazione"}</strong> ({f.modulo || f.formazione})
                <button disabled={inviata} onClick={() => caricaFormazione(f)}>Carica</button>
                {!f.locked && (
                  <button disabled={inviata} onClick={() => eliminaFormazione(f.nome)}>❌</button>
                )}
              </div>
            ))
          ) : (
            <p>Nessuna formazione salvata</p>
          )}
        </div>

        {/* Salva nuova formazione */}
        {!inviata && (
          <div className="salva-formazione">
            <input
              type="text"
              placeholder="Nome formazione"
              value={nomeFormazione}
              onChange={(e) => setNomeFormazione(e.target.value)}
              disabled={inviata}
            />
            <button className="login-btn" disabled={inviata} onClick={salvaFormazione}>
              Salva Formazione
            </button>
          </div>
        )}

        {/* Slot */}
        <div className="campo-container">
          {slots.map((slot) => (
            <div
              key={slot.id}
              className="slot-giocatore"
              onDrop={(e) => handleDrop(slot.id, e)}
              onDragOver={handleDragOver}
              style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
            >
              {posizioni[slot.id] ? (
                <img
                  src={`/carte/${posizioni[slot.id]}.png`}
                  alt={posizioni[slot.id]}
                  className="immagine-carta slot-carta"
                />
              ) : (
                <div className="slot-vuoto"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 🔥 Pulsante invio ufficiale */}
      {giornataAttiva && (
        <div
          style={{
            position: "fixed",
            bottom: "15px",
            left: "33%",
            transform: "translateX(-50%)",
            zIndex: 9999,
            textAlign: "center",
          }}
        >
          <button
            className="login-btn"
            disabled={inviata}
            onClick={inviaFormazione}
            style={{
              backgroundColor: inviata ? "gray" : "#00c853",
              cursor: inviata ? "not-allowed" : "pointer",
              padding: "14px 30px",
              fontSize: "1.1rem",
              fontWeight: "bold",
              borderRadius: "10px",
              boxShadow: "0px 0px 12px rgba(0,0,0,0.3)",
            }}
          >
            {inviata
              ? "✅ Formazione inviata"
              : `📤 Invia formazione ufficiale (${giornataAttiva.nome})`}
          </button>
        </div>
      )}
    </div>
  );
}

export default Formazione;
