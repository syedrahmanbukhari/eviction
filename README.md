# Georgia Eviction Defense Masterclass landing page

A standalone, mobile-responsive landing page. It is separate from the document-generator website and uses a PayPal Hosted Button for checkout. The test-email step uses a Vercel Function in `api/send-test-email.mjs`; no database is required.

## PayPal checkout and Zoom redirect

The page loads the PayPal JavaScript SDK with the client ID supplied by the client and renders hosted button `RY59UWXKRTN34`. Visitors must scroll to the end of the legal disclaimer, check the acknowledgment box, enter an email address, and select Register Now before the PayPal button appears. That click attempts to send a test email through Resend. If email delivery fails, the error is shown and PayPal checkout remains available so the existing payment flow is not blocked.

## Test email setup

Add `RESEND_API_KEY` and `RESEND_FROM_EMAIL` to the Vercel project's environment variables, then redeploy. For a domain-free test, set `RESEND_FROM_EMAIL=onboarding@resend.dev` and enter the same recipient email used to sign up for Resend. Resend's test sender does not send to arbitrary recipients. Once a sending domain is verified in Resend, set `RESEND_FROM_EMAIL` to an address on that domain. Do not put the API key in source code or GitHub.

The test message says “Here is your Zoom link” but contains no Zoom URL and does not imply payment was completed. It is sent when Register Now is selected, before PayPal checkout. This is only for testing; a production confirmation email must be triggered after a verified completed payment. The endpoint validates addresses, does not store them, and returns a generic delivery error without exposing the Resend key.

The price is set on the hosted button in the client's PayPal account, not in this website. The client indicated it is **$1 for testing** and plans to change it to **$47** afterward. The page deliberately does not show a fixed price while those amounts differ. Check the amount shown by PayPal before making the site available for production purchases.

Set the final Zoom registration URL as the button's **Auto-return** URL in PayPal's Confirmation settings. Test a completed payment and confirm that PayPal displays the intended amount and returns the buyer to the correct Zoom page. This static website does not verify payments itself.

## Preview and deploy

Open `index.html` in a browser for a visual preview. The test-email endpoint only works when deployed to Vercel or served by a compatible local function runtime; opening the file directly cannot send email. Deploy the contents of this folder, including `api/`, to the Vercel project connected to the GitHub repository. No build command is needed. The ZIP contains the same files for backup, but uploading it to a static-only host will not run the email function. An internet connection is needed to load PayPal checkout.

The legal disclaimer and marketing copy were supplied by the client.
