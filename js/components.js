// =================================
// NOVA STORE — SHARED HEADER & FOOTER
// Rendered on every page into #site-header and #site-footer,
// so the navigation is edited in ONE place.
// =================================

(function () {

    var cfg = NOVA_CONFIG;
    var page = document.body.dataset.page;

    var NAV = [
        { href: "index.html", key: "nav.home", pages: ["home"] },
        { href: "shop.html",  key: "nav.shop", pages: ["shop", "product"] },
        { href: "about.html", key: "nav.about", pages: ["about"] }
    ];

    function navLinks() {
        return NAV.map(function (item) {
            var active = item.pages.indexOf(page) !== -1;
            return '<a href="' + item.href + '"' +
                (active ? ' class="active" aria-current="page"' : "") + ">" +
                esc(t(item.key)) + "</a>";
        }).join("");
    }

    function languageSwitch() {
        if (cfg.languages.enabled.length < 2) return "";

        var options = cfg.languages.enabled.map(function (code) {
            var selected = code === NovaI18n.lang ? " selected" : "";
            return '<option value="' + code + '"' + selected + ">" +
                esc(cfg.languages.names[code] || code.toUpperCase()) + "</option>";
        }).join("");

        return '<select class="lang-switch" aria-label="' + esc(t("lang.label")) + '">' + options + "</select>";
    }

    function renderHeader() {
        var host = document.getElementById("site-header");
        if (!host) return;

        host.innerHTML =
            '<a class="skip-link" href="#main">' + esc(t("nav.skip")) + "</a>" +
            '<div class="announcement-bar">' +
                esc(t("announcement", { amount: formatPrice(cfg.freeShippingThreshold) })) +
            "</div>" +
            '<header class="header">' +
                '<a href="index.html" class="logo">NOVA<span>.</span></a>' +
                '<nav class="nav" aria-label="Main">' + navLinks() + "</nav>" +
                '<div class="header-actions">' +
                    languageSwitch() +
                    '<a href="cart.html" class="cart-link">' + esc(t("nav.cart")) +
                    ' (<span data-cart-count>0</span>)</a>' +
                "</div>" +
            "</header>";

        var select = host.querySelector(".lang-switch");
        if (select) {
            select.addEventListener("change", function () { NovaI18n.setLang(select.value); });
        }
    }

    function renderFooter() {
        var host = document.getElementById("site-footer");
        if (!host) return;

        var whatsapp = cfg.whatsappNumber
            ? '<a href="https://wa.me/' + esc(cfg.whatsappNumber) + '" target="_blank" rel="noopener">' +
              esc(t("footer.whatsapp")) + "</a>"
            : "";

        host.innerHTML =
            '<footer class="footer">' +
                '<a href="index.html" class="logo">NOVA<span>.</span></a>' +
                "<p>" + esc(t("footer.tagline")) + "</p>" +
                '<nav class="footer-links" aria-label="Footer">' +
                    navLinks() + whatsapp +
                "</nav>" +
                '<p class="footer-payments">' + esc(t("footer.payments")) + "</p>" +
                '<p class="footer-rights">' + esc(t("footer.rights")) + "</p>" +
            "</footer>";
    }

    renderHeader();
    renderFooter();
    updateCartCount();

})();
