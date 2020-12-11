import { writable, derived } from "svelte/store";

const fallback = "en";

export const locale = writable("en");
import * as translations from "./i18n.json";

// convert markdown links to <a> tags
function linkify(text) {
  if (Array.isArray(text)) {
    return text.map(linkify);
  }
  return text.replace(
    /\[([^\]]*?)\]\(([^\)]*?)\)/,
    '<a target="_blank" href="$2">$1</a>'
  );
}

function getSubKey(dict, items) {
  if (items.length == 0) {
    // perfect match
    return dict;
  }
  if (typeof dict == "string") {
    // quit early
    return dict;
  }
  if (!Array.isArray(items)) {
    items = items.split(".");
  }
  if (items[0] in dict) {
    return getSubKey(dict[items[0]], items.splice(1));
  }
}

export const _ = derived(locale, ($locale) => (word) => {
  const base = getSubKey(translations[$locale], word);
  if (base !== undefined) {
    return linkify(base);
  }
  const alternative = getSubKey(translations[fallback], word);
  if (alternative === undefined) {
    console.error('No i18n for "' + word + '"');
    return word;
  }
  console.warn('Using fallback i18n for "' + word + '"');
  return linkify(alternative);
});
