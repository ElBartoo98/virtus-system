import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "./App.css";

function Inventario() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [righe, setRighe] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`http://localhost:3001/inventario/${username}`)
      .then((res) => setRighe(res.data || []))
      .catch((err) => console.error("Errore nel caricamento:", err))
      .finally(() => setLoading(false));
  }, [username]);

  // Conta le carte per nome
  const conteggi = useMemo(() => {
    const acc = {};
    righe.forEach((r) => {
      const key = r.carta;
      acc[key] = (acc[key] || 0) + 1;
    });
    return acc;
  }, [righe]);

  // Mostra 1 carta nel CLUB anche per i doppioni, e le restanti nei DOPPIONI
  const { club, doppioni } = useMemo(() => {
    const clubList = [];
    const doppioniList = [];

    Object.keys(conteggi)
      .sort((a, b) => a.localeCompare(b))
      .forEach((nome) => {
        const count = conteggi[nome];
        if (count >= 2) {
          clubList.push(nome);       // ne mostriamo una nel CLUB
          doppioniList.push(nome);   // e le altre nei DOPPIONI
        } else {
          clubList.push(nome);
        }
      });

    return { club: clubList, doppioni: doppioniList };
  }, [conteggi]);


  const Tile = ({ nome }) => (
    <div className="inv-card">
      <img
        src={`/carte/${nome}.png`}
        alt={nome}
        className="inv-card-img"
        draggable={false}
      />
      {conteggi[nome] > 1 && (
        <span className="inv-badge">x{conteggi[nome]}</span>
      )}
      <div className="inv-card-label">{nome}</div>
    </div>
  );

  return (
    <div className="inventory-page">
      <div className="inventory-header">
        <h1>Inventario di {username}</h1>
        <button
          className="btn-gold"
          onClick={() => navigate(`/formazione/${username}`)}
        >
          Vai alla Formazione
        </button>
      </div>

      {loading ? (
        <p className="inv-loading">Caricamento…</p>
      ) : (
        <>
          <section className="inv-section">
            <div className="inv-section-title">
              <h2>CLUB</h2>
              <span className="inv-count">{club.length}</span>
            </div>
            {club.length ? (
              <div className="inv-grid">
                {club.map((nome) => (
                  <Tile key={nome} nome={nome} />
                ))}
              </div>
            ) : (
              <p className="inv-empty">Nessuna carta singola trovata.</p>
            )}
          </section>

          <section className="inv-section">
            <div className="inv-section-title">
              <h2>DOPPIONI</h2>
              <span className="inv-count">{doppioni.length}</span>
            </div>
            {doppioni.length ? (
              <div className="inv-grid">
                {doppioni.map((nome) => (
                  <Tile key={nome} nome={nome} />
                ))}
              </div>
            ) : (
              <p className="inv-empty">Nessun doppione al momento.</p>
            )}
          </section>
        </>
      )}
    </div>
  );
}

export default Inventario;
