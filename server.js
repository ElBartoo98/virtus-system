// ======================================================
// 🌀 VIRTUS SYSTEM - SERVER COMPLETO
// ======================================================
const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const csv = require("csv-parser");

const app = express();
app.use(cors());
app.use(express.json());

// ======================================================
// 📂 Percorsi assoluti dei file
// ======================================================
const baseDir = __dirname;
const dataDir = path.join(baseDir, "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

const inventarioPath =
  "C:/Users/Utente/OneDrive/Desktop/Obito Uchiha/ElBarto_98_ Twitch/Squadra Virtus Colleverde/Carte con LOGO/VirtusSystem/inventario.csv";
const formazioniPath = path.join(dataDir, "formazioni.json");
const giornatePath = path.join(dataDir, "giornate.json");
const votiPath = path.join(dataDir, "voti.json");
const classificaPath = path.join(dataDir, "classifica.json");
const classificaTotPath = path.join(dataDir, "classifica_totale.json");

const ensureFile = (file, defaultContent = "{}") => {
  if (!fs.existsSync(file)) fs.writeFileSync(file, defaultContent);
};
[formazioniPath, giornatePath, votiPath, classificaPath, classificaTotPath].forEach((p) =>
  ensureFile(p)
);

// ======================================================
// 🧩 INVENTARIO UTENTE
// ======================================================
app.get("/inventario/:username", (req, res) => {
  const user = req.params.username.toLowerCase();
  const results = [];

  fs.createReadStream(inventarioPath)
    .pipe(csv())
    .on("data", (data) => {
      if (data.Utente && data.Utente.toLowerCase() === user) {
        results.push({ carta: data.Carta, data: data.DataOra });
      }
    })
    .on("end", () => res.json(results))
    .on("error", (err) => res.status(500).json({ errore: err.message }));
});

// ======================================================
// ⚙️ GESTIONE GIORNATE (Admin)
// ======================================================
app.get("/giornate", (req, res) => {
  try {
    const giornate = JSON.parse(fs.readFileSync(giornatePath));
    res.json(giornate);
  } catch (err) {
    console.error("Errore lettura giornate:", err);
    res.status(500).json({ errore: "Errore lettura giornate" });
  }
});

app.post("/giornate", (req, res) => {
  const { nome, scadenza } = req.body;
  if (!nome || !scadenza)
    return res.status(400).json({ errore: "Nome o scadenza mancanti" });

  try {
    const giornate = JSON.parse(fs.readFileSync(giornatePath));
    const id = Date.now().toString();

    giornate[id] = { nome, scadenza, stato: "aperta", formazioni: {} };
    fs.writeFileSync(giornatePath, JSON.stringify(giornate, null, 2));

    console.log(`✅ Giornata creata: ${nome}`);
    res.json({ ok: true, messaggio: `✅ Giornata "${nome}" creata con successo!` });
  } catch (err) {
    console.error("Errore creazione giornata:", err);
    res.status(500).json({ errore: "Errore salvataggio giornata" });
  }
});

app.put("/giornate/:id", (req, res) => {
  const id = req.params.id;
  const { stato } = req.body;

  try {
    const giornate = JSON.parse(fs.readFileSync(giornatePath));
    if (!giornate[id]) return res.status(404).json({ errore: "Giornata non trovata" });

    giornate[id].stato = stato || giornate[id].stato;
    fs.writeFileSync(giornatePath, JSON.stringify(giornate, null, 2));

    console.log(`🔄 Stato giornata ${giornate[id].nome} aggiornato a ${stato}`);
    res.json({ ok: true });
  } catch (err) {
    console.error("Errore aggiornamento giornata:", err);
    res.status(500).json({ errore: "Errore aggiornamento giornata" });
  }
});

app.delete("/giornate/:id", (req, res) => {
  const id = req.params.id;
  try {
    const giornate = JSON.parse(fs.readFileSync(giornatePath));
    if (!giornate[id]) return res.status(404).json({ errore: "Giornata non trovata" });

    console.log(`🗑️ Eliminata giornata: ${giornate[id].nome}`);
    delete giornate[id];
    fs.writeFileSync(giornatePath, JSON.stringify(giornate, null, 2));
    res.json({ ok: true });
  } catch (err) {
    console.error("Errore eliminazione giornata:", err);
    res.status(500).json({ errore: "Errore eliminazione giornata" });
  }
});

// ======================================================
// 💾 SALVATAGGIO / LETTURA FORMAZIONI
// ======================================================
app.get("/formazioni/:username", (req, res) => {
  try {
    const username = req.params.username;
    const formazioni = JSON.parse(fs.readFileSync(formazioniPath));
    res.json(formazioni[username] || []);
  } catch (err) {
    console.error("Errore lettura formazioni:", err);
    res.status(500).json({ errore: "Errore lettura formazioni" });
  }
});

app.post("/salvaFormazione/:username", (req, res) => {
  try {
    const username = req.params.username;
    const { nome, modulo, posizioni } = req.body;
    const formazioni = JSON.parse(fs.readFileSync(formazioniPath));

    if (!formazioni[username]) formazioni[username] = [];
    formazioni[username].push({ nome, modulo, posizioni });
    fs.writeFileSync(formazioniPath, JSON.stringify(formazioni, null, 2));

    res.json({ ok: true, messaggio: "✅ Formazione salvata correttamente!" });
  } catch (err) {
    console.error("Errore salvataggio formazione:", err);
    res.status(500).json({ errore: "Errore salvataggio formazione" });
  }
});

app.delete("/formazioni/:username/:nome", (req, res) => {
  try {
    const { username, nome } = req.params;
    const formazioni = JSON.parse(fs.readFileSync(formazioniPath));
    if (formazioni[username]) {
      formazioni[username] = formazioni[username].filter((f) => f.nome !== nome);
      fs.writeFileSync(formazioniPath, JSON.stringify(formazioni, null, 2));
    }
    res.json({ ok: true });
  } catch (err) {
    console.error("Errore eliminazione formazione:", err);
    res.status(500).json({ errore: "Errore eliminazione formazione" });
  }
});

// ======================================================
// 📤 INVIO FORMAZIONE UFFICIALE (UTENTE)
// ======================================================
app.post("/formazione/invia", (req, res) => {
  try {
    const { username, formazione, posizioni } = req.body;
    const giornate = JSON.parse(fs.readFileSync(giornatePath));
    const dataCorrente = new Date();

    const giornataAttiva = Object.values(giornate).find(
      (g) => g.stato === "aperta" && new Date(g.scadenza) > dataCorrente
    );

    if (!giornataAttiva)
      return res.status(400).json({ error: "Nessuna giornata aperta o scadenza superata." });

    const formazioni = JSON.parse(fs.readFileSync(formazioniPath));
    if (!formazioni[username]) formazioni[username] = [];

    formazioni[username].push({
      giornata: giornataAttiva.nome,
      data: giornataAttiva.scadenza,
      formazione,
      posizioni,
      locked: true,
    });

    fs.writeFileSync(formazioniPath, JSON.stringify(formazioni, null, 2));
    console.log(`📨 Formazione inviata da ${username} per ${giornataAttiva.nome}`);
    res.json({ ok: true, message: "Formazione inviata correttamente!" });
  } catch (err) {
    console.error("Errore invio formazione:", err);
    res.status(500).json({ errore: "Errore invio formazione" });
  }
});

// ======================================================
// 🔍 ADMIN: Visualizza formazioni inviate per giornata
// ======================================================
app.get("/admin/formazioni/:giornata", (req, res) => {
  try {
    const giornataRichiesta = decodeURIComponent(req.params.giornata).trim();
    const formazioni = JSON.parse(fs.readFileSync(formazioniPath));

    if (!Object.keys(formazioni).length) return res.json([]);

    const risultato = Object.entries(formazioni)
      .map(([username, elenco]) => {
        const f = elenco.find(
          (x) =>
            x.giornata &&
            x.giornata.toLowerCase().trim() === giornataRichiesta.toLowerCase()
        );
        return f ? { username, ...f } : null;
      })
      .filter(Boolean);

    res.json(risultato);
  } catch (err) {
    console.error("Errore lettura formazioni admin:", err);
    res.status(500).json({ errore: "Errore nel caricamento delle formazioni" });
  }
});

// ======================================================
// 🧮 GESTIONE VOTI + CLASSIFICHE
// ======================================================
app.post("/admin/voti", (req, res) => {
  const { giornata, voti } = req.body;
  if (!giornata || !voti)
    return res.status(400).json({ error: "Dati mancanti" });

  try {
    const votiData = JSON.parse(fs.readFileSync(votiPath));
    votiData[giornata] = voti;
    fs.writeFileSync(votiPath, JSON.stringify(votiData, null, 2));

    const formazioni = JSON.parse(fs.readFileSync(formazioniPath));
    const giornate = JSON.parse(fs.readFileSync(giornatePath));
    const giornataObj = Object.values(giornate).find((g) => g.nome === giornata);
    if (!giornataObj) return res.status(404).json({ error: "Giornata non trovata" });

    const classificaGiornata = {};
    for (const [utente, formlist] of Object.entries(formazioni)) {
      const formGiorno = formlist.find((f) => f.giornata === giornata);
      if (formGiorno && formGiorno.posizioni) {
        const votiUtente = Object.values(formGiorno.posizioni)
          .map((carta) => parseFloat(voti[carta]))
          .filter((v) => !isNaN(v));
        if (votiUtente.length > 0) {
          const media = votiUtente.reduce((a, b) => a + b, 0) / votiUtente.length;
          classificaGiornata[utente] = parseFloat(media.toFixed(2));
        }
      }
    }

    const classifica = JSON.parse(fs.readFileSync(classificaPath));
    classifica[giornata] = classificaGiornata;
    fs.writeFileSync(classificaPath, JSON.stringify(classifica, null, 2));

    const totale = JSON.parse(fs.readFileSync(classificaTotPath));
    for (const [utente, media] of Object.entries(classificaGiornata)) {
      if (!totale[utente]) totale[utente] = { punti: 0, giornate: 0 };
      totale[utente].punti += media;
      totale[utente].giornate += 1;
    }
    fs.writeFileSync(classificaTotPath, JSON.stringify(totale, null, 2));

    console.log(`✅ Voti e classifica aggiornati per ${giornata}`);
    res.json({ ok: true, messaggio: "✅ Voti salvati e classifica aggiornata!" });
  } catch (err) {
    console.error("❌ Errore salvataggio voti/classifica:", err);
    res.status(500).json({ error: "Errore durante il calcolo classifica" });
  }
});

// ======================================================
// 🏆 CLASSIFICHE PUBBLICHE
// ======================================================
app.get("/classifica", (req, res) => {
  try {
    const classifica = JSON.parse(fs.readFileSync(classificaPath));
    res.json(classifica);
  } catch (err) {
    res.status(500).json({ error: "Errore lettura classifica" });
  }
});

app.get("/classifica/totale", (req, res) => {
  try {
    const totale = JSON.parse(fs.readFileSync(classificaTotPath));
    res.json(totale);
  } catch (err) {
    res.status(500).json({ error: "Errore lettura classifica totale" });
  }
});

// ======================================================
// 🌐 SERVE FRONTEND REACT SU RENDER
// ======================================================
const clientBuildPath = path.join(__dirname, "client", "build");
if (fs.existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(clientBuildPath, "index.html"));
  });
}

// ======================================================
// 🚀 AVVIO SERVER
// ======================================================
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`✅ Server attivo sulla porta ${PORT}`));
