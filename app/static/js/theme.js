// Theme Toggle Functionality
(function () {
    const THEME_KEY = 'dominoml-theme';
    const DARK_THEME = 'dark';
    const LIGHT_THEME = 'light';

    // Get saved theme or default to dark
    function getSavedTheme() {
        return localStorage.getItem(THEME_KEY) || DARK_THEME;
    }

    // Apply theme to document
    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(THEME_KEY, theme);
        updateThemeIcon(theme);
    }

    // Update theme toggle button icon
    function updateThemeIcon(theme) {
        const themeIcons = document.querySelectorAll('.theme-icon');
        themeIcons.forEach(icon => {
            const iconName = theme === DARK_THEME ? 'sun' : 'moon';
            icon.setAttribute('data-lucide', iconName);
        });

        // Reinitialize lucide icons
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    // Toggle theme
    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === DARK_THEME ? LIGHT_THEME : DARK_THEME;
        applyTheme(newTheme);
    }

    // Initialize theme on page load
    function initTheme() {
        const savedTheme = getSavedTheme();
        applyTheme(savedTheme);

        // Add event listeners to all theme toggle buttons
        const themeToggles = document.querySelectorAll('#theme-toggle');
        themeToggles.forEach(toggle => {
            toggle.addEventListener('click', toggleTheme);
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTheme);
    } else {
        initTheme();
    }

    // Expose theme functions globally
    window.dominomlTheme = {
        toggle: toggleTheme,
        set: applyTheme,
        get: getSavedTheme
    };
})();
