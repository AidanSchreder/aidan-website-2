// Aidan's own devices, marked from /stats (signing in there marks the device
// too): nothing they do is counted, and GA and Clarity don't load on them.
// A plain cookie rather than HttpOnly, so the page can check it before
// loading anything; set by the server, so Safari keeps it past a week.

export const UNCOUNTED = "uncounted";
/** The longest browsers keep a cookie; signing in to /stats renews it. */
export const UNCOUNTED_MAX_AGE = 60 * 60 * 24 * 400;

const MARK = new RegExp(`(?:^|;\\s*)${UNCOUNTED}=1(?:;|$)`);

/** Whether a Cookie header carries the mark. */
export const uncountedIn = (cookie: string | null | undefined) => MARK.test(cookie ?? "");

/** In the browser: whether this device is marked. */
export const isUncounted = () => typeof document !== "undefined" && uncountedIn(document.cookie);
