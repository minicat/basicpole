import { KnownBlock } from "@slack/client";

const EMOJI_NUMBERS = ["0️⃣", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"];

const QUOTE_PAIRS: {[key: string] : string} = {
    '“': '”',
    '"': '"',
    "'": "'"
}

function numberToEmojiString(n: number) {
    let emojiString = '';
    for (let c of n.toString()) {
        emojiString += EMOJI_NUMBERS[parseInt(c, 10)];
    }
    return emojiString;
}

export function parsePollText(text: string): Poll | undefined {
    const parts = [];

    if (!(QUOTE_PAIRS.hasOwnProperty(text[0]))) return undefined;

    let i = 1;
    let openQuote = text[0];
    let openQuoteI = 0;

    while (i < text.length) {
        if (openQuote !== '' && text[i] === QUOTE_PAIRS[openQuote]) {
            parts.push(text.substring(openQuoteI + 1, i));
            openQuote = '';
        } else if (openQuote == '') {
            if (QUOTE_PAIRS.hasOwnProperty(text[i])) {
                openQuote = text[i];
                openQuoteI = i;
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
        })
    }
}

export type Poll = {
    content: string,
    options: Option[],
};

export type Option = {
    content: string,
    votes: User[],
};

export type User = string;

function renderUser(user: User): string {
    return `<@${user}>`;
}

export function pollContentToBlocks(poll: Poll): KnownBlock[] {
    // Formats an existing poll into the content of the `blocks` section for postMessage/update
    const renderedOptions = poll.options.map((option, i) => {
        const votes = 'votes' in option ? option.votes : [];  // waaaaaaahhhhh
        return `${numberToEmojiString(i + 1)} ${option.content} \`${votes.length}\`\n ${votes.map(renderUser).join(' ')}`
    });

    const actionButtons = poll.options.map((_, i) => {
        return {
            "type": "button",
            "text": {
                "type": "plain_text",
                "text": numberToEmojiString(i + 1),
                "emoji": true
            },
            "action_id": i.toString(),
        }
    })

    const header: KnownBlock[] = [
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": `*${poll.content}*`
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
