# Security Audit & Authentication System Documentation

## Executive Summary

This document provides a comprehensive security audit of the AudioFX Pro authentication system, identifies vulnerabilities, and documents how the authentication system works including tokens, sessions, and refresh mechanisms.

**Last Audit Date:** 2024
**Audit Status:** ⚠️ **IMPORTANT SECURITY ISSUES FOUND - ACTION REQUIRED**

---

## 1. Authentication System Overview

### 1.1 Technology Stack
- **Authentication Framework:** NextAuth.js v4+
- **Session Strategy:** JWT (JSON Web Tokens)
- **Database:** PostgreSQL with Prisma ORM
- **Password Hashing:** bcryptjs (10 rounds)
- **OAuth Provider:** Google OAuth 2.0

### 1.2 Authentication Methods
1. **Email/Password (Credentials)**
   - Users sign up with email and password
   - Password is hashed using bcryptjs (10 salt rounds)
   - Stored securely in database

2. **Google OAuth 2.0**
   - Users can sign in with Google account
   - Email is automatically verified
   - Account linking support for existing users

---

## 2. How Authentication Works (Technical Flow)

### 2.1 JWT Token System

NextAuth uses **JWT tokens** (not database sessions) for authentication. Here's how it works:

#### **Token Generation Flow:**
```
1. User signs in → NextAuth creates JWT token
2. Token is signed with NEXTAUTH_SECRET
3. Token contains:
   - user.id
   - user.email
   - user.name
   - subscription status (cached)
4. Token is stored in HTTP-only cookie (next-auth.session-token)
5. Token is also available in session object for client-side
```

#### **Token Structure (JWT Payload):**
```json
{
  "id": "user_id_from_database",
  "email": "user@example.com",
  "name": "User Name",
  "subscription": "free|pro|premium",
  "subscriptionStatus": "active|inactive|trialing",
  "iat": 1234567890,  // Issued at timestamp
  "exp": 1234571490   // Expiration timestamp (30 days default)
}
```

#### **Token Storage:**
- **Server-side:** Stored in HTTP-only cookie (prevents XSS attacks)
- **Cookie Name:** `next-auth.session-token` (production) or `__Secure-next-auth.session-token` (HTTPS)
- **Cookie Attributes:**
  - `HttpOnly: true` (prevents JavaScript access)
  - `Secure: true` (HTTPS only in production)
  - `SameSite: lax` (CSRF protection)
  - `Path: /`

### 2.2 Session Management

#### **Session Lifecycle:**
```
1. Sign In → JWT token created → Cookie set → Session active
2. Every request → NextAuth validates JWT from cookie
3. JWT valid → Request proceeds
4. JWT expired/invalid → User redirected to sign-in page
5. Sign Out → Cookie deleted → Session destroyed
```

#### **Session Refresh:**
- **Current Implementation:** No automatic refresh
- **Token Expiry:** 30 days (default NextAuth)
- **Issue:** Token expires after 30 days, user must re-authenticate

#### **Session Validation:**
Every protected API route calls:
```typescript
const session = await getServerSession(authOptions);
if (!session?.user?.id) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

### 2.3 Password Reset Token System

#### **Reset Token Generation:**
```
1. User requests password reset
2. System generates 32-byte random token (crypto.randomBytes)
3. Token is hashed and stored in VerificationToken table
4. Token expiry: 5 minutes from generation
5. Reset link sent to user's email: /auth/reset-password?token=xxx
```

#### **Reset Token Validation:**
```
1. User clicks reset link
2. System validates token:
   - Checks if token exists in database
   - Checks if token is not expired (< 5 minutes)
3. If valid → Allow password reset
4. If invalid/expired → Show error, user must request new token
5. Token is deleted after successful password reset (single-use)
```

#### **Security Features:**
- ✅ Tokens expire in 5 minutes
- ✅ Tokens are single-use (deleted after reset)
- ✅ Email enumeration prevention (same response for existing/non-existing emails)
- ✅ Secure random token generation

---

## 3. Security Audit Results

### 3.1 ✅ Secure Components

#### **API Route Protection:**
All protected API routes properly check authentication:
- ✅ `/api/subscription/checkout` - Checks session before checkout
- ✅ `/api/subscription/status` - Checks session before status check
- ✅ `/api/subscription/cancel` - Checks session before cancellation
- ✅ `/api/usage/check` - Checks session before usage check
- ✅ `/api/usage/record` - Checks session before recording usage

**Implementation:**
```typescript
const session = await getServerSession(authOptions);
if (!session?.user?.id) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

#### **Password Security:**
- ✅ Passwords hashed with bcryptjs (10 salt rounds)
- ✅ Password validation (minimum 6 characters)
- ✅ Password reset tokens expire in 5 minutes
- ✅ Password reset tokens are single-use

