// Home page: featured products are rendered from the catalog (js/products.js)
(function () {
    var grid = document.getElementById("featured-grid");
    if (!grid) return;

    grid.innerHTML = products.slice(0, 4).map(productCardHTML).join("");
})();
