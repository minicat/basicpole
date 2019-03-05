import {parsePollText, splitOptionContent} from "./helpers";

test('parsePollText', () => {
    // basic case
    expect(parsePollText("'a' 'b' 'c'")).toEqual({content: 'a', options: [{content: 'b', votes: []}, {content: 'c', votes: []}], flags: []});
    // weird quotes
    expect(parsePollText("'a' \"b\" “c”")).toEqual({content: 'a', options: [{content: 'b', votes: []}, {content: 'c', votes: []}], flags: []});
    // more text, with spaces
    expect(parsePollText("“pusheens or fungi?”   “pusheens”   “fungi”")).toEqual({content: 'pusheens or fungi?', options: [{content: 'pusheens', votes: []}, {content: 'fungi', votes: []}], flags: []});
    // contains quotes within text
    expect(parsePollText("“'pusheens' or \"fungi\"?”   “pusheens”   “fungi”")).toEqual({content: "'pusheens' or \"fungi\"?", options: [{content: 'pusheens', votes: []}, {content: 'fungi', votes: []}], flags: []});
    // emoji support???
    expect(parsePollText("'🐱 or 🍄?' '🐱' '🍄'")).toEqual({content: '🐱 or 🍄?', options: [{content: '🐱', votes: []}, {content: '🍄', votes: []}], flags: []});

    // flags
    expect(parsePollText("--a 'wtf' --b-or-c 'wtf2'")).toEqual({content: 'wtf', options: [{content: 'wtf2', votes: []}], flags: ['--a', '--b-or-c']});

    expect(parsePollText("--a 'wtf --b-or-c wtf2' 'wtf3'")).toEqual({content: 'wtf --b-or-c wtf2', options: [{content: 'wtf3', votes: []}], flags: ['--a']});

    // doesn't start with a bracket
    expect(parsePollText('invalid')).toEqual(undefined);
    // doesnt terminate last bracket
    expect(parsePollText('"invalid" "invalid')).toEqual(undefined);
    // has text in between options
    expect(parsePollText('"invalid" invalid "invalid"')).toEqual(undefined);
    // starts with the weird close bracket
    expect(parsePollText('"invalid" ”invalid”')).toEqual(undefined);
})

test('splitOptionContent', () => {
    // no emojis in sight
    expect(splitOptionContent("cats are gr8", 99)).toEqual({emoji: "1️⃣0️⃣0️⃣", content: "cats are gr8"});
    // emojis not at start - dont use em
    expect(splitOptionContent("cats are gr8 :pusheen:", 99)).toEqual({emoji: "1️⃣0️⃣0️⃣", content: "cats are gr8 :pusheen:"});

    // emoji at start
    expect(splitOptionContent(":pusheen: cats are gr8", 99)).toEqual({emoji: ":pusheen:", content: "cats are gr8"});
    // rly short emoji at start
    expect(splitOptionContent(":f: dogs r worst", 99)).toEqual({emoji: ":f:", content: "dogs r worst"});

    // not an emoji at start
    expect(splitOptionContent(":) hello", 122)).toEqual({emoji: "1️⃣2️⃣3️⃣", content: ":) hello"});
    expect(splitOptionContent(":: hello", 122)).toEqual({emoji: "1️⃣2️⃣3️⃣", content: ":: hello"});
    expect(splitOptionContent("::: hello", 122)).toEqual({emoji: "1️⃣2️⃣3️⃣", content: "::: hello"});

    // only an emoji
    expect(splitOptionContent(":pusheen:", 99)).toEqual({emoji: ":pusheen:", content: ""});

    // fake emoji. don't be tricked!!!
    expect(splitOptionContent(":pusheen:pusheen:", 99)).toEqual({emoji: "1️⃣0️⃣0️⃣", content: ":pusheen:pusheen:"});
})
