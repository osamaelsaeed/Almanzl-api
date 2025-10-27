import "dotenv/config";
import express from "express";
import initDB from "./src/config/db.js";
import requestLogger from "./src/middlewares/requestLogger.js";

import { PORT, NODE_ENV } from "./src/config/config.js";

initDB();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

app.listen(PORT, () => {
  console.log(`app Listining at port ${PORT} (mode: ${NODE_ENV}) `);
});
