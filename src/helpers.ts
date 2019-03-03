const EMOJI_NUMBERS = ["0️⃣", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"];

function numberToEmojiString(n: number) {
    let emojiString = '';
    for (let c of n.toString()) {
        emojiString += EMOJI_NUMBERS[parseInt(c, 10)];
    }
    return emojiString;
}

export type Poll = {
    content: string,
    options: Option[],
}

export type Option = {
    content: string,
    votes: User[],
}

export type User = string;

function renderUser(user: User): string {
    return "<@${user}>";
}

export function pollContentToBlocks(poll: Poll) {
    // Formats an existing poll into the content of the `blocks` section for postMessage/update
    const renderedOptions = poll.options.map((option, i) => {
        const votes = 'votes' in option ? option.votes : [];  // waaaaaaahhhhh
        return `${numberToEmojiString(i + 1)} ${option.content} \`${votes.length}\`\n ${votes.map(renderUser).join(' ')}`
    }).join('\n');

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

    return [
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": `*${poll.content}*\n${renderedOptions}`
            }
        },
        {
            "type": "actions",
            "elements": actionButtons
        }
    ]
}
