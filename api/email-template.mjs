export const ZOOM_REGISTRATION_URL = "https://us06web.zoom.us/meeting/register/-ahKmxQOQC-QpBO4rZNVYg";

const FALLBACK_LOGO_URL = "https://raw.githubusercontent.com/syedrahmanbukhari/eviction/main/assets/tenant-resource-logo.png";

function logoUrl() {
  const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (productionHost && /^[a-z0-9.-]+$/i.test(productionHost)) {
    return `https://${productionHost}/assets/tenant-resource-logo.png`;
  }
  return FALLBACK_LOGO_URL;
}

export function zoomRegistrationEmail() {
  return {
    subject: "Your Zoom registration link | Georgia Eviction Defense Masterclass",
    htmlContent: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Your Zoom registration link</title>
  </head>
  <body style="margin:0;padding:0;background:#f4ebdc;color:#263b38;font-family:Arial,Helvetica,sans-serif;">
    <div style="display:none;font-size:1px;color:#f4ebdc;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">Your Georgia Eviction Defense Masterclass Zoom registration link is inside.</div>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f4ebdc;table-layout:fixed;">
      <tr><td align="center" style="padding:30px 14px 44px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px;table-layout:fixed;background:#fffdf7;border:1px solid #d6d0bf;border-radius:16px;overflow:hidden;">
          <tr><td align="center" style="background:#d7978b;padding:28px 20px 24px;">
            <img src="${logoUrl()}" alt="Tenant Resource Assistant logo" width="78" height="78" style="display:block;width:78px;height:78px;border:0;border-radius:50%;background:#fffdf7;object-fit:contain;">
            <p style="margin:15px 0 0;color:#263b38;font-size:15px;line-height:1.45;font-weight:800;letter-spacing:2px;text-transform:uppercase;">Tenant Resource Assistant</p>
          </td></tr>
          <tr><td style="padding:40px 36px 12px;">
            <p style="margin:0 0 14px;color:#b76f59;font-size:12px;line-height:1.4;font-weight:800;letter-spacing:2.5px;text-transform:uppercase;">Georgia Eviction Defense Masterclass</p>
            <h1 style="margin:0 0 18px;color:#263b38;font-size:32px;line-height:1.16;letter-spacing:-1px;">Your Zoom registration link is ready.</h1>
            <p style="margin:0;color:#3d4842;font-size:17px;line-height:1.7;">Thank you for your interest in the masterclass. Use the button below to open the Zoom registration page and enter your details.</p>
          </td></tr>
          <tr><td align="center" style="padding:30px 36px 26px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" bgcolor="#263b38" style="border-radius:8px;">
              <a href="${ZOOM_REGISTRATION_URL}" style="display:inline-block;padding:17px 29px;color:#fffdf7;font-size:17px;line-height:1.3;font-weight:700;text-decoration:none;">Register on Zoom&nbsp; &rarr;</a>
            </td></tr></table>
          </td></tr>
          <tr><td style="padding:0 36px 32px;">
            <p style="margin:0;color:#6c736b;font-size:13px;line-height:1.6;text-align:center;">Button not working? <a href="${ZOOM_REGISTRATION_URL}" style="color:#365550;text-decoration:underline;">Open the Zoom registration link</a>.</p>
          </td></tr>
          <tr><td style="padding:22px 36px;background:#e5eadc;border-top:1px solid #d6d0bf;">
            <p style="margin:0;color:#263b38;font-size:13px;line-height:1.65;">Zoom registration and PayPal checkout are separate steps. If you have not completed checkout, please return to the website to do so.</p>
          </td></tr>
        </table>
        <p style="max-width:600px;margin:20px 0 0;color:#6c736b;font-size:12px;line-height:1.6;text-align:center;">Tenant Resource Assistant &middot; Georgia Eviction Defense Masterclass</p>
      </td></tr>
    </table>
  </body>
</html>`,
  };
}
