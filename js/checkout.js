// Checkout page: Rwanda-ready form, delivery pricing, mobile-money payment flow
(function () {

    var cfg = NOVA_CONFIG;
    var form = document.getElementById("checkout-form");
    var areaSelect = document.getElementById("delivery-area");
    var payPhoneGroup = document.getElementById("pay-phone-group");
    var submitBtn = form.querySelector('button[type="submit"]');
    var busy = false;

    // ---------- Helpers ----------

    function val(id) {
        return document.getElementById(id).value.trim();
    }

    function checked(name) {
        return form.querySelector('input[name="' + name + '"]:checked').value;
    }

    // Accepts 078xxxxxxx, 78xxxxxxx, +25078xxxxxxx, with spaces/dashes. Returns +2507xxxxxxxx or null.
    function parsePhone(input) {
        var cleaned = String(input).replace(/[\s\-().]/g, "");
        var match = cleaned.match(/^(?:\+?250|0)?(7[2389]\d{7})$/);
        return match ? "+250" + match[1] : null;
    }

    function areaInfo() {
        var opt = areaSelect.selectedOptions[0];
        return opt && opt.dataset.zone ? { value: areaSelect.value, zone: opt.dataset.zone } : null;
    }

    // null while no area is chosen
    function shippingCost(method, subtotal) {
        var area = areaInfo();
        if (!area) return null;
        if (method === "standard" && subtotal >= cfg.freeShippingThreshold) return 0;
        return cfg.shipping[area.zone][method];
    }

    function shippingLabel(cost) {
        if (cost === null) return t("totals.choose");
        return cost === 0 ? t("totals.free") : formatPrice(cost);
    }

    // ---------- Build the form ----------

    function buildAreas() {
        var html = '<option value="">' + esc(t("f.area.choose")) + "</option>";

        ["kigali", "outside"].forEach(function (zone) {
            html += '<optgroup label="' + esc(t("group." + zone)) + '">';
            cfg.deliveryAreas.filter(function (a) { return a.zone === zone; }).forEach(function (a) {
                html += '<option value="' + a.value + '" data-zone="' + a.zone + '">' +
                    esc(t("area." + a.value)) + "</option>";
            });
            html += "</optgroup>";
        });

        areaSelect.innerHTML = html;
    }

    function renderSummary() {
        var lines = getCartLines();
        var itemsEl = document.getElementById("checkout-items");

        if (!lines.length) {
            itemsEl.innerHTML = '<p>' + esc(t("checkout.empty")) + ' <a href="shop.html">' +
                esc(t("cart.continue")) + "</a></p>";
            submitBtn.disabled = true;
        } else {
            itemsEl.innerHTML = lines.map(function (line) {
                var name = esc(productText(line.product, "name"));
                return '<div class="checkout-item">' +
                    '<img src="' + esc(line.product.image) + '" alt="' + name + '">' +
                    '<div class="checkout-item-info"><h3>' + name + "</h3><p>" +
                        esc(line.size) + " · " + esc(t("color." + line.color)) + " · ×" + line.quantity +
                    "</p></div>" +
                    '<div class="checkout-item-price">' + formatPrice(line.lineTotal) + "</div></div>";
            }).join("");
        }

        updateTotals();
    }

    function updateTotals() {
        var subtotal = cartSubtotal();

        ["standard", "express"].forEach(function (method) {
            document.getElementById("price-" + method).textContent =
                shippingLabel(shippingCost(method, subtotal));
        });

        var shipping = shippingCost(checked("delivery"), subtotal);

        document.getElementById("checkout-totals").innerHTML =
            '<div class="checkout-total-row"><span>' + esc(t("totals.subtotal")) + "</span><span>" +
                formatPrice(subtotal) + "</span></div>" +
            '<div class="checkout-total-row"><span>' + esc(t("totals.shipping")) + "</span><span>" +
                esc(shippingLabel(shipping)) + "</span></div>" +
            '<div class="checkout-grand-total"><span>' + esc(t("totals.total")) + "</span><span>" +
                formatPrice(subtotal + (shipping || 0)) + "</span></div>";
    }

    function updatePaymentFields() {
        payPhoneGroup.hidden = checked("payment") === "cod";
    }

    // ---------- Validation ----------

    function clearErrors() {
        form.querySelectorAll(".field-error").forEach(function (el) { el.textContent = ""; });
        form.querySelectorAll("[aria-invalid]").forEach(function (el) { el.removeAttribute("aria-invalid"); });
    }

    function validate() {
        clearErrors();
        var firstBad = null;

        function fail(fieldId, errorKey) {
            var field = document.getElementById(fieldId);
            document.getElementById("error-" + fieldId).textContent = t(errorKey);
            field.setAttribute("aria-invalid", "true");
            if (!firstBad) firstBad = field;
        }

        if (val("customer-name").length < 2) fail("customer-name", "err.name");
        if (!parsePhone(val("customer-phone"))) fail("customer-phone", "err.phone");

        var email = val("customer-email");
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail("customer-email", "err.email");

        if (!areaSelect.value) fail("delivery-area", "err.area");
        if (val("customer-address").length < 3) fail("customer-address", "err.address");

        if (checked("payment") !== "cod") {
            var payPhone = val("pay-phone");
            if (payPhone && !parsePhone(payPhone)) fail("pay-phone", "err.phone");
        }

        if (firstBad) { firstBad.focus(); return false; }
        return true;
    }

    // ---------- Order ----------

    function makeReference() {
        return "NOVA-" + Date.now().toString(36).toUpperCase().slice(-6) +
            Math.random().toString(36).toUpperCase().slice(2, 5);
    }

    function buildOrder() {
        var lines = getCartLines();
        var subtotal = lines.reduce(function (s, l) { return s + l.lineTotal; }, 0);
        var deliveryMethod = checked("delivery");
        var shipping = shippingCost(deliveryMethod, subtotal);
        var phone = parsePhone(val("customer-phone"));
        var payMethod = checked("payment");
        var payPhone = parsePhone(val("pay-phone")) || phone;

        return {
            reference: makeReference(),
            createdAt: new Date().toISOString(),
            demo: cfg.demoMode,
            customer: { name: val("customer-name"), phone: phone, email: val("customer-email") },
            delivery: {
                method: deliveryMethod,
                area: areaInfo().value,
                zone: areaInfo().zone,
                address: val("customer-address"),
                notes: val("customer-notes")
            },
            payment: {
                method: payMethod,
                phone: payMethod === "cod" ? null : payPhone,
                status: "unpaid",
                transactionId: null
            },
            items: lines.map(function (l) {
                return {
                    id: l.product.id,
                    name: l.product.name,
                    size: l.size,
                    color: l.color,
                    quantity: l.quantity,
                    unitPrice: l.unitPrice
                };
            }),
            subtotal: subtotal,
            shipping: shipping,
            total: subtotal + shipping,
            currency: cfg.currency
        };
    }

    function saveOrder(order) {
        try {
            var orders = JSON.parse(localStorage.getItem("novaOrders")) || [];
            orders.push(order);
            localStorage.setItem("novaOrders", JSON.stringify(orders));
            localStorage.setItem("novaLastOrder", JSON.stringify(order));
        } catch (e) { /* storage unavailable */ }
    }

    // ---------- Payment overlay ----------

    function showOverlay(order) {
        var mobileMoney = order.payment.method !== "cod";
        var overlay = document.createElement("div");
        overlay.className = "pay-overlay";
        overlay.id = "pay-overlay";
        overlay.setAttribute("role", "alertdialog");
        overlay.setAttribute("aria-live", "assertive");

        overlay.innerHTML =
            '<div class="pay-box">' +
                '<div class="pay-spinner"></div>' +
                "<h3>" + esc(t(mobileMoney ? "pay.wait.title" : "pay.process.title")) + "</h3>" +
                "<p>" + esc(mobileMoney
                    ? t("pay.wait.text", { phone: order.payment.phone })
                    : t("pay.process.text")) + "</p>" +
                (cfg.demoMode ? '<p class="pay-demo">' + esc(t("pay.demo")) + "</p>" : "") +
            "</div>";

        document.body.appendChild(overlay);
    }

    function hideOverlay() {
        var overlay = document.getElementById("pay-overlay");
        if (overlay) overlay.remove();
    }

    // ---------- Events ----------

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        if (busy) return;

        if (!getCartLines().length) { showToast(t("checkout.empty"), "error"); return; }
        if (!validate()) return;

        var order = buildOrder();
        busy = true;
        submitBtn.disabled = true;
        showOverlay(order);

        NovaPayment.pay(order).then(function (result) {
            order.payment.status = result.status;
            order.payment.transactionId = result.transactionId || null;
            saveOrder(order);
            saveCart([]);
            window.location.href = "order-success.html";
        }).catch(function (error) {
            console.error(error);
            hideOverlay();
            busy = false;
            submitBtn.disabled = false;
            showToast(t("pay.failed"), "error");
        });
    });

    // Clear a field's error as soon as the customer edits it
    form.addEventListener("input", function (event) {
        var err = document.getElementById("error-" + event.target.id);
        if (err) err.textContent = "";
        event.target.removeAttribute("aria-invalid");
    });
    form.addEventListener("change", function (event) {
        var err = document.getElementById("error-" + event.target.id);
        if (err) err.textContent = "";
        event.target.removeAttribute("aria-invalid");
    });

    form.querySelectorAll('input[name="delivery"]').forEach(function (el) {
        el.addEventListener("change", updateTotals);
    });
    areaSelect.addEventListener("change", updateTotals);

    form.querySelectorAll('input[name="payment"]').forEach(function (el) {
        el.addEventListener("change", updatePaymentFields);
    });

    // ---------- Start ----------

    buildAreas();
    renderSummary();
    updatePaymentFields();

})();
