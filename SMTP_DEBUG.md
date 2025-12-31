# SMTP Email Debugging Guide

## Quick Check - Is SMTP Configured?

Your logs show the token is being generated, but no email logs. This means either:
1. **Server not restarted** - You must restart your dev server after code changes
2. **SMTP not configured** - Environment variables not loaded
3. **Email failing silently** - Error is being caught somewhere

## Step-by-Step Debugging

### Step 1: Verify Environment Variables

Check your `.env.local` file has these (without quotes, or with consistent quotes):

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password-here
SMTP_FROM=your-email@gmail.com
```

**Important for Gmail:**
- If you have 2-Step Verification enabled, you MUST use an **App Password**
- Get App Password: https://myaccount.google.com/apppasswords
- Create app password for "Mail" → Use the 16-character password

### Step 2: RESTART Your Dev Server

**CRITICAL:** After changing `.env.local` or code, you MUST restart:
```bash
# Stop server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 3: Test Configuration

Visit this URL in your browser:
```
http://localhost:3000/api/test-email
```

This will show:
- ✅ Which environment variables are set
- ✅ SMTP connection status
- ✅ Any errors

### Step 4: Try Forgot Password Again

After restart, try forgot password and check your **terminal/console** for these logs:

**If SMTP is configured correctly:**
```
📧 sendPasswordResetEmail called: { email: '...', hasToken: true }
📧 Environment check: { hasSMTP_USER: true, ... }
📧 Creating SMTP transporter...
✅ Email sent successfully!
```

**If SMTP is NOT configured:**
```
⚠️  SMTP_USER: ✗ Not set
⚠️  SMTP_PASSWORD: ✗ Not set
📧 [DEV MODE - NO SMTP] Email would be sent:
🔗 Reset Link: http://localhost:3000/auth/reset-password?token=...
```

**If SMTP fails:**
```
❌ Email sending error: ...
Error details: { code: 'EAUTH', ... }
```

## Common Issues

### Issue 1: "SMTP_USER: ✗ Not set"
**Solution:** 
- Check `.env.local` exists in `audio-processor/` folder
- Make sure variable names are correct (case-sensitive)
- Restart dev server

### Issue 2: "EAUTH" or "Authentication failed"
**Solution:**
- Gmail requires App Password if 2FA is enabled
- Go to: https://myaccount.google.com/apppasswords
- Generate new app password → Use that 16-char password in `SMTP_PASSWORD`

### Issue 3: "ECONNECTION" or "ETIMEDOUT"
**Solution:**
- Check `SMTP_HOST` and `SMTP_PORT` are correct
- For Gmail: `smtp.gmail.com` port `587`
- Check firewall/network settings

### Issue 4: No logs appear at all
**Solution:**
- Server not restarted → **Restart your dev server**
- Code changes not saved → Save all files
- Wrong terminal → Check the terminal where `npm run dev` is running

## Still Not Working?

1. **Check the test endpoint:** `/api/test-email`
2. **Copy ALL terminal logs** after trying forgot password
3. **Check spam folder** - emails might be there
4. **Verify email address** - Make sure you're checking the right inbox

