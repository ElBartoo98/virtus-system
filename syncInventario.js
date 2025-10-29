// ======================================================
// 🌀 SYNC INVENTARIO: copia l'inventario.csv nel progetto
// ======================================================

const fs = require("fs");
const path = require("path");

// 📁 Percorso del file sorgente (quello originale sul tuo PC)
const sourcePath = path.resolve(
  "C:/Users/Utente/OneDrive/Desktop/Obito Uchiha/ElBarto_98_ Twitch/Squadra Virtus Colleverde/Carte con LOGO/VirtusSystem/inventario.csv"
);

// 📁 Percorso di destinazione nel progetto (quello usato dal server)
const destPath = path.resolve(__dirname, "data", "inventario.csv");

// ✅ Copia il file
if (!fs.existsSync(sourcePath)) {
  console.error("❌ ERRORE: file inventario.csv non trovato al percorso originale!");
  process.exit(1);
}

fs.copyFile(sourcePath, destPath, (err) => {
  if (err) {
    console.error("❌ Errore durante la copia del file:", err);
  } else {
    console.log("✅ inventario.csv sincronizzato con successo!");
    console.log("Da:", sourcePath);
    console.log("A :", destPath);
  }
});
