import SQL from "sql-template-strings";
import * as sqlite from "sqlite";

export type NewPoll = {
    channel_id: string,
    ts: string,
    content: string,
    options: NewOption[],
    multivote: boolean,
};

export type NewOption = {
    content: string,
};

export type ExistingPoll = {
    channel_id: string,
    ts: string,
    content: string,
    options: ExistingOption[],
    multivote: boolean,
};

export type ExistingOption = {
    content: string,
    votes: User[],
};

export type User = string;

export class NoSuchPollException extends Error {}

export class Storage {
    db: sqlite.Database;

    constructor(db: sqlite.Database) {
        this.db = db;
    }

    async createPoll(poll: NewPoll): Promise<void> {
        await this.db.run(SQL`
INSERT INTO poll (channel_id, ts, content, multivote)
VALUES (${poll.channel_id}, ${poll.ts}, ${poll.content}, ${poll.multivote})
`);
        await Promise.all(poll.options.map((option: NewOption, index: number) => {
            this.db.run(SQL`
INSERT INTO option (channel_id, ts, option_id, content)
VALUES (${poll.channel_id}, ${poll.ts}, ${index}, ${option.content})
`);
        }));
    }

    async getPoll(channel_id: string, ts: string): Promise<ExistingPoll> {
        const [poll, options, votes] = await Promise.all([
            this.db.get(SQL`SELECT content, multivote FROM poll WHERE channel_id = ${channel_id} AND ts = ${ts}`),
            this.db.all(SQL`SELECT option_id, content FROM option WHERE channel_id = ${channel_id} AND ts = ${ts} ORDER BY option_id ASC`),
            this.db.all(SQL`SELECT option_id, user FROM vote WHERE channel_id = ${channel_id} AND ts = ${ts} ORDER BY option_id ASC, user ASC`),
        ]);
        if (!poll) {
            throw new NoSuchPollException("No such poll");
        }
        const votes_by_option: User[][] = options.map(() => []);
        for (const vote of votes) {
            votes_by_option[vote.option_id].push(vote.user);
        }
        return {
            channel_id,
            ts,
            content: poll.content,
            multivote: !!poll.multivote,
            options: options.map((option, id) => {
                return {
                    content: option.content,
                    votes: votes_by_option[id],
                }
            }),
        };
    }

    async vote(channel_id: string, ts: string, user: User, option_id: number): Promise<void> {
        const r = await this.db.get(SQL`SELECT multivote FROM poll WHERE channel_id = ${channel_id} AND ts = ${ts}`);
        if (r === undefined) {
            throw new NoSuchPollException("No such poll");
        }
        const multivote = !!r.multivote;
        // this is racy but w/e, it's the user's fault if they click too fast
        const { has_existing_vote } = await this.db.get(SQL`
SELECT COUNT(*) AS has_existing_vote FROM vote
WHERE channel_id = ${channel_id}
AND ts = ${ts}
AND user = ${user}
AND option_id = ${option_id}
`);
        if (has_existing_vote) {
            // un-vote
            await this.db.run(SQL`
DELETE FROM vote
WHERE channel_id = ${channel_id}
AND ts = ${ts}
AND user = ${user}
AND option_id = ${option_id}
`);
        } else {
            // arcane bullshit to atomically change the user's vote if they've already voted in a non-multivote poll
            await this.db.run(SQL`
INSERT INTO vote
(channel_id, ts, option_id, user, multivote)
VALUES (${channel_id}, ${ts}, ${option_id}, ${user}, ${multivote})
ON CONFLICT (channel_id, ts, user) WHERE NOT multivote
DO UPDATE SET option_id = ${option_id}
`);
        }
    }
}

export async function createStorage(file: string): Promise<Storage> {
    const db = await sqlite.open(file, { promise: Promise });
    await db.migrate({});
    await db.run(SQL`PRAGMA foreign_keys = ON;`);
    return new Storage(db);
}
