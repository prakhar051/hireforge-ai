
require("dotenv").config();

const app = require("./src/app");
const connectToDB = require("./src/config/database");

// ✅ START WORKER INSIDE BACKEND
require("./src/workers/interview.worker");

/* =========================
   CONNECT DATABASE
========================= */

connectToDB();

/* =========================
   SERVER
========================= */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
