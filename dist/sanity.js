// Both pages use anonymous, published-only reads. Editor access stays in Studio.
const endpoint = "https://uin9wku4.api.sanity.io/v2026-11-06/data/query/production";

export async function queryPublished(query, params = {}, signal) {
  const url = new URL(endpoint);
  url.searchParams.set("query", query);
  url.searchParams.set("perspective", "published");
  url.searchParams.set("returnQuery", "false");
  for (const [name, value] of Object.entries(params)) url.searchParams.set("$" + name, JSON.stringify(value));
  const response = await fetch(url, {credentials: "omit", signal, cache: "no-store"});
  if (!response.ok) throw new Error("Published content could not load from Sanity.");
  return (await response.json()).result;
}