#### **Webhook Security:**
- ✅ Razorpay webhooks verify HMAC signatures
- ✅ Stripe webhooks verify webhook signatures
- ✅ Webhook secrets stored in environment variables

#### **OAuth Security:**
- ✅ Google OAuth properly configured
- ✅ Account linking prevents duplicate accounts
- ✅ Email verification automatic for OAuth users

### 3.2 ⚠️ CRITICAL VULNERABILITIES FOUND

#### **Issue #1: No Route-Level Protection (CRITICAL)**
**Severity:** 🔴 **HIGH**

**Problem:**
- No `middleware.ts` file to protect routes
- Client-side only authentication checks can be bypassed
- Users can directly access URLs without authentication

**Example:**
- User can directly visit `/pricing` or other pages without being authenticated
- Only client-side checks prevent access (can be bypassed with browser DevTools)

**Impact:**
- Unauthenticated users can potentially access subscription pages
- Direct URL navigation bypasses client-side checks
- Subscription features might be accessible without proper authentication

**Recommendation:**
- ✅ **IMPLEMENT MIDDLEWARE** to protect routes server-side
- Add authentication checks in middleware for protected routes

#### **Issue #2: Client-Side Only Auth Checks (HIGH)**
**Severity:** 🟠 **MEDIUM-HIGH**

**Problem:**
- `AdvancedAudioEditor.tsx` only checks session client-side
- Download functionality checks session in React component
- Can be bypassed by disabling JavaScript or manipulating client code

**Example:**
```typescript
if (!session) {
  // Client-side check - can be bypassed
  const shouldSignIn = confirm('You need to sign in...');
  return;
}
```

**Impact:**
- Users might bypass download restrictions
- API calls are still protected, but UI allows invalid states

**Recommendation:**
- Server-side validation already exists in API routes (✅ good)
- Add server-side page protection via middleware

#### **Issue #3: No JWT Token Expiry Configuration (MEDIUM)**
**Severity:** 🟡 **MEDIUM**

**Problem:**
- No explicit `maxAge` configuration for JWT tokens
- Default 30-day expiry might be too long for sensitive operations
- No token refresh mechanism

**Current Configuration:**
```typescript
session: {
  strategy: 'jwt',
  // Missing: maxAge configuration
}
```

**Impact:**
- Tokens remain valid for 30 days
- If token is compromised, attacker has 30 days access
- No automatic token refresh

**Recommendation:**
- Configure explicit token expiry (e.g., 7 days)
- Consider implementing token refresh mechanism
- Add session timeout for sensitive operations

#### **Issue #4: No Rate Limiting (MEDIUM)**
**Severity:** 🟡 **MEDIUM**

**Problem:**
- No rate limiting on authentication endpoints
- Password reset can be spammed
- Sign-up can be spammed
- Brute force attacks possible

**Endpoints Without Rate Limiting:**
- `/api/auth/signup` - No rate limit
- `/api/auth/forgot-password` - No rate limit
- `/api/auth/signin` - No rate limit (handled by NextAuth, but no additional protection)

**Impact:**
- Brute force attacks possible
- Email spam from password reset
- Account creation spam

**Recommendation:**
- Implement rate limiting middleware
- Use libraries like `@upstash/ratelimit` or similar
- Limit: 5 attempts per 15 minutes for auth endpoints

#### **Issue #5: Missing CSRF Protection Verification (LOW)**
**Severity:** 🟢 **LOW**

**Problem:**
- NextAuth provides CSRF protection by default
- But no explicit verification in custom API routes

**Current Status:**
- ✅ NextAuth handles CSRF for auth routes
- ⚠️ Custom API routes rely on session validation only

**Recommendation:**
- Add explicit CSRF token validation for sensitive operations
- Use NextAuth's built-in CSRF protection

#### **Issue #6: No Account Lockout (MEDIUM)**
**Severity:** 🟡 **MEDIUM**

**Problem:**
- No account lockout after failed login attempts
- Brute force attacks can continue indefinitely

**Recommendation:**
- Implement account lockout after 5 failed attempts
- Lock account for 15 minutes
- Or use CAPTCHA after 3 failed attempts

### 3.3 ⚠️ Potential Security Issues

#### **Issue #7: Email Enumeration in Sign-Up (LOW)**
**Severity:** 🟢 **LOW**

**Current:**
```typescript
if (existingUser) {
  return NextResponse.json({ error: 'User already exists' }, { status: 400 });
}
```

**Issue:**
- Returns "User already exists" error
- Allows attackers to enumerate valid email addresses

**Recommendation:**
- Return generic success message regardless
- Send email to existing account with "sign-in" link
- Prevents email enumeration

#### **Issue #8: Subscription Status Caching (LOW)**
**Severity:** 🟢 **LOW**

