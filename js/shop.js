// Shop page: search, category filter and sorting
(function () {

    var grid = document.getElementById("shop-grid");
    var results = document.getElementById("shop-results");
    var search = document.getElementById("shop-search");
    var category = document.getElementById("shop-category");
    var sort = document.getElementById("shop-sort");

    // Allow links like shop.html?category=women
    var requested = new URLSearchParams(window.location.search).get("category");
    if (requested && category.querySelector('option[value="' + requested + '"]')) {
        category.value = requested;
    }

    function render() {
        var term = search.value.trim().toLowerCase();

        var list = products.filter(function (p) {
            var matchesCategory = category.value === "all" || p.category === category.value;
            var haystack = (productText(p, "name") + " " + productText(p, "description")).toLowerCase();
            return matchesCategory && (!term || haystack.indexOf(term) !== -1);
        });

        if (sort.value === "low") list.sort(function (a, b) { return a.price - b.price; });
        if (sort.value === "high") list.sort(function (a, b) { return b.price - a.price; });
        if (sort.value === "name") {
            list.sort(function (a, b) { return productText(a, "name").localeCompare(productText(b, "name")); });
        }

        results.textContent = list.length === 1
            ? t("shop.results.one")
            : t("shop.results", { count: list.length });

        if (!list.length) {
            grid.innerHTML =
                '<div class="no-products"><h2>' + esc(t("shop.none.title")) + "</h2><p>" +
                esc(t("shop.none.text")) + "</p></div>";
            return;
        }

        grid.innerHTML = list.map(productCardHTML).join("");
    }

    search.addEventListener("input", render);
    category.addEventListener("change", render);
    sort.addEventListener("change", render);

    render();

})();
