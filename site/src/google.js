module.exports = {
  name: "google",
};

function parseDatetime(datetime) {
  datetime = datetime.replace("JST", "UTC+9");
  return new Date(Date.parse(datetime)).toISOString();
}

function extractDomain(url) {
  const hostname = url.match("^(?:https?://)?(?<hostname>[^:/\n?%]+)", "i");
  const domain = hostname.groups.hostname.split(".").slice(-2).join(".");
  return domain;
}

// language-agnostic "my activity" loader
// ignores the "products" and "locations" section
function loadActivityHtml(data) {
  const parts = data.split("outer-cell");
  const titleRe = /title">(.+?)<br/s;
  const bodyRe = /body-1">(.+?)<\/div/s;
  const linkRe = /<a href="(?<url>.+?)">(?<text>.+?)<\/a>/gs;
  const datetimeRe = />([^<]+)$/;
  const pieces = parts.slice(1).map((e) => {
    const pieces = e.split("<div");
    const body = pieces[3].match(bodyRe)[1];
    return {
      body: body,
      title: pieces[2].match(titleRe)[1],
      links: [...body.matchAll(linkRe)].map((e) => e.groups),
      start: parseDatetime(body.match(datetimeRe)[1]),
    };
  });
  return pieces;
}

// need a more comprehensive solution that is still fast
function decodeHtmlEntities(input) {
  input = input
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
  return input;
}

const visitedUrlPrefixRe = /^.+url\?q=/;
const visitedUrlPostfixRe = /&amp;usg=.+$/;
function extractUrlFromVisited(url) {
  url = url.replace(visitedUrlPrefixRe, "");
  url = url.replace(visitedUrlPostfixRe, "");
  return url;
}

function loadSearchActivityHtml(raw, lang) {
  const searchFilter = {
    en: (e) => e.body.startsWith("Searched"),
    jp: (e) => e.body.includes("を検索しました"),
  }[lang];
  const visitedFilter = {
    en: (e) => e.body.startsWith("Visited"),
    jp: (e) => e.body.includes("にアクセスしました"),
  }[lang];

  let activity = loadActivityHtml(raw).filter((e) => e.links.length);

  return {
    searchActivity: activity.filter(searchFilter).map((e) => {
      const title = decodeHtmlEntities(e.links[0].text);
      return {
        title: title,
        search: title,
        url: e.links[0].url,
        start: e.start,
      };
    }),
    visitedActivity: activity.filter(visitedFilter).map((e) => {
      const url = extractUrlFromVisited(e.links[0].url);
      const domain = extractDomain(url);
      let title = decodeHtmlEntities(e.links[0].text);
      if (title == url) {
        title = domain;
      }
      return {
        title: title,
        url: url,
        site: domain,
        start: e.start,
      };
    }),
  };
}

function loadYouTubeActivityHtml(raw, lang) {
  const activity = loadActivityHtml(raw).filter((e) => e.links.length);

  const searchFilter = {
    en: (e) => e.body.startsWith("Searched"),
    jp: (e) => e.body.includes("を検索しました"),
  }[lang];
  const watchFilter = {
    en: (e) => e.body.startsWith("Watched"),
    jp: (e) => e.body.includes("を視聴しました"),
  }[lang];

  const videoIdRe = /v=(.+)/;

  return {
    youtubeSearchActivity: activity.filter(searchFilter).map((e) => {
      const title = decodeHtmlEntities(e.links[0].text);
      return {
        title: title,
        search: title,
        url: e.links[0].url,
        start: e.start,
      };
    }),
    youtubeWatchActivity: activity.filter(watchFilter).map((e) => {
      const url = e.links[0].url;
      const videoId = url.match(videoIdRe)[1];
      return {
        title: decodeHtmlEntities(e.links[0].text),
        url: url,
        video: videoId,
        start: e.start,
      };
    }),
  };
}

function loadImageSearchActivityHtml(raw, lang) {
  const activity = loadActivityHtml(raw).filter((e) => e.links.length);

  const searchFilter = {
    en: (e) => e.body.startsWith("Searched"),
    jp: (e) => e.body.includes("を検索しました"),
  }[lang];
  const viewFilter = {
    en: (e) => e.body.startsWith("Viewed"),
    jp: (e) => e.body.includes("画像を表示"),
  }[lang];

  return {
    imageSearchActivity: activity.filter(searchFilter).map((e) => {
      const title = decodeHtmlEntities(e.links[0].text);
      return {
        title: title,
        search: title,
        url: e.links[0].url,
        start: e.start,
      };
    }),
    imageViewActivity: activity.filter(viewFilter).map((e) => {
      return {
        title: decodeHtmlEntities(e.links[0].text),
        url: extractUrlFromVisited(e.links[0].url),
        start: e.start,
      };
    }),
  };
}

function loadAdsActivityHtml(raw, lang) {
  const activity = loadActivityHtml(raw).filter((e) => e.links.length);

  return {
    adsActivity: activity.map((e) => {
      const url = extractUrlFromVisited(e.links[0].url);
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

function loadMapsActivityHtml(raw, lang) {
  const activity = loadActivityHtml(raw); // do not filter no links

  return {
    mapsActivity: activity.map((e) => {
      // "Used maps" with no other info
      if (e.links.length == 0) {
        return {
          title: "Maps",
          start: e.start,
        };
      }
      return {
        title: decodeHtmlEntities(e.links[0].text),
        url: e.links[0].url,
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
    path: "/Search/MyActivity.html",
    name: "search",
    load: wrap(loadSearchActivityHtml, "en"),
  },
  {
    path: "/検索/マイアクティビティ.html",
    name: "search",
    load: wrap(loadSearchActivityHtml, "jp"),
  },
  {
    path: "/YouTube/MyActivity.html",
    name: "youtube",
    load: wrap(loadYouTubeActivityHtml, "en"),
  },
  {
    path: "/YouTube/マイアクティビティ.html",
    name: "youtube",
    load: wrap(loadYouTubeActivityHtml, "jp"),
  },
  {
    path: "/Image Search/MyActivity.html",
    name: "image-search",
    load: wrap(loadImageSearchActivityHtml, "en"),
  },
  {
    path: "/画像検索/マイアクティビティ.html",
    name: "image-search",
    load: wrap(loadImageSearchActivityHtml, "jp"),
  },
  {
    path: "/Ads/MyActivity.html",
    name: "ads",
    load: wrap(loadAdsActivityHtml, "en"),
  },
  {
    path: "/Ads/マイアクティビティ.html",
    name: "ads",
    load: wrap(loadAdsActivityHtml, "jp"),
  },
  {
    path: "/Maps/MyActivity.html",
    name: "maps",
    load: wrap(loadMapsActivityHtml, "en"),
  },
  {
    path: "/マップ/マイアクティビティ.html",
    name: "maps",
    load: wrap(loadMapsActivityHtml, "jp"),
  },
];
