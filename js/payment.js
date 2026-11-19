// =================================
// NOVA STORE — PAYMENT LAYER
//
// checkout.js calls NovaPayment.pay(order) and waits for the result.
//
// DEMO MODE  (NOVA_CONFIG.demoMode = true)
//   Simulates a mobile-money request. No money moves, nothing leaves the browser.
//
// LIVE MODE  (NOVA_CONFIG.demoMode = false)
//   Sends the order to YOUR backend (NOVA_CONFIG.api.createPayment). The backend must:
//     1. recompute the total from its own product prices (never trust the browser),
//     2. start the payment with your provider (e.g. Paypack, Pesapal, IremboPay, MTN/Airtel API),
//     3. confirm the final status through the provider's webhook.
//   API keys must live on the backend only, never in this file.
//
// Expected backend response: { "status": "paid" | "pending", "transactionId": "..." }
// =================================

(function () {

    function wait(ms) {
        return new Promise(function (resolve) { setTimeout(resolve, ms); });
    }

    function demoTransactionId() {
        return "DEMO-" + Date.now().toString(36).toUpperCase();
    }

    function pay(order) {

        // Cash on delivery: nothing to charge online
        if (order.payment.method === "cod") {
            return wait(800).then(function () {
                return { status: "pending", transactionId: null };
            });
        }

        if (NOVA_CONFIG.demoMode) {
            return wait(3500).then(function () {
                return { status: "paid", transactionId: demoTransactionId() };
            });
        }

        var endpoint = NOVA_CONFIG.api.createPayment;
        if (!endpoint) {
            return Promise.reject(new Error("Payment backend not configured (NOVA_CONFIG.api.createPayment)."));
        }

        return fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(order)
        }).then(function (response) {
            if (!response.ok) throw new Error("Payment request failed (" + response.status + ")");
            return response.json();
        }).then(function (result) {
            if (result.status !== "paid" && result.status !== "pending") {
                throw new Error("Unexpected payment status: " + result.status);
            }
            return result;
        });
    }

    window.NovaPayment = { pay: pay };

})();
