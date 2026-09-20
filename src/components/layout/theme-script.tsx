/**
 * Applies the stored theme before first paint.
 *
 * Without this the page renders in the default theme and then corrects itself,
 * which is the flash every theme toggle is judged by. It must be inline and
 * synchronous in <head>; a deferred module would run too late.
 */
const SCRIPT = `(function(){try{var s=localStorage.getItem('theme');var d=s?s==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.dataset.theme=d?'dark':'light';}catch(e){document.documentElement.dataset.theme='light';}})();`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />;
}
