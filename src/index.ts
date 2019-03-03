import bodyParser from "body-parser";
import express from "express";
import { Application, Request, Response } from "express";

import {existingPollToBlocks} from "./helpers";
import * as storage from "./storage";

async function main(): Promise<void> {
    const app: Application = express();
    const port: number = +(process.env.PORT || 8001);
    const db: storage.Storage = await storage.createStorage(process.env.DB || ':memory:');

    // for parsing application/x-www-form-urlencoded - sent to slash commands/button clicks
    app.use(bodyParser.urlencoded({extended: true}));

    app.get('/', (req: Request, res: Response) => res.send('Hello World!'))

    app.post('/create', (req: Request, res: Response) => {
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

    app.post('/vote', async (req: Request, res: Response) => {
        // req has `payload` parameter (parse as json) that corresponds to the button clicked
        // of note: payload.user.id, payload.actions[0].action_id, payload.container.message_ts, payload.container.channel_id
        // see https://api.slack.com/messaging/interactivity/enabling pt 3
        const payload = JSON.parse(req.body.payload);
        const user: string = payload.user.id;
        const option_id: number = parseInt(payload.actions[0].action_id);
        const ts: string = payload.container.message_ts;
        const channel_id: string = payload.container.channel_id;

        try {
            await db.vote(channel_id, ts, user, option_id);
            res.send('');
        } catch (e) {
            console.error(e);
            res.sendStatus(500);
        }
    })

    app.listen(port, () => console.log(`BASIC POLE listening on port ${port}!`))
}

main()
