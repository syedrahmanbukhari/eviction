# Georgia Eviction Defense Masterclass landing page

A standalone, mobile-responsive landing page. It is a separate project from the document-generator website and does not require PHP, PayPal, Node, or a database.

## Add the Zoom registration link

Open `config.js` and place the client's final paid Zoom landing-page URL in `registrationUrl`, for example:

```js
window.MASTERCLASS_CONFIG = {
  registrationUrl: "https://your-final-zoom-registration-page.example"
};
```

Use the real `https://` address supplied by the client. While the link is blank, **Register Now** stays disabled. With a valid link, visitors must scroll through the full disclaimer and check the acknowledgment box before the button is enabled. The button takes them to the configured page in the same tab.

## Preview and deploy

Open `index.html` in a browser for a local preview. Upload the *contents of this folder* (`index.html`, `styles.css`, `app.js`, `config.js`, and `assets/`) to the chosen web root or a new subdomain's document root. Keep this project separate from the existing `newforms.online` document-generator deployment. No build command is needed; the ZIP supplied with this project contains ready-to-upload files.

The legal disclaimer and marketing copy were supplied by the client. Review the text and final Zoom destination with the client before publishing.
