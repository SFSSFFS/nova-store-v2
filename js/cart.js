// Cart page
(function () {

    var container = document.getElementById("cart-container");

    function whatsappLink(lines, subtotal) {
        var rows = lines.map(function (line) {
            return "• " + productText(line.product, "name") +
                " (" + line.size + ", " + t("color." + line.color) + ") x" + line.quantity +
                " — " + formatPrice(line.lineTotal);
        });

        var message = t("wa.intro") + "\n" + rows.join("\n") + "\n" +
            t("wa.total") + ": " + formatPrice(subtotal);

        return "https://wa.me/" + NOVA_CONFIG.whatsappNumber + "?text=" + encodeURIComponent(message);
    }

    function render() {
        var lines = getCartLines();

        if (!lines.length) {
            container.innerHTML =
                '<div class="empty-cart"><h2>' + esc(t("cart.empty.title")) + "</h2><p>" +
                esc(t("cart.empty.text")) + '</p><a href="shop.html" class="checkout-btn">' +
                esc(t("cart.continue")) + "</a></div>";
            return;
        }

        var subtotal = lines.reduce(function (sum, l) { return sum + l.lineTotal; }, 0);

        var items = lines.map(function (line) {
            var name = esc(productText(line.product, "name"));

            return '' +
                '<div class="cart-item">' +
                    '<a href="product.html?id=' + line.product.id + '">' +
                        '<img class="cart-item-image" src="' + esc(line.product.image) + '" alt="' + name + '">' +
                    "</a>" +
                    '<div class="cart-item-info">' +
                        "<h3>" + name + "</h3>" +
                        "<p>" + formatPrice(line.unitPrice) + "</p>" +
                        "<p>" + esc(t("cart.size")) + ": " + esc(line.size) + "</p>" +
                        "<p>" + esc(t("cart.color")) + ": " + esc(t("color." + line.color)) + "</p>" +
                        '<div class="cart-item-actions">' +
                            "<label>" + esc(t("cart.qty")) +
                                '<input class="cart-quantity" type="number" min="1" max="' + MAX_QTY + '" ' +
                                'value="' + line.quantity + '" data-index="' + line.index + '">' +
                            "</label>" +
                            '<button type="button" class="remove-item" data-index="' + line.index + '">' +
                                esc(t("cart.remove")) + "</button>" +
                        "</div>" +
                    "</div>" +
                    '<div class="cart-item-total">' + formatPrice(line.lineTotal) + "</div>" +
                "</div>";
        }).join("");

        var whatsapp = NOVA_CONFIG.whatsappNumber
            ? '<a class="whatsapp-btn" target="_blank" rel="noopener" href="' +
              esc(whatsappLink(lines, subtotal)) + '">' + esc(t("cart.whatsapp")) + "</a>"
            : "";

        container.innerHTML = items +
            '<div class="cart-summary">' +
                "<h3>" + esc(t("cart.summary")) + "</h3>" +
                '<div class="cart-total"><span>' + esc(t("cart.subtotal")) + "</span><strong>" +
                    formatPrice(subtotal) + "</strong></div>" +
                '<p class="cart-note">' + esc(t("cart.note")) + "</p>" +
                '<a href="checkout.html" class="checkout-btn">' + esc(t("cart.checkout")) + "</a>" +
                whatsapp +
            "</div>";
    }

    container.addEventListener("change", function (event) {
        if (!event.target.classList.contains("cart-quantity")) return;

        var cart = getCart();
        var index = Number(event.target.dataset.index);
        if (!cart[index]) return;

        cart[index].quantity = Math.min(MAX_QTY, Math.max(1, parseInt(event.target.value, 10) || 1));
        saveCart(cart);
        render();
    });

    container.addEventListener("click", function (event) {
        if (!event.target.classList.contains("remove-item")) return;

        var cart = getCart();
        cart.splice(Number(event.target.dataset.index), 1);
        saveCart(cart);
        render();
    });

    render();

})();
