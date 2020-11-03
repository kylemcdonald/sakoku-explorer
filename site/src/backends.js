import * as google from "./google.js";
import * as facebook from "./facebook.js";

const backends = [google, facebook];

const fileCache = {};

function findPath(file, handlers) {
  const valid = handlers.filter((e) => file.path.endsWith(e.path));
  if (valid.length > 0) {
    return valid[0];
  }
}

export function loadFromFiles(files) {
  let newEvents = {};
  files.forEach((file) => {
    backends.forEach(async (backend) => {
      const handler = findPath(file, backend.handlers);
      if (handler === undefined) {
        // not handled by this backend
        return;
      }
      const key = backend.name + "/" + handler.name;
      if (key in fileCache) {
        // already loaded previously
        return;
      }
      console.log("loading " + file.path + " with " + key);
      const raw = await file.text();
      const events = handler.load(raw);
      fileCache[key] = events;
      Object.assign(newEvents, events);
    });
  });
  return newEvents;
}
