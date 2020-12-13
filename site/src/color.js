import { getSubKey } from "./i18n";

const palette = [
  "#ce4973",
  "#d74a32",
  "#ac6651",
  "#d28a39",
  "#bca381",
  "#b1b23d",
  "#6d792e",
  "#5aba42",
  "#63b27d",
  "#537360",
  "#6db2be",
  "#6485bb",
  "#7b6ac9",
  "#924bdb",
  "#d04fbc",
  "#88607e",
  "#d198bf",
];

const colorScheme = {
  "facebook/comments": palette[0],
  "facebook/friends": palette[1],
  "facebook/notifications": palette[2],
  "facebook/off-facebook": palette[3],
  "facebook/posts": palette[4],
  "facebook/reactions": palette[5],
  "facebook/search": palette[6],
  "facebook/viewed": palette[7],
  "facebook/visited": palette[8],

  "google/ads": palette[9],
  "google/maps": palette[10],
  "google/image-search": {
    imageViewActivity: palette[11],
    imageSearchActivity: palette[12],
  },
  "google/search": {
    visitedActivity: palette[13],
    searchActivity: palette[14],
  },
  "google/youtube": {
    youtubeWatchActivity: palette[15],
    youtubeSearchActivity: palette[16],
  },
};

export function getColor(word) {
    return getSubKey(colorScheme, word);
}