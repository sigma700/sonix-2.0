const express = require("express");
let app = express();
app.set("view engine", "pug");
const path = require("path");
app.set("views", path.join(__dirname, "views"));
const fetch = require("node-fetch");
const btoa = require("btoa");
//SETING UP PUG AS THE VIEW-ENGINE

//make sure you first install the (dotenv) module
require("dotenv").config();

// let port = 5000;
const PORT = process.env.PORT || 5000;

console.log(PORT);

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "home.html"));
});

app.get("/welcome", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "signup.html"));
});

app.get("/welcome-back", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});
//SPOTIFY CREDENTIALS

const CLIENT_ID = process.env.CLIENT_ID;
console.log(`Your client id is :${CLIENT_ID}`);
const CLIENT_SECRET = process.env.CLIENT_SECRET;
console.log(`Your client secret id is :${CLIENT_SECRET}`);
//TOKEN MANAGEMENT

let acessToken = null;
let tokenExpiry = 0;

//TOKEN FETCHING FUNCTION
async function getSpotifyToken() {
  if (accessToken && Date.now() < tokenExpiry) return accessToken;

  const authString = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString(
    "base64"
  );

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${authString}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await response.json();
  accessToken = data.access_token;
  //SETTING NEW EXPIRY FOR MY TOKEN
  tokenExpiry = Date.now() + data.expires_in * 1000;
  return accessToken;
}

app.get("/new-releases", async (req, res) => {
  try {
    const token = await getSpotifyToken();
    const limit = req.query.limit || 10;
    const apiUrl = `https://api.spotify.com/v1/browse/new-releases?limit=${limit}`;

    const apiResponse = await fetch(apiUrl, {
      headers: {Authorization: `Bearer ${token}`},
    });

    const {albums} = await apiResponse.json();

    // Format data for Pug template
    const formattedReleases = albums.items.map((album) => ({
      name: album.name,
      artists: album.artists.map((a) => a.name),
      release_date: album.release_date,
      total_tracks: album.total_tracks,
      image: album.images[0]?.url,
    }));

    // Render the Pug template with data
    res.render("releases", {
      releases: formattedReleases,
    });
  } catch (error) {
    res.status(500).render("error", {message: "Failed to load releases"});
  }
});
app.listen(PORT, () =>
  console.log(`Server is running on  https://localhost:${PORT}`)
);
