// =================================
// NOVA STORE — STORE SETTINGS
// Everything a buyer/owner is likely to change lives here.
// =================================

window.NOVA_CONFIG = {

    storeName: "NOVA STORE",

    // Prices in products.js are stored in this currency (RWF has no decimals)
    currency: "RWF",

    // true  = checkout SIMULATES payment (no money moves, nothing is sent anywhere)
    // false = checkout calls your payment backend (see js/payment.js + README.md)
    demoMode: true,

    // Standard delivery becomes free at or above this subtotal
    freeShippingThreshold: 200000,

    // Delivery prices (RWF) per zone. Edit to match your courier.
    shipping: {
        kigali:  { standard: 2000, express: 5000 },
        outside: { standard: 5000, express: 9000 }
    },

    // Areas shown in the checkout (labels come from js/lang/*.js -> "area.<value>")
    deliveryAreas: [
        { value: "gasabo",     zone: "kigali"  },
        { value: "kicukiro",   zone: "kigali"  },
        { value: "nyarugenge", zone: "kigali"  },
        { value: "northern",   zone: "outside" },
        { value: "southern",   zone: "outside" },
        { value: "eastern",    zone: "outside" },
        { value: "western",    zone: "outside" }
    ],

    // International format without "+" or spaces, e.g. "250788123456".
    // Leave empty to hide the "Order via WhatsApp" button and footer link.
    whatsappNumber: "",

    // Add "rw" to enabled ONLY after js/lang/rw.js has been translated and reviewed.
    languages: {
        enabled: ["en"],
        default: "en",
        names: { en: "EN", rw: "RW" }
    },

    // Used when demoMode is false. Your backend endpoint that starts a mobile-money payment.
    api: {
        createPayment: ""
    }
};
