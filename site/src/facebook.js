module.exports = {
  name: "facebook",
};

// let appInfo = { };
// async function getAppInfo(appId) {
//     if (!(appId in appInfo)) {
//         let response = await fetch('https://graph.facebook.com/' + appId);
//         appInfo[appId] = await response.json();
//     }
//     return appInfo[appId];
// }

function fixFacebookEncoding(data) {
  // return iconv.decode(iconv.encode(data, 'latin1'), 'utf-8');
  return data;
}

function loadOffFacebookActivity(raw) {
  let events = [];
  const data = JSON.parse(raw);
  // console.log(data['off_facebook_activity'][0]);
  // const fbids = new Set();
  // let groups = {};
  data["off_facebook_activity"].forEach((e) => {
    let name = fixFacebookEncoding(e["name"]);
    e["events"].forEach((e) => {
      let title = name;
      const type = e.type;
      if (type != "CUSTOM") {
        title += " " + type;
      }
      const timestamp = new Date(e.timestamp * 1000);
      events.push({
        title: title,
        start: timestamp.toISOString(),
        site: name,
      });
      // if (!(type in groups)) {
      //     groups[type] = new Set();
      // }
      // groups[type].add(name);
      // fbids.add(e.id)
    });
  });
  // console.log(groups);
  return {
    offFacebookActivity: events,
  };
}

function loadSearchHistory(raw) {
  let events = [];
  const data = JSON.parse(raw);
  return {
    searchHistory: data.searches.map((e) => {
      const timestamp = new Date(e.timestamp * 1000);
      // e.attachments[0].data[0] always exists
      // e.data[0] does not always exist
      return {
        title: fixFacebookEncoding(e.attachments[0].data[0].text),
        start: timestamp.toISOString(),
      };
    }),
  };
}

function flatten(data) {
  if (Array.isArray(data)) {
    return data.flatMap(flatten);
  } else if ("timestamp" in data) {
    return data;
  } else {
    const values = Object.values(data).filter(Array.isArray);
    return flatten(values);
  }
}

function loadTimestamped(raw) {
  const data = flatten(JSON.parse(raw));
  return data.map((e) => {
    const timestamp = new Date(e.timestamp * 1000);
    return {
      title: fixFacebookEncoding(e.data.name),
      url: e.data.uri,
      start: timestamp.toISOString(),
    };
  });
}

function loadViewed(raw) {
  return {
    viewed: loadTimestamped(raw),
  };
}

function loadVisited(raw) {
  return {
    visited: loadTimestamped(raw),
  };
}

function loadNotifications(raw) {
  const data = flatten(JSON.parse(raw));
  return {
    notifications: data.map((e) => {
      const timestamp = new Date(e.timestamp * 1000);
      return {
        title: fixFacebookEncoding(e.text),
        url: e.href,
        start: timestamp.toISOString(),
      };
    }),
  };
}

function loadComments(raw) {
  const data = flatten(JSON.parse(raw));
  return {
    comments: data.map((e) => {
      const timestamp = new Date(e.timestamp * 1000);
      return {
        title: fixFacebookEncoding(e.title),
        start: timestamp.toISOString(),
      };
    }),
  };
}

function loadPosts(raw) {
  const data = flatten(JSON.parse(raw));
  return {
    posts: data.map((e) => {
      const timestamp = new Date(e.timestamp * 1000);
      let title = "Post";
      if ("title" in e) {
        title = fixFacebookEncoding(e.title);
      }
      return {
        title: title,
        start: timestamp.toISOString(),
      };
    }),
  };
}

function loadLikesAndReactions(raw) {
  const data = flatten(JSON.parse(raw));
  return {
    likesAndReactions: data.map((e) => {
      const timestamp = new Date(e.timestamp * 1000);
      return {
        title: fixFacebookEncoding(e.title),
        start: timestamp.toISOString(),
      };
    }),
  };
}

function loadFriends(raw) {
  const data = flatten(JSON.parse(raw));
  return {
    friends: data.map((e) => {
      const timestamp = new Date(e.timestamp * 1000);
      return {
        title: fixFacebookEncoding(e.name),
        start: timestamp.toISOString(),
      };
    }),
  };
}

module.exports.handlers = [
  {
    path: "/ads_and_businesses/your_off-facebook_activity.json",
    name: "off-facebook",
    load: loadOffFacebookActivity,
  },
  {
    path: "/search_history/your_search_history.json",
    name: "search",
    load: loadSearchHistory,
  },
  {
    path: "/about_you/viewed.json",
    name: "viewed",
    load: loadViewed,
  },
  {
    path: "/about_you/visited.json",
    name: "visited",
    load: loadVisited,
  },
  {
    path: "/about_you/notifications.json",
    name: "notifications",
    load: loadNotifications,
  },
  {
    path: "/comments/comments.json",
    name: "comments",
    load: loadComments,
  },
  {
    path: "/posts/your_posts_1.json",
    name: "posts",
    load: loadPosts,
  },
  {
    path: "/likes_and_reactions/posts_and_comments.json",
    name: "reactions",
    load: loadLikesAndReactions,
  },
  {
    path: "friends/friends.json",
    name: "friends",
    load: loadFriends,
  },
];