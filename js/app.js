// =================================
// NOVA STORE — SHARED HELPERS
// Escaping, prices, cart storage, toast notifications.
// =================================

var CART_KEY = "novaCart";
var MAX_QTY = 10;

// ---------- Safe HTML ----------

function esc(value) {
    return String(value).replace(/[&<>"']/g, function (c) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
}

// ---------- Prices ----------

function formatPrice(amount) {
    return Math.round(amount).toLocaleString("en-US") + " " + NOVA_CONFIG.currency;
}

// ---------- Products ----------

function getProduct(id) {
    return products.find(function (p) { return p.id === Number(id); });
}

// Returns the translated field if one exists, otherwise the English one
function productText(product, field) {
    var l = NovaI18n.lang;
    return (product.i18n && product.i18n[l] && product.i18n[l][field]) || product[field];
}

function productCardHTML(product) {
    var name = esc(productText(product, "name"));
    var url = "product.html?id=" + product.id;

    return '' +
        '<article class="product-card">' +
            '<a href="' + url + '">' +
                '<img src="' + esc(product.image) + '" alt="' + name + '" loading="lazy">' +
            '</a>' +
            '<div class="product-info">' +
                '<h3><a href="' + url + '">' + name + '</a></h3>' +
                '<p>' + esc(t("cat." + product.category)) + '</p>' +
                '<span>' + formatPrice(product.price) + '</span>' +
            '</div>' +
        '</article>';
}

// ---------- Cart ----------
// The cart stores only: product id, size, color, quantity.
// Names, prices and images are always read from products.js, so a stale
// or edited cart can never show a wrong price.

function getCart() {
    try {
        var raw = JSON.parse(localStorage.getItem(CART_KEY)) || [];
        return raw.filter(function (item) {
            return item && getProduct(item.id);
        }).map(function (item) {
            return {
                id: Number(item.id),
                size: String(item.size || ""),
                color: String(item.color || ""),
                quantity: Math.min(MAX_QTY, Math.max(1, parseInt(item.quantity, 10) || 1))
            };
        });
    } catch (e) {
        return [];
    }
}

function saveCart(cart) {
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) {}
    updateCartCount();
}

function getCartLines() {
    return getCart().map(function (item, index) {
        var product = getProduct(item.id);
        return {
            index: index,
            product: product,
            size: item.size,
            color: item.color,
            quantity: item.quantity,
            unitPrice: product.price,
            lineTotal: product.price * item.quantity
        };
    });
}

function cartSubtotal() {
    return getCartLines().reduce(function (sum, line) { return sum + line.lineTotal; }, 0);
}

function addToCart(product, size, color, quantity) {
    var cart = getCart();
    var existing = cart.find(function (item) {
        return item.id === product.id && item.size === size && item.color === color;
    });

    if (existing) {
        existing.quantity = Math.min(MAX_QTY, existing.quantity + quantity);
    } else {
        cart.push({ id: product.id, size: size, color: color, quantity: Math.min(MAX_QTY, quantity) });
    }

    saveCart(cart);
}

function updateCartCount() {
    var count = getCart().reduce(function (sum, item) { return sum + item.quantity; }, 0);
    document.querySelectorAll("[data-cart-count]").forEach(function (el) {
        el.textContent = count;
    });
}

// ---------- Toast ----------

function showToast(message, type) {
    var existing = document.querySelector(".nova-toast");
    if (existing) existing.remove();

    var toast = document.createElement("div");
    toast.className = "nova-toast" + (type === "error" ? " error" : "");
    toast.setAttribute("role", "status");

    var icon = document.createElement("div");
    icon.className = "nova-toast-icon";
    icon.textContent = type === "error" ? "!" : "✓";

    var text = document.createElement("div");
    text.className = "nova-toast-message";
    text.textContent = message;

    toast.appendChild(icon);
    toast.appendChild(text);
    document.body.appendChild(toast);

    setTimeout(function () { toast.classList.add("show"); }, 20);
    setTimeout(function () {
        toast.classList.remove("show");
        setTimeout(function () { toast.remove(); }, 400);
    }, 2600);
}

// ---------- Page start-up ----------

document.addEventListener("DOMContentLoaded", function () {
    NovaI18n.apply();
    updateCartCount();
});
