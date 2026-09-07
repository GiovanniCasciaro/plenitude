import { NextResponse } from "next/server";
import { getPublicAppUrl } from "@/lib/app-url";
import {
  PREVIEW_HEADLINE,
  PREVIEW_SUBLINE,
  PREVIEW_TILES,
} from "@/lib/preview-collage";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function tileCell(tile: (typeof PREVIEW_TILES)[number]) {
  return `<td width="50%" style="padding:6px;vertical-align:top;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${tile.accent};border-radius:12px;">
      <tr>
        <td style="padding:14px 16px;color:#ffffff;font-family:Arial,Helvetica,sans-serif;">
          <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;">${escapeHtml(tile.label)}</p>
          <p style="margin:0 0 4px;font-size:20px;font-weight:700;line-height:1.15;">${escapeHtml(tile.title)}</p>
          <p style="margin:0;font-size:13px;line-height:1.35;">${escapeHtml(tile.detail)}</p>
        </td>
      </tr>
    </table>
  </td>`;
}

export async function GET(request: Request) {
  const siteUrl = getPublicAppUrl(request);
  const imageUrl = `${siteUrl}/anteprima/immagine`;
  const previewUrl = `${siteUrl}/anteprima`;
  const [tileA, tileB, tileC, tileD] = PREVIEW_TILES;

  const html = `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Plenitude Dealer — Anteprima</title>
</head>
<body style="margin:0;padding:24px;background:#eef6f1;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">
          <tr>
            <td style="padding-bottom:16px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#5a6478;text-align:center;">
              Anteprima Plenitude Dealer · <a href="${siteUrl}" style="color:#009e62;">${escapeHtml(siteUrl.replace(/^https?:\/\//, ""))}</a>
            </td>
          </tr>
          <tr>
            <td>
              <a href="${siteUrl}" style="text-decoration:none;display:block;">
                <img src="${imageUrl}" width="600" alt="Plenitude Dealer — ${escapeHtml(PREVIEW_HEADLINE)}" style="display:block;width:100%;max-width:600px;height:auto;border:0;border-radius:16px;">
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding-top:18px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;border-radius:16px;overflow:hidden;">
                <tr>
                  <td style="height:8px;background:linear-gradient(90deg,#009e62 0%,#95b849 45%,#ffcd00 100%);"></td>
                </tr>
                <tr>
                  <td style="padding:24px 28px;font-family:Arial,Helvetica,sans-serif;">
                    <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#009e62;">Collabora con noi</p>
                    <h1 style="margin:0 0 10px;font-size:28px;line-height:1.2;color:#009e62;">${escapeHtml(PREVIEW_HEADLINE)}</h1>
                    <p style="margin:0 0 18px;font-size:16px;line-height:1.5;color:#5a6478;">${escapeHtml(PREVIEW_SUBLINE)}</p>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>${tileCell(tileA)}${tileCell(tileB)}</tr>
                      <tr>${tileCell(tileC)}${tileCell(tileD)}</tr>
                    </table>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:14px;background:#009e62;border-radius:12px;">
                      <tr>
                        <td style="padding:16px 18px;font-family:Arial,Helvetica,sans-serif;">
                          <a href="${siteUrl}" style="color:#ffffff;text-decoration:none;font-size:18px;font-weight:700;">Scopri Plenitude Dealer → plenitudeleader.it</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding-top:16px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#5a6478;text-align:center;">
              Pagina anteprima: <a href="${previewUrl}" style="color:#009e62;">${escapeHtml(previewUrl)}</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
