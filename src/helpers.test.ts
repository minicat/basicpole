import {parsePollText} from "./helpers";

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
