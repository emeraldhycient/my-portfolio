import {examples} from "./sample-journal.js";

const endpoint = "https://uin9wku4.api.sanity.io/v2026-11-06/data/query/production";
const visible = '_type == "journalEntry" && defined(title) && defined(slug.current) && defined(publishedAt) && dateTime(publishedAt) <= dateTime(now())';
const metadata = '_id, title, summary, publishedAt, "slug": slug.current, "kind": coalesce(kind, "note")';
const pageSize = 20;
const listQuery = `{
  "hasPublished": defined(*[${visible}][0]._id),
  "entries": *[${visible} && ($kind == "all" || coalesce(kind,"note") == $kind)
    && ($date == null || publishedAt < $date || (publishedAt == $date && _id < $id))]
    | order(publishedAt desc, _id desc)[0...21]{${metadata}}
}`;
const entryQuery = `{
  "hasPublished": defined(*[${visible}][0]._id),
  "entry": *[${visible} && slug.current == $slug] | order(_updatedAt desc)[0]{${metadata}, body}
}`;

async function query(text, params, signal) {
  const url = new URL(endpoint);
  url.searchParams.set("query", text);
  url.searchParams.set("perspective", "published");
  url.searchParams.set("returnQuery", "false");
  for (const [key, value] of Object.entries(params)) url.searchParams.set("$" + key, JSON.stringify(value));
  const response = await fetch(url, {credentials:"omit", signal, cache:"no-store"});
  if (!response.ok) throw new Error("The journal could not load from Sanity.");
  const {result} = await response.json();
  return result;
}

export async function listJournal(kind, cursor, signal) {
  const data = await query(listQuery, {kind, date:cursor?.publishedAt ?? null, id:cursor?._id ?? ""}, signal);
  if (!data.hasPublished) {
    return {entries:examples.filter(entry => kind === "all" || entry.kind === kind), more:false, sample:true};
  }
  return {entries:data.entries.slice(0,pageSize), more:data.entries.length > pageSize, sample:false};
}

export async function getJournalEntry(slug, signal) {
  const data = await query(entryQuery, {slug}, signal);
  if (data.hasPublished) return data.entry;
  return examples.find(entry => entry.slug === slug) || null;
}
