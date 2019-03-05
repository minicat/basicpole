import { KnownBlock } from "@slack/client";

const EMOJI_NUMBERS = ["0️⃣", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"];

const QUOTE_PAIRS: {[key: string] : string} = {
    '“': '”',
    '"': '"',
    "'": "'"
};

const EMOJI_REGEX = /^:[\w-]+:$/;

function numberToEmojiString(n: number) {
    let emojiString = '';
    for (let c of n.toString()) {
        emojiString += EMOJI_NUMBERS[parseInt(c, 10)];
    }
    return emojiString;
}

export function parsePollText(text: string): { content: string, options: Option[], flags: string[] } | undefined {
    const parts = [];
    const flags = [];

    let i = 0;
    let openQuote = '';
    let openQuoteI = 0;

    while (i < text.length) {
        if (openQuote !== '' && text[i] === QUOTE_PAIRS[openQuote]) {
            parts.push(text.substring(openQuoteI + 1, i));
            openQuote = '';
        } else if (openQuote == '') {
            if (QUOTE_PAIRS.hasOwnProperty(text[i])) {
                openQuote = text[i];
                openQuoteI = i;
            } else if (text[i] == '-') {
                // parse flag...
                let flagEnd = text.indexOf(' ', i);
                if (flagEnd === -1) flagEnd = text.length;
                flags.push(text.substring(i, flagEnd));
                i = flagEnd;
            } else if (text[i] != ' ') {
                return undefined;
            }
        }
        i += 1;
    }

    // should not have pending open quote at this time
    if (openQuote !== '') return undefined;

    return {
        content: parts[0],
        options: parts.slice(1).map((content: string) => {
            return {
                content: content,
                votes: [],
            };
        }),
        flags,
    }
}

export type Poll = {
    content: string,
    options: Option[],
    anonymous: boolean,
    user: User | null,
};

export type Option = {
    content: string,
    votes: User[],
};

export type User = string;

function renderUser(user: User): string {
    return `<@${user}>`;
}

export function splitOptionContent(content: string, i: number): {emoji: string, content: string} {
    // if option.content starts with a :slack_emoji:, use that as the emoji
    // it's also OK for the entire thing to be an emoji.
    // TODO: maybe support multiple emojis?
    // separated for easier testing!
    if (EMOJI_REGEX.test(content)) {
        // entire content is emoji
        return {emoji: content, content: ''};
    }

    if (content[0] == ':') {
        const endIndex = content.indexOf(':', 1);
        if (endIndex !== -1 && EMOJI_REGEX.test(content.substring(0, endIndex + 1))) {
            return {
                emoji: content.substring(0, endIndex + 1),
                content: content.substring(endIndex + 1)
            };
        }
    }

    return {emoji: numberToEmojiString(i + 1), content: content};
}

export function pollContentToBlocks(poll: Poll): KnownBlock[] {
    // Formats an existing poll into the content of the `blocks` section for postMessage/update
    const optionsWithEmoji = poll.options.map((option, i) => {
        // if option.content starts with a :slack_emoji:, use that as the emoji
        const {emoji, content} = splitOptionContent(option.content, i);
        return {emoji: emoji, content: content, votes: option.votes};
    })

    const renderedOptions = optionsWithEmoji.map((option) => {
        let text = `${option.emoji} ${option.content} \`${option.votes.length}\``;
        if (!poll.anonymous) {
            text += `\n${option.votes.map(renderUser).join(' ')}`;
        }
        return text;
    });

    const actionButtons = optionsWithEmoji.map((option, i) => {
        return {
            "type": "button",
            "text": {
                "type": "plain_text",
                "text": option.emoji,
                "emoji": true
            },
            "action_id": i.toString(),
        }
    })

    const msgs = [];
    if (poll.user) {
        msgs.push(`Poll added by <@${poll.user}>.`);
    }
    if (poll.anonymous) {
        msgs.push('Voting is anonymous.');
    }

    const header: KnownBlock[] = [
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": (poll.content ? `*${poll.content}*` : '')
                    + (msgs.length > 0 ? ' _(' + msgs.join(' ') + ')_' : ''),
            }
        }
    ];
    return header.concat(renderedOptions.map((option): KnownBlock => {
        return {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": option,
            }
        };
    }), [{
        "type": "actions",
        "elements": actionButtons,
    }]);
}
