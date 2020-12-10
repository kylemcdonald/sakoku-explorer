module.exports = {
  name: "google",
};

function parseDatetime(datetime) {
  return new Date(Date.parse(datetime)).toISOString();
}

function extractDomain(url) {
  const hostname = url.match("^(?:https?://)?(?<hostname>[^:/\n?%]+)", "i");
  const domain = hostname.groups.hostname.split(".").slice(-2).join(".");
  return domain;
}

const datetimeRe = />([^<]+)$/;
function loadActivityJson(data) {
  const parts = JSON.parse(data);
  const pieces = parts.map((e) => {
    return {
      title: e.title,
      url: e.titleUrl,
      start: parseDatetime(e.time),
    };
  });
  return pieces;
}

function extractSearchFunc(lang) {
  return {
    en: (e) => e.slice(13), // remove "Searched for"
    jp: (e) => e.slice(2,-9) // remove "「 " and " 」を検索しました"
  }[lang];
}

// need a more comprehensive solution that is still fast
// function decodeHtmlEntities(input) {
//   input = input
//     .replace(/&quot;/g, '"')
//     .replace(/&#39;/g, "'")
//     .replace(/&amp;/g, "&");
//   return input;
// }

const visitedUrlPrefixRe = /^.+url\?q=/;
const visitedUrlPostfixRe = /&usg=.+$/;
function extractUrlFromVisited(url) {
  url = url.replace(visitedUrlPrefixRe, "");
  url = url.replace(visitedUrlPostfixRe, "");
  return url;
}

function loadSearchActivityJson(raw, lang) {
  const searchFilter = {
    en: (e) => e.title.startsWith("Searched"),
    jp: (e) => e.title.endsWith("を検索しました"),
  }[lang];
  const visitedFilter = {
    en: (e) => e.title.startsWith("Visited"),
    jp: (e) => e.title.endsWith("にアクセスしました"),
  }[lang];
  const extractSearch = extractSearchFunc(lang);

  let activity = loadActivityJson(raw); //.filter((e) => e.links.length);

  return {
    searchActivity: activity.filter(searchFilter).map((e) => {
      const search = extractSearch(e.title);
      return {
        title: e.title,
        search: search,
        url: e.url,
        start: e.start,
      };
    }),
    visitedActivity: activity.filter(visitedFilter).map((e) => {
      const url = extractUrlFromVisited(e.url);
      const domain = extractDomain(url);
      return {
        title: e.title,
        url: url,
        site: domain,
        start: e.start,
      };
    }),
  };
}

function loadYouTubeActivityJson(raw, lang) {
  const activity = loadActivityJson(raw).filter((e) => e.url);

  const searchFilter = {
    en: (e) => e.title.startsWith("Searched"),
    jp: (e) => e.title.endsWith("を検索しました"),
  }[lang];
  const watchFilter = {
    en: (e) => e.title.startsWith("Watched"),
    jp: (e) => e.title.endsWith("を視聴しました"),
  }[lang];
  const extractSearch = extractSearchFunc(lang);

  const videoIdRe = /v=(.+)/;

  return {
    youtubeSearchActivity: activity.filter(searchFilter).map((e) => {
      const search = extractSearch(e.title);
      return {
        title: e.title,
        search: search,
        url: e.url,
        start: e.start,
      };
    }),
    youtubeWatchActivity: activity.filter(watchFilter).map((e) => {
      const videoId = e.url.match(videoIdRe)[1];
      return {
        title: e.title,
        url: e.url,
        video: videoId,
        start: e.start,
      };
    }),
  };
}

function loadImageSearchActivityJson(raw, lang) {
  const activity = loadActivityJson(raw); //.filter((e) => e.links.length);

  const searchFilter = {
    en: (e) => e.title.startsWith("Searched"),
    jp: (e) => e.title.endsWith("を検索しました"),
  }[lang];
  const viewFilter = {
    en: (e) => e.title.startsWith("Viewed"),
    jp: (e) => e.title.endsWith("画像を表示"),
  }[lang];
  const extractSearch = extractSearchFunc(lang);

  return {
    imageSearchActivity: activity.filter(searchFilter).map((e) => {
      const search = extractSearch(e.title);
      return {
        title: e.title,
        search: search,
        url: e.url,
        start: e.start,
      };
    }),
    imageViewActivity: activity.filter(viewFilter).map((e) => {
      return {
        title: e.title,
        url: e.url,
        start: e.start,
      };
    }),
  };
}

function loadAdsActivityJson(raw, lang) {
  const activity = loadActivityJson(raw); //.filter((e) => e.links.length);

  return {
    adsActivity: activity.map((e) => {
      const url = extractUrlFromVisited(e.url);
      const domain = extractDomain(url);
      return {
        title: domain,
        site: domain,
        url: url,
        start: e.start,
      };
    }),
  };
}

function loadMapsActivityJson(raw, lang) {
  const activity = loadActivityJson(raw); // do not filter no links

  return {
    mapsActivity: activity.map((e) => {
      // "Used maps" with no other info
      // if (e.links.length == 0) {
      //   return {
      //     title: "Maps",
      //     start: e.start,
      //   };
      // }
      return {
        title: e.title,
        url: e.url,
        start: e.start,
      };
    }),
  };
}

function wrap(func, lang) {
  return (raw) => {
    return func(raw, lang);
  };
}

module.exports.handlers = [
  {
    path: "/Search/MyActivity.json",
    name: "search",
    load: wrap(loadSearchActivityJson, "en"),
  },
  {
    path: "/検索/マイアクティビティ.json",
    name: "search",
    load: wrap(loadSearchActivityJson, "jp"),
  },
  {
    path: "/YouTube/MyActivity.json",
    name: "youtube",
    load: wrap(loadYouTubeActivityJson, "en"),
  },
  {
    path: "/YouTube/マイアクティビティ.json",
    name: "youtube",
    load: wrap(loadYouTubeActivityJson, "jp"),
  },
  {
    path: "/Image Search/MyActivity.json",
    name: "image-search",
    load: wrap(loadImageSearchActivityJson, "en"),
  },
  {
    path: "/画像検索/マイアクティビティ.json",
    name: "image-search",
    load: wrap(loadImageSearchActivityJson, "jp"),
  },
  {
    path: "/Ads/MyActivity.json",
    name: "ads",
    load: wrap(loadAdsActivityJson, "en"),
  },
  {
    path: "/Ads/マイアクティビティ.json",
    name: "ads",
    load: wrap(loadAdsActivityJson, "jp"),
  },
  {
    path: "/Maps/MyActivity.json",
    name: "maps",
    load: wrap(loadMapsActivityJson, "en"),
  },
  {
    path: "/マップ/マイアクティビティ.json",
    name: "maps",
    load: wrap(loadMapsActivityJson, "jp"),
  },
];
