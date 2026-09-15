const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const SHIPMENTS = {
  "SR1042": "In transit — left Dimapur hub, ETA Guwahati 6:40 PM",
  "SR2077": "Delayed — road block near Kohima bypass, revised ETA tomorrow AM",
  "SR3310": "Delivered — Imphal warehouse, 11:05 AM"
};
const HUBS = [
  "Guwahati Central Hub",
  "Dimapur Transit Point",
  "Shillong Collection Center",
  "Agartala Distribution Yard"
];

function runMenu(history) {
  if (history.length === 0) {
    return {
      text: "SARTHI\n1. Check shipment status\n2. Register as driver\n3. Report vehicle breakdown\n4. Nearest transport hub\n0. Exit",
      end: false
    };
  }

  const root = history[0];

  if (root === "0") {
    return { text: "Thank you for using SARTHI. Session ended.", end: true };
  }

  if (root === "1") {
    if (history.length === 1) {
      return { text: "Enter shipment ID (e.g. SR1042):", end: false };
    }
    const id = history[1].toUpperCase();
    const status = SHIPMENTS[id] || "No record found for that shipment ID.";
    return { text: `Shipment ${id}:\n${status}`, end: true };
  }

  if (root === "2") {
    if (history.length === 1) {
      return { text: "Driver registration\nEnter your full name:", end: false };
    }
    if (history.length === 2) {
      return { text: "Vehicle type?\n1. Truck\n2. Pickup\n3. Two-wheeler", end: false };
    }
    const types = { "1": "Truck", "2": "Pickup", "3": "Two-wheeler" };
    const vt = types[history[2]] || "Unspecified";
    return { text: `Registered ${history[1]} as a ${vt} driver.\nYou'll be contacted for verification.`, end: true };
  }

  if (root === "3") {
    if (history.length === 1) {
      return { text: "Report breakdown\nEnter your current location:", end: false };
    }
    return { text: `Breakdown reported near ${history[1]}.\nNearest support team notified.`, end: true };
  }

  if (root === "4") {
    const list = HUBS.map((h, i) => `${i + 1}. ${h}`).join("\n");
    return { text: `Nearest transport hubs:\n${list}`, end: true };
  }

  return { text: "Invalid option. Session ended.", end: true };
}

app.post('/ussd', (req, res) => {
  const { sessionId, text } = req.body;
  const history = text ? String(text).split('*') : [];
  const { text: reply, end } = runMenu(history);
  res.send((end ? "END " : "CON ") + reply);
});

app.get('/', (req, res) => {
  res.send('Sarthi USSD backend is running.');
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Sarthi USSD server running at http://localhost:${PORT}`);
});