**Problem:**
- Subscription status is cached in JWT token
- Token might have stale subscription data
- User might have upgraded/canceled but token still has old status

**Current:**
```typescript
token.subscription = subscription?.plan || 'free';
token.subscriptionStatus = subscription?.status || 'inactive';
```

**Impact:**
- Token needs to be refreshed to get latest subscription status
- Temporary inconsistency possible (up to 30 days)

**Recommendation:**
- Always verify subscription status from database in critical operations
- Consider shorter token expiry for subscription-sensitive operations

---

## 4. Token & Session Flow Diagrams

### 4.1 Sign-In Flow
```
┌─────────┐
│  User   │
└────┬────┘
     │ 1. Enter credentials
     ▼
┌─────────────────┐
│  /api/auth/     │
│  [...nextauth]  │
└────┬────────────┘
     │ 2. Validate credentials
     ▼
┌─────────────────┐
│  Prisma Query   │
│  Find User      │
└────┬────────────┘
     │ 3. Check password (bcrypt)
     ▼
┌─────────────────┐
│  JWT Callback   │
│  Generate Token │
└────┬────────────┘
     │ 4. Create JWT with user data
     ▼
┌─────────────────┐
│  Set Cookie     │
│  HTTP-only      │
└────┬────────────┘
     │ 5. Redirect to home
     ▼
┌─────────┐
│  Home   │
└─────────┘
```

### 4.2 Protected API Request Flow
```
┌─────────┐
│  Client │
└────┬────┘
     │ 1. API Request with Cookie
     ▼
┌─────────────────┐
│  API Route      │
│  (Protected)    │
└────┬────────────┘
     │ 2. getServerSession()
     ▼
┌─────────────────┐
│  NextAuth       │
│  Validate JWT   │
│  from Cookie    │
└────┬────────────┘
     │ 3. JWT Valid?
     ├─── YES ────► 4. Extract user data
     │                └─► Process request
     │
     └─── NO ─────► 5. Return 401 Unauthorized
```

### 4.3 Google OAuth Flow
```
┌─────────┐
│  User   │
└────┬────┘
     │ 1. Click "Continue with Google"
     ▼
┌─────────────────┐
│  NextAuth       │
│  Redirect to    │
│  Google OAuth   │
└────┬────────────┘
     │ 2. User authorizes
     ▼
┌─────────────────┐
│  Google         │
│  Callback       │
└────┬────────────┘
     │ 3. Return user info (email, name, image)
     ▼
┌─────────────────┐
│  signIn Callback│
│  Create/Link    │
│  User Account   │
└────┬────────────┘
     │ 4. Create user in database
     │    Send welcome email
     ▼
┌─────────────────┐
│  JWT Callback   │
│  Generate Token │
└────┬────────────┘
     │ 5. Set cookie, redirect
     ▼
┌─────────┐
│  Home   │
└─────────┘
```

---

## 5. Token Lifecycle & Expiration

### 5.1 JWT Token Expiration

**Current Configuration:**
- **Strategy:** JWT (stored in cookie, not database)
- **Default Expiry:** 30 days (NextAuth default)
- **Refresh:** No automatic refresh
- **Storage:** HTTP-only cookie

**Token Expiry Timeline:**
```
Day 0:  Token created (sign in)
Day 1-29: Token valid, user can access protected routes
Day 30:  Token expires
Day 30+: User must sign in again to get new token
```

### 5.2 Password Reset Token Expiration

**Configuration:**
- **Expiry:** 5 minutes
- **Single-use:** Yes (deleted after use)
- **Storage:** Database (VerificationToken table)

**Reset Token Timeline:**
```
T+0s:    Token generated, stored in database
T+1s:    Email sent to user
T+5min:  Token expires (deleted from database)
T+5min+: User must request new reset token
```

---

## 6. Security Recommendations

### 6.1 Immediate Actions Required (CRITICAL)

1. **✅ Implement Middleware Protection**
   - Create `middleware.ts` in root
   - Protect all subscription-related routes
   - Redirect unauthenticated users to sign-in

2. **✅ Add Rate Limiting**
   - Implement rate limiting on auth endpoints
   - Limit: 5 attempts per 15 minutes per IP

3. **✅ Configure JWT Expiry**
   - Set explicit `maxAge` in auth config
   - Recommended: 7 days for better security
   - Consider refresh token mechanism

### 6.2 High Priority Actions

4. **Add Account Lockout**
   - Lock account after 5 failed login attempts
   - Unlock after 15 minutes or email verification

5. **Enhance Client-Side Protection**
   - Add server-side page protection
   - Remove reliance on client-side only checks

### 6.3 Medium Priority Actions

6. **Implement Token Refresh**
   - Add refresh token mechanism
   - Auto-refresh tokens before expiry

