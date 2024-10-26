require("dotenv").config();

const http = require("http");
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");

const { configure, database } = require("./startup");

const app = express();

app.use(helmet());
app.use(express.json({ type: ["application/json", "text/plain"] }));
app.use(cors());

const server = http.createServer(app);

configure(app);
database.connect();

const { PORT = 80 } = process.env;

app.get("/", (req, res) =>
  res.status(200).json({
    message: `Server is up and running`,
  })
);

app.use(require("./routes"));

server.listen(PORT, () => console.log(`Server starting on port: ${PORT}`));
