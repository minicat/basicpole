import bodyParser from "body-parser";
import * as http from "http";

import express = require('express');
import * as storage from "./storage";

const app = express()
const port = 8001;

// not sure if button clicks use json or urlencoded
app.use(bodyParser.json());
// for parsing application/x-www-form-urlencoded - sent to slash commands
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', (req, res) => res.send('Hello World!'))

app.post('/create', (req, res) => {
    // req has: channel_id, user_id, text (full command text)
    console.log(req.body);
    res.send('you hit create!')
})

app.post('/vote', (req, res) => {
    // req has `payload` parameter (parse as json) that corresponds to the button clicked
    // see https://api.slack.com/messaging/interactivity/enabling pt 3
    console.log(req.body);
    res.send('you hit vote!');
})

app.listen(port, () => console.log(`BASIC POLE listening on port ${port}!`))
