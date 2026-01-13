# Shopkeeper Authentication System

## Overview

Complete authentication system for shopkeepers including registration, login, password reset, and basic session management. This lives alongside the customer wallet flow and is focused on shops using LoyVault for loyalty program management.

## Components

### `ShopkeeperAuth.jsx`

Main container component that handles routing between registration and login for shopkeepers.

**State:**
- `mode`: `'register' | 'login'`
- `isCheckingSession`: `boolean`

**Features:**
- Auto-detect if any shop exists in IndexedDB and default to the appropriate mode
- Checks for existing shopkeeper session on mount
- Redirects authenticated shops straight to `/shop/dashboard`
- Switches between register/login modes (and syncs `?mode=` URL param)

---

### `ShopRegistration.jsx`

Registration form for new shopkeepers.

**Fields:**
- **Shop Name** (required, 3–50 characters)
- **Email** (required, valid format, normalized to lowercase)
- **Password** (required, 8+ characters, strength validation)
- **Confirm Password** (required, must match password)
- **Phone** (optional, format validation)

**Process:**
1. Validate all fields (shop name, email, password, confirm password, optional phone).
2. Generate a Shop DID and keypair via `generateShopDID()`.
3. Hash the password and generate a salt via `hashPassword()`.
4. Store the new shop in IndexedDB via `saveShop()`.
5. Create a session and persist it via `loginShop()` / `AuthContext`.
6. Navigate to `/shop/dashboard`.

The component also shows a success screen with the new Shop DID and a quick action to continue to the dashboard.

---

### `ShopLogin.jsx`

Login form for existing shopkeepers.

**Login Methods:**
- **Email + Password**
- **Shop DID + Password**

**Features:**
- Failed attempt tracking (max 3 attempts before lockout)
- Account lockout for 5 minutes after repeated failures
- "Remember Me" option (stores DID/email for 7 days, without password)
- Password reset entry point
- Lockout countdown with clear feedback

**Flow:**
1. Validate required login fields based on selected method.
2. Lookup shop in IndexedDB via email or DID.
3. Verify password with `verifyPassword(password, passwordHash, salt)`.
4. On success:
   - Clear failed attempts and lockout flags
   - Optionally persist "remember me" data
   - Call `loginShop(shop)` and redirect to `/shop/dashboard`.
5. On failure:
   - Increment failed attempt counter
   - Show remaining attempts or lockout message

---

### `ShopPasswordReset.jsx`

3-step password reset flow implemented as a modal.

**Steps:**
1. **Enter Email** – validate email, confirm shop exists, generate 6-digit code, and store it (with expiry) in `localStorage`.
2. **Enter Verification Code** – verify code and expiry, allow resend.
3. **Set New Password** – validate strength, confirm match, and update password hash + salt for the shop in IndexedDB.

**Features:**
- Reset code expires after 10 minutes
- Resend code option with renewed expiry
- Password strength validation using `validatePassword()`
- Clears reset data from `localStorage` after successful reset

---

### `ShopDashboard.jsx`

Temporary placeholder dashboard to test the auth flow.

**Displays:**
- Welcome message using `shopName`
- Shop DID with copy-to-clipboard
- Basic stats placeholders (members, offers, points)
- "Coming soon" feature cards for issuing credentials, verifying customers, broadcasting offers, and viewing analytics
- Logout button using `logout()` from `AuthContext`

## Utilities

### `shopDIDGenerator.js`

- `generateShopDID()` – creates a unique shop DID: `did:loyvault:shop-{suffix}` plus simulated keypair.
- `generateKeyPair()` – returns pseudo-random `publicKey` and `privateKey` hex strings.

### `passwordUtils.js`

- `generateSalt()` – random salt generation.
- `hashPassword(password, salt?)` – hashes `salt:password` via SHA-256.
- `verifyPassword(inputPassword, storedHash, salt)` – verifies password without exposing plaintext.
- `validatePassword(password)` – enforces min length and character-class requirements.

### `shopIndexedDB.js`

IndexedDB abstraction for shop data:
- `saveShop(shopData)` – create/update shop records.
- `getShop(shopDID)` – fetch by DID.
- `getShopByEmail(email)` – fetch by email.
- `updateShop(shopDID, updates)` – partial updates.
- `deleteShop(shopDID)` – delete shop.
- `hasShop()` – quickly check if any shop exists.
- Credential-related helpers for issuing credentials (used later in the dashboard).

### `sessionManager.js`

Session & lockout helpers for shopkeepers:
- `checkShopSession()` – validate existing session based on timestamps and IndexedDB.
- `setShopSession(shopData)` – persist shop session metadata.
- `clearShopSession()` – clear session and lockout data.
- `refreshShopSession()` – extend session activity window.
- `trackShopFailedAttempts()` – increment and persist failed login attempts.
- `isShopAccountLocked()` – check lockout state and time remaining.
- `lockShopAccount(durationMinutes)` / `unlockShopAccount()` – manage lockouts.
- `saveRememberedShop()`, `getRememberedShop()`, `clearRememberedShop()` – remember-me utilities (DID/email only).

## Security Features

- Passwords are stored only as salted SHA-256 hashes (no plaintext).
- Account lockout after repeated failed login attempts.
- Session expiration window (30 minutes) with explicit refresh.
- Remember Me stores only shop DID and email with basic encoding, never passwords.
- IndexedDB access is scoped to the browser and user agent.

## Usage Example

```jsx
import ShopkeeperAuth from "./components/auth/ShopkeeperAuth";

function App() {
  return (
    <Routes>
      {/* ...other routes... */}
      <Route path="/shop/auth" element={<ShopkeeperAuth />} />
      <Route
        path="/shop/dashboard"
        element={
          <ProtectedRoute role="shopkeeper">
            <ShopDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
```

## Testing

See the detailed testing checklist defined in Prompt 26 for recommended manual test scenarios covering registration, login, password reset, sessions, edge cases, and UX.

## Future Enhancements

- Email verification for new shop registrations
- Two-factor authentication (TOTP / SMS / WebAuthn)
- OAuth-based login (Google, Microsoft, etc.)
- Backup codes for account recovery
- Multi-device session management and device trust
- Centralized analytics for auth events
