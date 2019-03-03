const EMOJI_NUMBERS = ["0️⃣", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"];

function numberToEmojiString(n: number) {
    let emojiString = '';
    for (let c of n.toString()) {
        emojiString += EMOJI_NUMBERS[parseInt(c, 10)];
    }
    return emojiString;
}


export function pollContentToBlocks(poll: any) {
    // Formats an existing poll into the content of the `blocks` section for postMessage/update
    const renderedOptions = poll.options.map((option: any, i: number) => {
    const votes = option.hasOwnProperty('votes') ? option.votes : [];  // waaaaaaahhhhh

        return `${numberToEmojiString(i + 1)} ${option.content} ${votes.length}\`\n ${votes.join(' ')}`
    }).join('\n');

    const actionButtons = poll.options.map((option: any, i: number) => {
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
