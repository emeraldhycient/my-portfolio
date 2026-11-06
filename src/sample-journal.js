// Preview content is local and optically labeled. Published CMS entries always
// take precedence; examples are never written to the production dataset.
const paragraph = text => ({_type:"block", style:"normal", markDefs:[], children:[{_type:"span", text, marks:[]}]});
function sample(slug, kind, publishedAt, title, summary, paragraphs) {
  return {_id: "example-" + slug, slug, kind, publishedAt, title, summary, body: paragraphs.map(paragraph), example:true};
}
export const examples = [
  sample("one-retry-per-receiver", "work", "2026-11-04T16:18:00Z", "Give each receiver its own retry",
    "A dropped webhook taught me to look at the unit of work before changing the retry policy.", [
      "Relay used to retry a whole batch when one endpoint timed out. During a test, two healthy receivers got a second copy of an event they had already handled. The timeout was real, but the retry was asking the wrong question.",
      "I moved the delivery state onto each receiver. One event can now be complete for one endpoint and waiting for another. The delivery log tells me which one needs attention.",
      "The test I keep coming back to is simple: bring one endpoint down, send an event, and bring it back. Each receiver should be able to explain exactly what happened.",
    ]),
  sample("a-review-from-the-keyboard", "experience", "2026-10-28T09:42:00Z", "Start the review at the keyboard",
    "An ordinary design review changed when we put the mouse aside and tried to finish the task.", [
      "The menu looked finished in the review. Then someone opened it with the keyboard, chose an action, and landed at the top of the page. We had inspected every visible state and missed where focus went next.",
      "We wrote the expected key sequence before touching the component. That gave engineering and design the same concrete thing to discuss, and it became the first example in the Formwork documentation.",
    ]),
  sample("a-curve-you-can-hear", "note", "2026-10-12T18:06:00Z", "A curve you can hear",
    "A notebook sketch became the waveform for a small browser instrument.", [
      "I drew a lopsided wave and wondered what it would sound like. Sampling it at equal intervals got me most of the way there. Updating the samples while a note was playing introduced an audible click.",
      "A short crossfade made edits feel continuous. I kept the drawing on screen while playing, so a change in the line has an immediate sound to go with it.",
    ]),
  sample("test-the-map-offline", "work", "2026-09-19T11:23:00Z", "Test the map at the trailhead",
    "Saving the route was easy. Knowing that every tile had finished saving was the useful part.", [
      "The first version of Wayfinder told me a route was saved as soon as its line geometry arrived. Opening it offline revealed the problem: the line was there, but the landmarks around it were missing.",
      "Now a route becomes available only when the bounded region and its notes have finished writing. I can put the phone in airplane mode before leaving and see the same map I expect on the walk.",
    ]),
];
