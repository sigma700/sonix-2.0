const express = require("express");
let app = express();
const path = require("path");
let port = 5000;

app.use(express.static(path.join(__dirname, "public")));
app.listen(port, () =>
  console.log(`Server is running on server https://localhost:${port}`)
);
