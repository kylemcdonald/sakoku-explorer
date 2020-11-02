import { writable, derived } from 'svelte/store';

const fallback = 'en';

export const locale = writable('en');
import * as translations from './i18n.json'

function getSubKey(dict, items) {
  if (items.length == 0) {
    return dict;
  }
  if (!Array.isArray(items)) {
    items = items.split('.');
  }
  if (items[0] in dict) {
    return getSubKey(dict[items[0]], items.splice(1));
  }
}

export const _ = derived(
	locale,
	$locale => (word) => {
    const base = getSubKey(translations[$locale], word);
    if (base !== undefined) {
      return base;
    }
    return getSubKey(translations[fallback], word);
  }
);
