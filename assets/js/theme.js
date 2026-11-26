// https://gohugo.io/functions/css/chromastyles/
const mq_dark = window.matchMedia('(prefers-color-scheme: dark)');
const root = document.documentElement;
const fieldset = document.getElementById('theme-switcher');

const applyTheme = (theme) => {
        theme = theme ?? 'system'; // null -> "system"

        root.classList.toggle('dark', theme === 'dark' || (theme === 'system' && mq_dark.matches));
        root.classList.toggle('light', theme === 'light' || (theme === 'system' && !mq_dark.matches));

        // force syncing widget
        fieldset.querySelector(`input[value="${theme}"]`).checked = true;
};


applyTheme();  // initial call with default ("system") setting

// Keep class in sync with system preference when no manual override is set.
mq_dark.addEventListener('change', () => {
        // no forced theme, or manually selected "system"
        if (!localStorage.getItem('theme') || localStorage.getItem('theme') == "system") {
                root.classList.toggle('dark', mq_dark.matches);
                root.classList.toggle('light', !mq_dark.matches);
        }
});

fieldset.addEventListener('change', (e) => {
        const next = e.target.value;
        localStorage.setItem('theme', e.target.value);
        applyTheme(next);
});
