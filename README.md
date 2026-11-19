# NOVA Store

A lightweight fashion storefront for the Rwandan market, built with plain HTML, CSS and JavaScript (no build step).

**Status:** front-end complete. Checkout runs in **demo mode** (payment is simulated, orders are stored only in the browser). To take real orders you must connect a backend. See "Going live".

## Run it locally

Open `index.html` through any static server, for example:

```
npx serve .
```

or the VS Code "Live Server" extension.

## Project structure

```
index.html, shop.html, product.html, cart.html,
checkout.html, order-success.html, about.html
css/        style.css (design system + header/footer), per-page CSS, responsive.css
js/
  config.js        store settings (currency, delivery prices, WhatsApp, languages)
  products.js      product catalog
  app.js           shared helpers: cart, prices, toast, HTML escaping
  components.js    shared header + footer (edit navigation here only)
  i18n.js          translation engine
  lang/en.js       English text (source of truth)
  lang/rw.js       Kinyarwanda template (empty, needs translation)
  payment.js       payment layer (demo or your backend)
  home.js, shop.js, product.js, cart.js, checkout.js, order-success.js
scripts/download-images.js    localizes Unsplash images
```

## Common changes

| I want to...                         | Edit                                                   |
| ------------------------------------ | ------------------------------------------------------ |
| Change prices / add products         | `js/products.js` (prices are in RWF)                   |
| Change delivery prices or free limit | `js/config.js` -> `shipping`, `freeShippingThreshold`  |
| Show the WhatsApp order button       | `js/config.js` -> `whatsappNumber` (e.g. `"250788123456"`) |
| Change menu links                    | `js/components.js` -> `NAV`                            |
| Change any text                      | `js/lang/en.js`                                        |

## Add Kinyarwanda

1. Fill the values in `js/lang/rw.js` (empty values fall back to English).
2. Have a native speaker review them.
3. In `js/config.js` set `languages.enabled` to `["en", "rw"]`. A language switch appears in the header.

Products can be translated individually: `i18n: { rw: { name: "...", description: "..." } }`.

## Images

Images currently load from Unsplash. To host them yourself, run once (internet required, Node 18+):

```
node scripts/download-images.js --dry-run
node scripts/download-images.js
```

Then check the license at https://unsplash.com/license, or replace them with your own product photos before selling.

## Going live (real payments and orders)

Everything below is **not** included yet:

1. **Backend + database** for products, orders and customers (e.g. Supabase, or Node.js + a database).
2. **Payment backend** that starts the mobile-money request with a provider (Paypack, Pesapal, IremboPay or the MTN / Airtel APIs) and confirms the result through the provider's webhook. Keep API keys on the server only.
3. In `js/config.js` set `demoMode: false` and `api.createPayment` to your endpoint. The expected request and response are documented at the top of `js/payment.js`.
4. The server must recompute totals from its own prices; never trust amounts sent by the browser.
5. Admin panel to manage products and orders.
6. Hosting with HTTPS and a domain.
