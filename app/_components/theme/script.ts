import { SECTIONS } from "@/content/site";

const lightPrefixes = SECTIONS.filter((s) => s.defaultTheme === "light").map((s) => s.href);

/**
 * Render-blocking <head> script: resolves the theme before first paint.
 * Stored choice ("theme" in localStorage) wins; otherwise the page default.
 * Must stay in sync with ThemeProvider's STORAGE_KEY.
 */
export const THEME_SCRIPT = `(function(){var d=document.documentElement,t=null;try{t=localStorage.getItem("theme")}catch(e){}if(t!=="light"&&t!=="dark"){var p=location.pathname,l=${JSON.stringify(
  lightPrefixes,
)};t="dark";for(var i=0;i<l.length;i++){if(p===l[i]||p.indexOf(l[i]+"/")===0){t="light";break}}}d.dataset.theme=t})()`;
