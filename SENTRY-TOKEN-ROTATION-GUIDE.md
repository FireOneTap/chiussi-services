# 🔐 GITHUB SECRETS UPDATE GUIDE

## Step 1: Update SENTRY_AUTH_TOKEN in GitHub Secrets

**URL:** https://github.com/FireOneTap/chiussi-services/settings/secrets/actions

### Option A: Via GitHub Web UI (Recommended)

1. Go to: **Settings → Secrets and variables → Actions**
2. Find existing secret: `SENTRY_AUTH_TOKEN`
3. Click **"Update"** (not delete, so commit history is preserved)
4. **New value:**
   ```
   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
   ```
5. Click **"Update secret"**

### Option B: Via GitHub CLI

```bash
gh secret set SENTRY_AUTH_TOKEN --body "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"
```

---

## Step 2: Verify in CI/CD

After updating the secret:

1. Go to: **Actions → CI/CD Pipeline (latest run)**
2. Look for Sentry build step output:
   ```
   ✅ Sentry CLI is configured
   ✅ Source maps uploaded successfully
   ```
3. If fails, check:
   - Token is correct (copy-pasted exactly)
   - Token is not expired in Sentry
   - Sentry organization exists

---

## Step 3: Update Local Dev Environment

✅ **Already done:**
- `.env.sentry-build-plugin` has new token
- `npm run build` succeeded locally

**Next build:** CI/CD will auto-use GitHub Secrets

---

## ⚠️ Important Notes

- ✅ `.env.sentry-build-plugin` is now in `.gitignore`
- ✅ This file won't be committed anymore
- ✅ GitHub Secrets is the single source of truth for CI/CD
- ✅ Old token is revoked in Sentry (can't be used)

---

## Verification Checklist

After updating GitHub Secrets:

- [ ] Secret updated in GitHub (no visible value in UI)
- [ ] `npm run build` works locally
- [ ] CI/CD pipeline triggered (push to any branch)
- [ ] All checks PASS (lint, test, build)
- [ ] Sentry logs uploaded (check Sentry dashboard)

---

## If Something Goes Wrong

**Rollback:**
```bash
# Revert Sentry token to previous value
# In GitHub Secrets: Update SENTRY_AUTH_TOKEN with old value

# Local: Rotate token back in Sentry dashboard
# Re-generate token in Sentry.io → Auth Tokens
```

**Debug:**
```bash
# Check if token is loaded in CI/CD
echo $SENTRY_AUTH_TOKEN  # Should be masked in logs

# Test locally
npm run build --verbose
```

---

**Status:** 🟢 Token rotated, local build SUCCESS  
**Next:** Update GitHub Secrets (manual step required)
