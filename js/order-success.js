// Order confirmation page: shows the order saved by checkout.js
(function () {

    var container = document.getElementById("success-container");
    var order = null;

    try { order = JSON.parse(localStorage.getItem("novaLastOrder")); } catch (e) {}

    if (!order || !order.reference) {
        container.innerHTML =
            '<h1>' + esc(t("ok.none.title")) + "</h1><p>" + esc(t("ok.none.text")) +
            '</p><a href="shop.html" class="checkout-btn">' + esc(t("ok.cta")) + "</a>";
        return;
    }

    var money = function (n) { return Math.round(n).toLocaleString("en-US") + " " + order.currency; };

    var paymentLabel = t("pay." + order.payment.method) + " — " +
        (order.payment.status === "paid" ? t("ok.paid") : t("ok.pending"));

    var rows = [
        [t("ok.area"), t("area." + order.delivery.area) + ", " + order.delivery.address],
        [t("ok.method"), t("del." + order.delivery.method)],
        [t("ok.payment"), paymentLabel],
        [t("ok.total"), money(order.total)]
    ];

    container.innerHTML =
        '<div class="success-mark">✓</div>' +
        "<h1>" + esc(t("ok.title")) + "</h1>" +
        "<p>" + esc(t("ok.text")) + "</p>" +
        '<p class="order-ref">' + esc(t("ok.ref")) + ": <strong>" + esc(order.reference) + "</strong></p>" +
        (order.demo ? '<p class="pay-demo">' + esc(t("ok.demo")) + "</p>" : "") +
        '<dl class="success-rows">' + rows.map(function (r) {
            return "<div><dt>" + esc(r[0]) + "</dt><dd>" + esc(r[1]) + "</dd></div>";
        }).join("") + "</dl>" +
        '<a href="shop.html" class="checkout-btn">' + esc(t("ok.cta")) + "</a>";

})();
