import {parsePollText} from "./helpers";

test('parsePollText', () => {
    // basic case
    expect(parsePollText("'a' 'b' 'c'")).toEqual({content: 'a', options: [{content: 'b', votes: []}, {content: 'c', votes: []}]});
    // weird quotes
    expect(parsePollText("'a' \"b\" “c”")).toEqual({content: 'a', options: [{content: 'b', votes: []}, {content: 'c', votes: []}]});
    // more text, with spaces
    expect(parsePollText("“pusheens or fungi?”   “pusheens”   “fungi”")).toEqual({content: 'pusheens or fungi?', options: [{content: 'pusheens', votes: []}, {content: 'fungi', votes: []}]});
    // contains quotes within text
    expect(parsePollText("“'pusheens' or \"fungi\"?”   “pusheens”   “fungi”")).toEqual({content: "'pusheens' or \"fungi\"?", options: [{content: 'pusheens', votes: []}, {content: 'fungi', votes: []}]});
    // emoji support???
    expect(parsePollText("'🐱 or 🍄?' '🐱' '🍄'")).toEqual({content: '🐱 or 🍄?', options: [{content: '🐱', votes: []}, {content: '🍄', votes: []}]});

    // doesn't start with a bracket
    expect(parsePollText('invalid')).toEqual(undefined);
    // doesnt terminate last bracket
    expect(parsePollText('"invalid" "invalid')).toEqual(undefined);
    // has text in between options
    expect(parsePollText('"invalid" invalid "invalid"')).toEqual(undefined);
    // starts with the weird close bracket
    expect(parsePollText('"invalid" ”invalid”')).toEqual(undefined);
})
