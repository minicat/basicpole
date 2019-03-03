import bodyParser from "body-parser";
import * as http from "http";

import express = require('express');

import {existingPollToBlocks} from "./helpers";
import * as storage from "./storage";

const app = express()
const port = 8001;

// for parsing application/x-www-form-urlencoded - sent to slash commands/button clicks
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', (req, res) => res.send('Hello World!'))

app.post('/create', (req, res) => {
    // req has: channel_id, user_id, text (full command text)
    console.log(req.body);

    console.log(JSON.stringify(existingPollToBlocks({
        channel_id: "1",
        ts: "123",
        content: "DO YOU LIKE PUSHEEN",
        multivote: false,
        options: [
            {
                content: "YES",
                votes: ['minicat', 'goffrie']
            },
            {
                content: "NO",
                votes: []
            }
        ]
    }), null, '  '));
    res.send('you hit create!')
})

app.post('/vote', (req, res) => {
    // req has `payload` parameter (parse as json) that corresponds to the button clicked
    // of note: payload.user.id, payload.actions[0].action_id, payload.container.message_ts, payload.container.channel_id
    // see https://api.slack.com/messaging/interactivity/enabling pt 3
    const payload = JSON.parse(req.body.payload);
    console.log(payload);
    res.send('you hit vote!');
})

app.listen(port, () => console.log(`BASIC POLE listening on port ${port}!`))
