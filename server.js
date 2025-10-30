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

// ✅ Percorso dell’inventario: differente tra locale e Render
const inventarioPath =
  process.env.NODE_ENV === "production"
    ? path.join(dataDir, "inventario.csv") // Su Render: dentro /data
    : "C:/Users/Utente/OneDrive/Desktop/Obito Uchiha/ElBarto_98_ Twitch/Squadra Virtus Colleverde/Carte con LOGO/VirtusSystem/inventario.csv"; // Locale

const formazioniPath = path.join(dataDir, "formazioni.json");
const giornatePath = path.join(dataDir, "giornate.json");
const votiPath = path.join(dataDir, "voti.json");
const classificaPath = path.join(dataDir, "classifica.json");
const classificaTotPath = path.join(dataDir, "classifica_totale.json");

// ✅ Crea i file se non esistono
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

  // Se il file non esiste su Render, mostra errore controllato
  if (!fs.existsSync(inventarioPath)) {
    console.error("❌ File inventario.csv non trovato:", inventarioPath);
    return res.status(500).json({
      errore: "File inventario.csv mancante su server.",
      percorso: inventarioPath,
    });
  }

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
// 🌐 SERVE LE CARTE (anche in locale)
// ======================================================
const carteDir = path.join(__dirname, "client", "public", "carte");
if (fs.existsSync(carteDir)) {
  app.use("/carte", express.static(carteDir));
  console.log("🖼️ Cartelle carte servite da:", carteDir);
}

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
