// https://gohugo.io/functions/css/chromastyles/
const mq_dark = window.matchMedia('(prefers-color-scheme: dark)');
const root = document.documentElement;
const fieldset = document.getElementById('theme-switcher');

const applyTheme = (theme) => {
        theme = theme ?? 'system'; // null -> "system"

        const is_dark = theme === 'dark' || (theme === 'system' && mq_dark.matches);
        root.classList.toggle('dark', is_dark);
        root.classList.toggle('light', theme === 'light' || (theme === 'system' && !mq_dark.matches));

        // custom to trigger other changes
        window.dispatchEvent(new CustomEvent('themechange', { detail: { is_dark } }));
};

applyTheme();  // initial call with default ("system") setting

// Keep class in sync with system preference when no manual override is set.
mq_dark.addEventListener('change', () => {
        // no forced theme, or manually selected "system"
        if (!localStorage.getItem('theme') || localStorage.getItem('theme') == "system") {
                applyTheme(mq_dark.matches ? "dark" : "light")
        }
});

fieldset.addEventListener('change', (e) => {
        const next = e.target.value;
        localStorage.setItem('theme', e.target.value);
        applyTheme(next);
});


// https://github.com/giscus/giscus/issues/1200
let giscusReady = false;
const sendGiscusTheme = (is_dark) => {
        if (!giscusReady) return;
        const iframe = document.querySelector('iframe.giscus-frame');
        if (!iframe) return;
        iframe.contentWindow.postMessage(
                { giscus: { setConfig: { theme: is_dark ? 'noborder_dark' : 'noborder_light' } } },
                'https://giscus.app'
        );
};

// catch giscus message to detect giscus initialization
window.addEventListener('message', (e) => {
        if (e.origin !== 'https://giscus.app') return;
        giscusReady = true;

        // init with current theme
        const theme = localStorage.getItem('theme') ?? 'system';
        const is_dark = theme === 'dark' || (theme === 'system' && mq_dark.matches);
        sendGiscusTheme(is_dark);
});
// keep giscus in sync with global theme
window.addEventListener('themechange', (e) => sendGiscusTheme(e.detail.is_dark));
