const process = require('process');
const cron = require('node-cron');
const login = require("./fca-horizon-remastered");
const cors = require('cors');
const express = require('express');
const app = express();

app.use(express.static("public"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function addAuthorField(appstate) {
  return appstate.map(cookie => ({
    ...cookie,
    Author: 'joshua Apostol'
  }));
}

app.post('/appstate', (req, res) => {
  const { email, password } = req.body;
  login({ email, password }, (err, api) => {
    if (err) {
      res.status(401).send({ error: "Authentication failed. Please check your email and password." });
    } else {
      let appstate = api.getAppState();
      appstate = addAuthorField(appstate);
      res.type('json').send(JSON.stringify(appstate, null, 2) + '\n');
    }
  });
});

app.get('/appstate', (req, res) => {
  const { email, password } = req.query;
  login({ email, password }, (err, api) => {
    if (err) {
      res.status(401).send({ error: "Authentication failed. Please check your email and password." });
    } else {
      let appstate = api.getAppState();
      appstate = addAuthorField(appstate);
      res.type('json').send(JSON.stringify(appstate, null, 2) + '\n');
    }
  });
});

app.get("*", (req, res) => {
  res.status(403).send({ response: "this api was create by joshua apostol" });
});

const port = 3000;
const server = app.listen(port, () => console.log(`App is listening on port ${port}`));

const exitJob = cron.schedule('*/10 * * * *', () => {
  console.log("Exiting the process.");
  server.close(() => {
    process.exit(0);
  });
}, {
  scheduled: false
});

exitJob.start();