7. **Add Request Logging**
   - Log all authentication attempts
   - Monitor for suspicious activity

---

## 7. Authentication Endpoints

### 7.1 Public Endpoints (No Auth Required)
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User sign in (handled by NextAuth)
- `POST /api/auth/forgot-password` - Request password reset
- `GET /api/auth/reset-password?token=xxx` - Validate reset token
- `POST /api/auth/reset-password` - Reset password with token
- `POST /api/subscription/webhook` - Payment webhook (signature verified)

### 7.2 Protected Endpoints (Auth Required)
All require valid session via `getServerSession(authOptions)`:

- `POST /api/subscription/checkout` - Create subscription
- `GET /api/subscription/status` - Get subscription status
- `POST /api/subscription/cancel` - Cancel subscription
- `POST /api/usage/check` - Check usage limits
- `POST /api/usage/record` - Record usage

---

## 8. Bypass Prevention

### 8.1 How Authentication is Verified

**Server-Side Verification (✅ Secure):**
```typescript
// Every protected API route:
const session = await getServerSession(authOptions);
if (!session?.user?.id) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

**How it Works:**
1. `getServerSession()` reads JWT from HTTP-only cookie
2. Validates JWT signature using `NEXTAUTH_SECRET`
3. Checks token expiry
4. Returns user session or null

**Bypass Prevention:**
- ✅ Cannot bypass without valid JWT token
- ✅ Cannot forge JWT without `NEXTAUTH_SECRET`
- ✅ HTTP-only cookie prevents XSS token theft
- ✅ SameSite cookie prevents CSRF attacks

### 8.2 What Cannot Be Bypassed

1. **API Route Protection** ✅
   - All protected API routes check `getServerSession()`
   - Cannot access without valid JWT token
   - Cannot forge JWT without secret key

2. **Password Reset** ✅
   - Token is validated server-side
   - Token expiry enforced (5 minutes)
   - Single-use token (deleted after use)

3. **Database Queries** ✅
   - All queries use `session.user.id` from validated session
   - Cannot access other users' data

### 8.3 What CAN Be Bypassed (Issues Found)

1. **Page Access** ⚠️
   - No middleware protection
   - Direct URL access possible
   - Client-side checks can be disabled

2. **UI Elements** ⚠️
   - Download button checks are client-side
   - Can be bypassed (but API still blocks)

---

## 9. Environment Variables Security

### Required Environment Variables:
```env
# Authentication
NEXTAUTH_SECRET=        # 🔴 CRITICAL: Must be strong random string
NEXTAUTH_URL=           # Your application URL

# Database
DATABASE_URL=           # PostgreSQL connection string

# OAuth
GOOGLE_CLIENT_ID=       # Google OAuth client ID
GOOGLE_CLIENT_SECRET=   # Google OAuth client secret

# Email (SMTP)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=

# Payment Gateways
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=  # 🔴 CRITICAL for webhook verification
STRIPE_SECRET_KEY=        # Optional (if using Stripe)
STRIPE_WEBHOOK_SECRET=    # Optional (if using Stripe)
```

### Security Checklist:
- ✅ Never commit `.env` files to git
- ✅ Use strong `NEXTAUTH_SECRET` (32+ characters, random)
- ✅ Rotate secrets periodically
- ✅ Use different secrets for dev/production
- ✅ Restrict database access by IP when possible

---

## 10. Testing Security

### 10.1 Security Test Checklist

- [ ] Try accessing `/api/subscription/status` without auth → Should return 401
- [ ] Try accessing `/api/usage/check` without auth → Should return 401
- [ ] Try direct URL access to protected pages → Should redirect to sign-in (after middleware added)
- [ ] Test password reset token expiry → Should fail after 5 minutes
- [ ] Test password reset token reuse → Should fail (single-use)
- [ ] Test brute force protection → Should be rate limited (after implementation)
- [ ] Test JWT token expiry → Should require re-authentication after expiry
- [ ] Test webhook signature verification → Should reject invalid signatures

---

## 11. Conclusion

### Security Status: ⚠️ **NEEDS IMPROVEMENT**

**Strong Points:**
- ✅ Server-side API protection is solid
- ✅ Password security is good
- ✅ JWT tokens are secure
- ✅ Webhook verification is proper

**Critical Issues:**
- 🔴 Missing route-level protection (middleware)
- 🟠 Client-side only checks can be bypassed
- 🟡 No rate limiting
- 🟡 JWT expiry not configured

**Next Steps:**
1. Implement middleware for route protection
2. Add rate limiting
3. Configure explicit JWT expiry
4. Add account lockout mechanism

---

**Document Version:** 1.0  
**Last Updated:** 2024  
**Next Review:** After implementing fixes

