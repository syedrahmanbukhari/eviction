# Georgia Eviction Defense Masterclass landing page

A standalone, mobile-responsive landing page. It is separate from the document-generator website and uses a PayPal Hosted Button for checkout. No PHP, Node server, or database is required.

## PayPal checkout and Zoom redirect

The page loads the PayPal JavaScript SDK with the client ID supplied by the client and renders hosted button `RY59UWXKRTN34`. Visitors must scroll to the end of the legal disclaimer and check the acknowledgment box before the PayPal button appears.

The price is set on the hosted button in the client's PayPal account, not in this website. The client indicated it is **$1 for testing** and plans to change it to **$47** afterward. The page deliberately does not show a fixed price while those amounts differ. Check the amount shown by PayPal before making the site available for production purchases.

Set the final Zoom registration URL as the button's **Auto-return** URL in PayPal's Confirmation settings. Test a completed payment and confirm that PayPal displays the intended amount and returns the buyer to the correct Zoom page. This static website does not verify payments itself.

## Preview and deploy

Open `index.html` in a browser for a local preview. Upload the *contents of this folder* (`index.html`, `styles.css`, `app.js`, and `assets/`) to the chosen web root or a new subdomain's document root. Keep this project separate from the existing `newforms.online` document-generator deployment. No build command is needed; the ZIP supplied with this project contains ready-to-upload files. An internet connection is needed to load PayPal checkout.

The legal disclaimer and marketing copy were supplied by the client.
