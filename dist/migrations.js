import {queryPublished} from "./sanity.js";

const query = `*[_type == "migration" && defined(slug.current) && defined(title) &&
  defined(date) && number > 0] | order(number desc, _id asc) {
  "id": slug.current, title, number, date, hash, "branch": coalesce(branch, "main"),
  "parents": array::compact(parents[]->slug.current),
  "stack": coalesce(stack, []), "notes": coalesce(notes, []),
  "summary": coalesce(summary, ""), "kind": coalesce(kind, ""), art, before, after
}`;

export async function readMigrations(signal) {
  const records = await queryPublished(query, {}, signal);
  const numbers = new Map(records.map(item => [item.id, item.number]));
  return records.map(item => ({
    ...item,
    hash: item.hash || "M" + String(item.number).padStart(3, "0"),
    // A draft parent can be missing from the published perspective. A diagram
    // can only connect an earlier, published endpoint in the same history.
    parents: [...new Set(item.parents || [])].filter(parent => numbers.get(parent) < item.number),
  }));
}
