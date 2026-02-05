/**
 * DEPLOYMENT.md
 * 
 * Production Deployment Guide - Chiussi Services
 * Version: 1.0 | Date: 2026-02-05
 * 
 * This document outlines the complete deployment process for Chiussi Services
 * including pre-deployment checks, deployment procedures, verification, and rollback.
 */

# Deployment Guide - Chiussi Services

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Deployment Process](#deployment-process)
4. [Post-Deployment Verification](#post-deployment-verification)
5. [Rollback Procedures](#rollback-procedures)
6. [Monitoring & Alerts](#monitoring--alerts)
7. [Common Issues & Solutions](#common-issues--solutions)

---

## Prerequisites

### Required Access & Permissions
- [ ] GitHub repository write access
- [ ] Vercel project admin access
- [ ] Sentry organization access
- [ ] Production database access (Supabase)
- [ ] Domain DNS admin access (if applicable)

### Required Tools
```bash
# Verify installations
node --version          # v22.12.0 or later
npm --version          # v11.0.0 or later
git --version          # v2.40.0 or later
```

### Environment Setup
```bash
# Ensure .env variables are configured
NEXT_PUBLIC_SENTRY_DSN=<your-sentry-dsn>
SUPABASE_URL=<your-supabase-url>
SUPABASE_KEY=<your-supabase-anon-key>
```

---

## Pre-Deployment Checklist

### 1. Code Quality Checks (RUN LOCALLY)
```bash
# Lint check
npm run lint
# Expected: 0 errors

# Security audit
npm audit
# Expected: 0 vulnerabilities

# Type checking
npm run type-check
# Expected: No type errors
```

### 2. Testing
```bash
# Run all tests
npm run test:ci
# Expected: All tests PASS (82+/82+)

# Run E2E tests
npm run test:e2e
# Expected: Minimum 70+ tests passing
```

### 3. Build Verification
```bash
# Full production build
npm run build
# Expected: SUCCESS, all routes compiled

# Check build output
ls -la .next/
# Expected: .next directory with static + server files
```

### 4. Dependency Security
```bash
# Update packages
npm ci

# Check for outdated packages
npm outdated
# Action: Review and update non-critical packages only

# Final audit
npm audit --production
# Expected: 0 vulnerabilities
```

### 5. Environment Variables Validation
```bash
# Verify all required env vars are set
echo $NEXT_PUBLIC_SENTRY_DSN
echo $SUPABASE_URL
echo $SUPABASE_KEY
# Expected: All should be non-empty

# Verify no secrets are in git
git ls-files | grep -E "\.env|secret|token|key"
# Expected: Only .env.example or .env.local (not tracked)
```

### 6. Git State Verification
```bash
# Check clean working directory
git status
# Expected: working tree clean

# Verify current branch
git branch -v
# Expected: On 'main' branch

# Check latest commits
git log --oneline -5
# Expected: Latest commit is your feature/fix
```

---

## Deployment Process

### Option A: Automatic Deployment (Recommended)

**Trigger:** Push to `main` branch (GitHub → Vercel webhook)

```bash
# 1. Ensure all changes are committed
git status
# Expected: working tree clean

# 2. Push to main (requires PR approval)
git push origin main

# 3. GitHub Actions will run:
#    - Lint check
#    - Test suite (jest)
#    - Full build
#    - Coverage report
#    - Sentry source maps

# 4. Vercel will:
#    - Trigger on main push
#    - Build Next.js app
#    - Upload to CDN
#    - Deploy within 2-3 minutes
```

**Monitoring Auto-Deployment:**
```bash
# Watch GitHub Actions
# Go to: https://github.com/FireOneTap/chiussi-services/actions

# Watch Vercel Deployment
# Go to: https://vercel.com/dashboard → chiussi-services

# Check Sentry for new releases
# Go to: https://sentry.io/ → Releases tab
```

### Option B: Manual Deployment

**If you need to deploy without pushing to GitHub:**

```bash
# 1. Build locally
npm run build

# 2. Test build
npm run start  # Test locally on http://localhost:3000

# 3. Deploy with Vercel CLI (if installed)
npm install -g vercel
vercel --prod

# 4. Follow prompts and confirm deployment
```

### Option C: Rollback to Previous Version

```bash
# 1. Identify previous working commit
git log --oneline | head -10

# 2. Revert the problematic commit
git revert <commit-hash>

# 3. Push the revert commit
git push origin main

# 4. Verify rollback in Vercel dashboard
# The previous working version should be deployed within 2-3 minutes
```

---

## Post-Deployment Verification

### Immediate Checks (Within 5 minutes)

**1. Vercel Deployment Status**
```bash
# Check deployment status
# Visit: https://vercel.com/dashboard/chiussi-services

# Expected indicators:
# ✅ Status: Ready
# ✅ Duration: < 3 minutes
# ✅ No error logs
```

**2. Application Health Check**
```bash
# Test homepage
curl https://chiussi-services.vercel.app/

# Expected: 200 OK, HTML response

# Test API endpoint
curl https://chiussi-services.vercel.app/api/csrf-token

# Expected: 200 OK, JSON response with token
```

**3. Security Headers Verification**
```bash
# Check security headers
curl -I https://chiussi-services.vercel.app/

# Expected headers:
# ✅ content-security-policy
# ✅ x-frame-options: DENY
# ✅ x-content-type-options: nosniff
# ✅ strict-transport-security
# ✅ referrer-policy
```

**4. Sentry Monitoring**
```bash
# Check Sentry dashboard
# Go to: https://sentry.io/organizations/chiussi-services/

# Expected:
# ✅ New release created
# ✅ Source maps uploaded
# ✅ No unexpected errors in last 5 minutes
```

### Functional Checks (Next 15 minutes)

**1. Page Load Times**
```bash
# Check performance metrics
# Typical values:
# - First Contentful Paint: < 1.5s
# - Largest Contentful Paint: < 2.5s
# - Cumulative Layout Shift: < 0.1

# Verify in:
# - Vercel Analytics: https://vercel.com/dashboard
# - Sentry Performance: https://sentry.io/
```

**2. Database Connectivity**
```bash
# Test Supabase connection
# Visit: https://chiussi-services.vercel.app/
# Check browser console for no auth errors

# Verify in Supabase:
# - Go to: https://supabase.com/dashboard
# - Check connection logs
```

**3. User-Facing Features**
```bash
# Test critical paths manually:
[ ] Homepage loads
[ ] Login page accessible
[ ] Navigation works
[ ] API endpoints respond
```

### Extended Monitoring (24 hours)

**Error Tracking:**
- Monitor Sentry dashboard for new errors
- Alert threshold: Any new errors should be investigated
- Expected error rate: < 0.1% of requests

**Performance Monitoring:**
- Track response times in Vercel Analytics
- Check for performance regressions
- Expected: Response times within historical range

**User Activity:**
- Monitor Sentry session replay for user interactions
- Check for UI/UX issues
- Alert on high bounce rate

---

## Rollback Procedures

### Automated Rollback (If deployment fails immediately)

**Vercel will automatically:**
- Detect build failures in CI/CD
- Prevent deployment if tests fail
- Keep previous version live

**If you need to rollback manually:**

```bash
# 1. Go to Vercel dashboard
# URL: https://vercel.com/dashboard/chiussi-services

# 2. Find the previous working deployment
# Click on "Deployments" tab

# 3. Find last successful deployment
# Click the 3-dot menu → "Promote to Production"

# 4. Confirm promotion
# Expected: Rollback complete in < 1 minute
```

### Git Rollback

```bash
# 1. Revert to previous commit
git revert <problematic-commit-hash>

# 2. Push revert commit
git push origin main

# 3. Wait for Vercel to redeploy
# Should complete in 2-3 minutes

# 4. Verify rollback
curl https://chiussi-services.vercel.app/api/health-check
# Should return clean response
```

### Database Rollback

**If database migration caused issues:**

```bash
# 1. Connect to Supabase dashboard
# URL: https://supabase.com/dashboard

# 2. Go to SQL Editor

# 3. Revert migrations (restore from backup if available)
# Supabase keeps 7-day backups

# 4. Contact support if needed
# https://supabase.com/support
```

---

## Monitoring & Alerts

### Sentry Configuration

**Setup Alerts:**
1. Go to: https://sentry.io/organizations/chiussi-services/alerts/
2. Create alert for:
   - Error rate > 1% in 5 minutes → Slack notification
   - New issue type → Email
   - Performance regression → Slack notification

**Recommended Thresholds:**
```yaml
Error Rate Alert:
  - Threshold: > 1%
  - Window: 5 minutes
  - Action: Notify #incidents on Slack

Performance Alert:
  - Metric: Response time
  - Threshold: > 2x baseline
  - Window: 10 minutes
  - Action: Notify #incidents on Slack

Release Health:
  - Track: Crash-free sessions
  - Threshold: < 99%
  - Action: Create issue on GitHub
```

### Vercel Analytics

**Monitor:**
1. Response times
2. Status codes (5xx errors)
3. Deployment frequency
4. Build duration

**Access:**
- Vercel Dashboard → Analytics tab
- Real-time monitoring at: https://vercel.com/dashboard

### GitHub Actions

**Monitor CI/CD:**
1. Go to: https://github.com/FireOneTap/chiussi-services/actions
2. Watch for:
   - Failed tests
   - Lint errors
   - Build failures

**Setup notifications:**
- GitHub will email on workflow failures
- Set to watch "All Activity" on repository

---

## Common Issues & Solutions

### Issue 1: Build Fails with "Module not found"

**Symptom:** Vercel deployment fails with module not found error

**Solution:**
```bash
# 1. Local reproduction
npm ci
npm run build

# 2. If error reproduces, check:
- Are all imports correct?
- Are all dependencies installed?
- Run: npm audit fix

# 3. If specific dependency issue:
npm ls <package-name>  # Check for conflicts
npm ci --force         # Reinstall clean

# 4. Push fix
git add package-lock.json
git commit -m "fix: resolve dependency issue"
git push origin main
```

### Issue 2: Environment Variables Not Set

**Symptom:** App works locally but fails in production with "undefined variable"

**Solution:**
```bash
# 1. Go to Vercel dashboard
# Project → Settings → Environment Variables

# 2. Verify all required vars are set:
NEXT_PUBLIC_SENTRY_DSN
SUPABASE_URL
SUPABASE_KEY

# 3. Re-deploy after adding variables:
# Go to Deployments → Click latest → "Redeploy"

# 4. Or push empty commit
git commit --allow-empty -m "redeploy: update env vars"
git push origin main
```

### Issue 3: High Error Rate in Production

**Symptom:** Sentry shows sudden spike in errors

**Solution:**
```bash
# 1. Check Sentry dashboard
# https://sentry.io/organizations/chiussi-services/

# 2. Identify error type and frequency

# 3. If database related:
# - Check Supabase status
# - Verify RLS policies
# - Check connection limits

# 4. If code related:
# - Review recent commits
# - Run local test with same conditions
# - Consider rollback if critical

# 5. Check logs
# Vercel → Logs tab
# Look for pattern in timestamps and user actions
```

### Issue 4: Performance Degradation

**Symptom:** Response times significantly increased

**Solution:**
```bash
# 1. Check metrics in Vercel dashboard
# - Look at last deployment changes
# - Compare response times before/after

# 2. Check database performance
# Supabase → Logs → Slow queries
# Look for queries > 1s

# 3. Optimize if code-related:
# - Check for N+1 queries
# - Optimize images
# - Check bundle size: npm run analyze

# 4. If unresolved, consider rollback:
git revert <problematic-commit>
git push origin main
```

### Issue 5: Rate Limiting Errors (429 Too Many Requests)

**Symptom:** Users see "Rate limit exceeded" messages

**Solution:**
```bash
# 1. Check rate-limiter configuration
# File: lib/rate-limit.js
# Current limit: 5 requests/min per IP

# 2. If legitimate traffic causing issues:
# - Increase limit carefully: 10 req/min
# - Implement user-based limits (higher for authenticated)
# - Add IP whitelist for trusted services

# 3. If attack:
# - Check Vercel logs for source IPs
# - Consider WAF rules
# - Monitor Sentry for attack patterns

# 4. Deploy fix:
# Edit rate-limit.js
git add lib/rate-limit.js
git commit -m "chore: adjust rate limits"
git push origin main
```

---

## Deployment Checklist Template

**Copy and use before each deployment:**

```markdown
## Pre-Deployment
- [ ] npm run lint → 0 errors
- [ ] npm run test:ci → All tests pass
- [ ] npm run build → Build succeeds
- [ ] npm audit → 0 vulnerabilities
- [ ] All environment variables set
- [ ] Git working tree clean
- [ ] Code review approved

## Deployment
- [ ] git push origin main
- [ ] GitHub Actions pipeline running
- [ ] All checks passing (lint, test, build)

## Post-Deployment
- [ ] Vercel deployment successful
- [ ] Homepage loads (< 2s)
- [ ] API health check passes
- [ ] Security headers present
- [ ] Sentry receiving events
- [ ] No unexpected errors in Sentry (5 min window)
- [ ] Database connected
- [ ] User testing: critical paths work

## Extended Monitoring (24h)
- [ ] Error rate < 1%
- [ ] Response times within baseline
- [ ] No performance degradation
- [ ] Session replay shows normal activity
```

---

## Support & Escalation

### Getting Help

**For deployment issues:**
1. Check this document's "Common Issues" section
2. Review Sentry dashboard for error details
3. Check GitHub Actions logs for CI/CD failures
4. Review Vercel deployment logs

**Contact:**
- **Sentry Issues:** https://sentry.io/support
- **Vercel Issues:** https://vercel.com/support
- **GitHub Issues:** https://github.com/FireOneTap/chiussi-services/issues
- **Database:** https://supabase.com/support

**Emergency Rollback:**
If critical error in production:
1. Go to Vercel dashboard
2. Find previous working deployment
3. Click "Promote to Production"
4. Notify team in Slack #incidents

---

## Appendix: Useful Commands

```bash
# Quick health check after deployment
npm run build && npm run test:ci

# Check what changed in current commit
git diff HEAD~1

# See deployment history
git log --oneline | head -20

# Check Vercel CLI status
vercel status

# Get current environment
npm run env

# Monitor Sentry locally
npm run dev & open http://localhost:3000/sentry-example-page

# Check rate limiter
curl -X GET http://localhost:3000/api/csrf-token -v
# For production:
curl -X GET https://chiussi-services.vercel.app/api/csrf-token -v
```

---

**Document Version:** 1.0 | **Last Updated:** 2026-02-05 | **Maintained by:** DevOps Team
