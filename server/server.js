const express = require("express");
const app = express();
const port = 5000;
import {Pool} from "pg";
require("dotenv").config();
let config;
const cors = require("cors");

app.use(cors());

// middleware
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Store and retrieve your videos from here
// If you want, you can copy "exampleresponse.json" into here to have some data to work with
const movies = require("./movieData.json");

//heroku
if (process.env.DATABASE_URL) {
  config = {
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 5000,
    ssl: {
      rejectUnauthorized: false,
    },
  };
} else {
  // local

  config = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: "qadata",
    password: process.env.DB_PASS,
    port: 5432,
  };
}
const pool = new Pool(config);

// post
app.post("/", function (request, response) {
  let newMovie = request.body;
  console.log(newMovie);

  console.log(!newMovie.url);
  console.log(!newMovie.id);
  console.log(!newMovie.url.includes("youtube.com"));
  if (
    !newMovie.title ||
    !newMovie.url ||
    !newMovie.id ||
    !newMovie.url.includes("youtube.com")
  ) {
    response.status(400).send({
      result: "failure",
      message: "Video could not be saved",
    });
  }
  // checks is booking id already exists
  else if (movies.find((movie) => movie.id === newMovie.id)) {
    response.status(400);
    response.send("movie already exists");
  } else {
    movies.push(newMovie);
    response.status(201);
    response.send({Id: newMovie.id});
  }
});

// GET "/"

app.get("/", function (request, response) {
  let order = request.query.order;

  // if no order value given it wil set it to desc as default
  if (order === undefined) {
    order = "desc";
  }

  order = order.toLowerCase();
  if (order === "asc") {
    movies.sort(function (a, b) {
      0;
      return parseInt(a.rating) - parseInt(b.rating);
    });
    console.log(movies);
    return response.send(movies);
  } else if (order === "desc") {
    movies.sort(function (a, b) {
      return parseInt(b.rating) - parseInt(a.rating);
    });
    return response.send(movies);
  }
});

app.delete("/:id", (request, response) => {
  let id = parseInt(request.params.id);
  let deletedMovieIndex = movies.findIndex((movie) => movie.id === id);
  if (deletedMovieIndex > -1) {
    movies.splice(deletedMovieIndex, 1);
    // response.status(204);
    response.send({});
  } else {
    response.send({
      result: "failure",
      message: "Video could not be deleted",
    });
  }
});

// Reading a movies by ID
app.get("/:id", function (request, response) {
  // type conversion to int from string
  console.log(request.params.id);
  let id = parseInt(request.params.id);

  let filteredMovies = movies.find((movie) => movie.id === id);

  // if no booking found
  if (!filteredMovies) {
    response.status(404).send("Nothings found");
    return;
  }
  response.send(filteredMovies);
});

app.listen(port, () => console.log(`Listening on port ${port}`));
