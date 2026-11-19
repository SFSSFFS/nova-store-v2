// =================================
// NOVA STORE — TRANSLATION SYSTEM
// Usage in JS:   t("cart.title")   t("announcement", { amount: "200,000 RWF" })
// Usage in HTML: data-i18n="key"  data-i18n-html="key"  data-i18n-placeholder="key"
// Missing translations fall back to English automatically.
// =================================

(function () {

    var cfg = window.NOVA_CONFIG;
    var dict = window.NOVA_I18N || {};
    var lang = cfg.languages.default;

    try {
        var saved = localStorage.getItem("novaLang");
        if (saved && cfg.languages.enabled.indexOf(saved) !== -1) lang = saved;
    } catch (e) { /* storage unavailable: keep default */ }

    document.documentElement.lang = lang;

    function t(key, vars) {
        var text = (dict[lang] && dict[lang][key]) || (dict.en && dict.en[key]) || key;

        if (vars) {
            Object.keys(vars).forEach(function (name) {
                text = text.split("{" + name + "}").join(vars[name]);
            });
        }
        return text;
    }

    function apply(root) {
        root = root || document;

        root.querySelectorAll("[data-i18n]").forEach(function (el) {
            el.textContent = t(el.getAttribute("data-i18n"));
        });

        // Trusted dictionary strings only (they may contain <br> or <em>)
        root.querySelectorAll("[data-i18n-html]").forEach(function (el) {
            el.innerHTML = t(el.getAttribute("data-i18n-html"));
        });

        root.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
            el.setAttribute("placeholder", t(el.getAttribute("data-i18n-placeholder")));
        });

        var body = document.body;
        if (body.dataset.page && !body.hasAttribute("data-dynamic-title")) {
            document.title = t("title." + body.dataset.page);
        }
    }

    function setLang(newLang) {
        if (cfg.languages.enabled.indexOf(newLang) === -1) return;
        try { localStorage.setItem("novaLang", newLang); } catch (e) {}
        window.location.reload();
    }

    window.t = t;
    window.NovaI18n = {
        get lang() { return lang; },
        enabled: cfg.languages.enabled,
        t: t,
        apply: apply,
        setLang: setLang
    };

})();
