const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export function isValidEmail(email) {
  const value = String(email || "").trim();
  if (!value) return false;
  return EMAIL_REGEX.test(value);
}

export function normalizeEmail(email) {
  if (email == null) return "";
  return String(email).trim().toLowerCase();
}

export function getEmailDomain(email) {
  const value = normalizeEmail(email);
  const atIndex = value.lastIndexOf("@");
  if (atIndex === -1 || atIndex === value.length - 1) return "";
  return value.slice(atIndex + 1);
}

export function suggestEmailCorrection(email) {
  const value = normalizeEmail(email);
  const domain = getEmailDomain(value);
  if (!domain) return null;

  const typos = {
    "gmial.com": "gmail.com",
    "gmai.com": "gmail.com",
    "yahooo.com": "yahoo.com",
    "yaho.com": "yahoo.com",
    "hotmial.com": "hotmail.com",
    "outlok.com": "outlook.com",
  };

  const correction = typos[domain];
  if (!correction) return null;

  const atIndex = value.lastIndexOf("@");
  if (atIndex === -1) return null;

  const username = value.slice(0, atIndex);
  return `${username}@${correction}`;
}

export default {
  isValidEmail,
  normalizeEmail,
  getEmailDomain,
  suggestEmailCorrection,
};
