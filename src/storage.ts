import SQL from 'sql-template-strings';
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

    async createPoll(poll: NewPoll): Promise<ExistingPoll> {
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
        return {
            channel_id: poll.channel_id,
            ts: poll.ts,
            content: poll.content,
            multivote: poll.multivote,
            options: poll.options.map((option) => {
                return {
                    content: option.content,
                    votes: [],
                };
            }),
        };
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
}

export async function createStorage(file: string): Promise<Storage> {
    const db = await sqlite.open(file, { promise: Promise });
    await db.migrate({});
    return new Storage(db);
}
