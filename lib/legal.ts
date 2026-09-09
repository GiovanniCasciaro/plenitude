export type LegalEntity = {
  name: string;
  brand: string;
  email: string;
  siteUrl: string;
  address: string;
  vat?: string;
};

export function getLegalEntity(): LegalEntity {
  return {
    name:
      process.env.LEGAL_ENTITY_NAME?.trim() ||
      "Futuro Green SRL",
    brand: "Plenitude Dealer",
    email:
      process.env.LEGAL_PRIVACY_EMAIL?.trim() ||
      process.env.NOTIFIER_EMAIL?.trim() ||
      "privacy@plenitudeleader.it",
    siteUrl:
      process.env.APP_URL?.trim().replace(/\/$/, "") ||
      "https://plenitudeleader.it",
    address:
      process.env.LEGAL_ENTITY_ADDRESS?.trim() ||
      "Italia",
    vat: process.env.LEGAL_ENTITY_VAT?.trim() || undefined,
  };
}

export const COOKIE_CONSENT_KEY = "plenitude_leader_cookie_consent";
export const COOKIE_CONSENT_VERSION = "1";

export type CookiePreferences = {
  necessary: true;
  preferences: boolean;
  analytics: boolean;
  version: string;
  updatedAt: string;
};
