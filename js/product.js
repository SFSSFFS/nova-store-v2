// Product page
(function () {

    var SIZES = ["S", "M", "L", "XL"];
    var COLORS = ["Black", "Brown", "Gold", "Silver"];

    var container = document.getElementById("product-details");
    var params = new URLSearchParams(window.location.search);
    var product = getProduct(params.get("id"));

    function notFound() {
        document.title = t("product.notfound") + " | NOVA STORE";
        container.innerHTML =
            '<div class="no-products"><h2>' + esc(t("product.notfound")) + "</h2><p>" +
            esc(t("product.notfound.text")) + '</p><p><a class="about-link" href="shop.html">' +
            esc(t("product.back")) + "</a></p></div>";
    }

    if (!product) { notFound(); return; }

    var name = productText(product, "name");
    document.title = name + " | NOVA STORE";

    var crumb = document.getElementById("breadcrumb-name");
    if (crumb) crumb.textContent = name;

    var sizeOptions = SIZES.map(function (s) {
        return '<option value="' + s + '">' + esc(s + " — " + t("size." + s)) + "</option>";
    }).join("");

    var colorOptions = COLORS.map(function (c) {
        return '<option value="' + c + '">' + esc(t("color." + c)) + "</option>";
    }).join("");

    var qtyOptions = "";
    for (var q = 1; q <= MAX_QTY; q++) qtyOptions += '<option value="' + q + '">' + q + "</option>";

    container.innerHTML =
        '<div class="product-gallery">' +
            '<img class="product-main-image" src="' + esc(product.image) + '" alt="' + esc(name) + '">' +
        "</div>" +
        '<div class="product-info">' +
            '<p class="product-category">' + esc(t("cat." + product.category)) + "</p>" +
            "<h1>" + esc(name) + "</h1>" +
            '<p class="product-price">' + formatPrice(product.price) + "</p>" +
            '<p class="product-description">' + esc(productText(product, "description")) + "</p>" +

            '<div class="product-option"><label for="size">' + esc(t("opt.size")) + "</label>" +
                '<select id="size"><option value="">' + esc(t("opt.size.choose")) + "</option>" + sizeOptions + "</select></div>" +

            '<div class="product-option"><label for="color">' + esc(t("opt.color")) + "</label>" +
                '<select id="color"><option value="">' + esc(t("opt.color.choose")) + "</option>" + colorOptions + "</select></div>" +

            '<div class="product-option"><label for="quantity">' + esc(t("opt.qty")) + "</label>" +
                '<select id="quantity">' + qtyOptions + "</select></div>" +

            '<button type="button" class="add-to-cart-btn" id="add-to-cart">' + esc(t("btn.add")) + "</button>" +

            '<div class="product-extra">' +
                esc(t("product.extra1", { amount: formatPrice(NOVA_CONFIG.freeShippingThreshold) })) + "<br>" +
                esc(t("product.extra2")) +
            "</div>" +
        "</div>";

    document.getElementById("add-to-cart").addEventListener("click", function () {
        var size = document.getElementById("size").value;
        var color = document.getElementById("color").value;
        var quantity = parseInt(document.getElementById("quantity").value, 10);

        if (!size) { showToast(t("toast.size"), "error"); return; }
        if (!color) { showToast(t("toast.color"), "error"); return; }

        addToCart(product, size, color, quantity);
        showToast(t("toast.added"));
    });

})();
