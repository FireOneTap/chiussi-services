/**
 * RUNBOOK.md
 * 
 * Incident Response & Troubleshooting Guide - Chiussi Services
 * Version: 1.0 | Date: 2026-02-05
 * 
 * Quick reference guide for on-call engineers to diagnose and resolve
 * critical incidents in production.
 */

# Incident Response Runbook - Chiussi Services

## Quick Reference

**Severity Levels:**
- **P0 (Critical):** Service completely down, all users affected
- **P1 (High):** Major feature broken, significant user impact
- **P2 (Medium):** Feature degraded, some users affected
- **P3 (Low):** Minor issue, cosmetic or edge case

---

## Table of Contents
1. [Quick Diagnosis](#quick-diagnosis)
2. [P0 - Critical Incidents](#p0---critical-incidents)
3. [P1 - High Priority Issues](#p1---high-priority-issues)
4. [P2 - Medium Priority Issues](#p2---medium-priority-issues)
5. [Useful Dashboards](#useful-dashboards)
6. [Escalation Path](#escalation-path)

---

## Quick Diagnosis

**START HERE for any incident:**

### Step 1: Determine Severity (30 seconds)

```bash
# Check if service is accessible
curl -I https://chiussi-services.vercel.app/
# 200 OK = service up
# 502/503 = service down (P0)
# Timeout = network issue (P0)

# Check Sentry error rate
# Go to: https://sentry.io/organizations/chiussi-services/
# Look at "Errors" graph in last 5 minutes
# If spike → P0 or P1
# If gradual → P2 or P3

# Check Vercel status
# Go to: https://vercel.com/status
# Is Vercel experiencing issues? (impacts all deployed apps)
```

### Step 2: Identify Impact (1 minute)

```bash
# Is it affecting:
[ ] All users?        → P0
[ ] Specific feature?  → P1/P2
[ ] Specific region?   → P1
[ ] Specific browser?  → P2
[ ] Test environment?  → P3

# How many users affected?
# Check Sentry → User count in alerts
```

### Step 3: Quick Triage (2 minutes)

| Symptom | Likely Cause | Next Step |
|---------|-------------|-----------|
| HTTP 502/503 | Vercel down or build failed | Check Vercel logs |
| Timeout errors | Database unreachable | Check Supabase |
| Auth errors | Secret keys wrong | Check env vars |
| 429 (Too Many Requests) | Rate limit hit | Check load |
| Increased response time | Performance issue | Check metrics |
| Unexpected errors | Code bug | Check recent commits |

---

## P0 - Critical Incidents

**Service is DOWN or COMPLETELY BROKEN**

### Timeline: 0-5 minutes

**1. Confirm the issue (1 min)**
```bash
# Is it really down?
curl https://chiussi-services.vercel.app/ -w "\nStatus: %{http_code}\n"

# Check from multiple regions (might be regional)
# Use: https://www.isitdownrightnow.com (or similar)

# Check status pages
- Vercel: https://vercel.com/status
- Supabase: https://supabase.io/status
```

**2. Check deployment status (1 min)**
```bash
# Go to: https://vercel.com/dashboard/chiussi-services/deployments

# Is latest deployment failed?
# [ ] Yes → Rollback immediately (see below)
# [ ] No → Check application logs
```

**3. Immediate actions (2 min)**

If deployment failed:
```bash
# OPTION A: Rollback via Vercel Dashboard
# 1. Go to: https://vercel.com/dashboard/chiussi-services
# 2. Click Deployments tab
# 3. Find last successful deployment (usually 2-3 deployments back)
# 4. Click 3-dot menu → "Promote to Production"
# 5. Confirm promotion

# OPTION B: Rollback via Git
git log --oneline | head -5
# Find the last working commit
git revert <bad-commit-hash>
git push origin main
# Wait 2-3 minutes for Vercel to redeploy

# OPTION C: Emergency git reset (only if P0)
# WARNING: Only use if rollback doesn't work
git reset --hard origin/main~1
git push -f origin main
```

If deployment succeeded but service down:
```bash
# Check application logs
# Go to: https://vercel.com/dashboard → Select project → Logs

# Look for:
- Build errors
- Runtime errors
- Database connection failures
- Out of memory errors

# Also check Sentry:
# https://sentry.io/organizations/chiussi-services/issues/
```

**4. Notify team (immediately)**
```bash
# Post to #incidents Slack channel
[P0 INCIDENT] Service Down
- Started: <timestamp>
- Affected users: All
- Status: Investigating / Rolled back
- ETA: <time>
```

### Timeline: 5-15 minutes

**Root cause analysis:**

```bash
# Check recent changes
git log --oneline -10
# What changed in the last deployment?

# Check dependencies
npm ls | grep -E "ERROR|WARN"

# Check database
# Go to: https://supabase.com/dashboard
# Check:
  - Connection status
  - Logs tab (any errors?)
  - Auth tab (any issues?)

# Check Sentry
# Go to: https://sentry.io/organizations/chiussi-services/
# Sort by: Most recent
# Look for patterns in errors
```

**If root cause identified:**

```bash
# Fix the issue
# Edit the problematic file
# Run: npm run lint && npm run test:ci && npm run build

# Create fix commit
git add .
git commit -m "fix(P0): resolve critical issue"
git push origin main

# Monitor deployment
# Watch: https://vercel.com/dashboard/chiussi-services/deployments
```

**If root cause unknown:**

```bash
# Call for help immediately
# Escalate to senior engineer
# Contact platform provider if needed (Vercel, Supabase)
```

---

## P1 - High Priority Issues

**Major feature broken, significant user impact**

### Timeline: 0-15 minutes

**1. Investigate affected feature (5 min)**

```bash
# Reproduce the issue
# Visit: https://chiussi-services.vercel.app/
# Try the affected feature manually

# Check Sentry for error details
# Go to: https://sentry.io/organizations/chiussi-services/issues/
# Click affected error
# Look for:
  - Stack trace
  - Affected users
  - Browser/environment
  - Breadcrumbs (what happened before)

# Identify pattern
[ ] All users affected?
[ ] Specific browser/device?
[ ] Specific action triggers it?
```

**2. Quick temporary workaround (if available)**

```bash
# Some issues can be mitigated without deployment:

# If database issue:
# - Check Supabase for connection pool exhaustion
# - Restart connection pool if available

# If API rate limited:
# - Check origin IP in logs
# - Add to temporary allowlist (if applicable)

# If frontend bug:
# - Disable affected feature via feature flag (if available)
# - Serve previous version via Vercel (see rollback in P0)
```

**3. Fix and deploy (10 min)**

```bash
# Identify the root cause:
git log --oneline | head -20
# What changed recently?

# Create fix
# ... edit files ...

# Verify fix locally
npm run dev  # Test on localhost:3000

# Run tests
npm run test:ci  # Must pass all tests
npm run build    # Must build successfully

# Deploy
git add .
git commit -m "fix(P1): fix broken feature"
git push origin main

# Monitor
# Watch deployment at: https://vercel.com/dashboard
# Check Sentry for error decline: https://sentry.io/
# Wait for 2-3 minutes, verify error rate returns to normal
```

**4. Post-incident**

```bash
# Create GitHub issue for post-mortem
# Title: "P1 Incident: [Feature name] broken on [timestamp]"
# Include:
  - What happened
  - Root cause
  - How we fixed it
  - Prevention for future

# Update Sentry alert if needed
# Adjust monitoring/alerts to catch this earlier next time
```

---

## P2 - Medium Priority Issues

**Feature degraded, some users affected**

### Symptoms & Quick Fixes

**Slow page load**
```bash
# Check Vercel metrics
# Go to: https://vercel.com/dashboard → Analytics

# If memory issue:
# Restart Vercel (redeploy with empty commit)
git commit --allow-empty -m "chore: restart deployment"
git push origin main

# If database slow:
# Check Supabase → Dashboard → Logs
# Look for slow queries
```

**Database connection timeout**
```bash
# Check Supabase status
# Go to: https://supabase.io/status

# If degraded:
# Add connection retry logic or timeout
# Or wait for provider to recover

# If down:
# This is actually P0 or P1 depending on impact
# Escalate accordingly
```

**Authentication issues**
```bash
# Check if secrets are correct
# Go to: https://vercel.com/dashboard/chiussi-services/settings
# Verify environment variables:
  - NEXT_PUBLIC_SENTRY_DSN
  - SUPABASE_URL
  - SUPABASE_KEY

# If wrong, update and redeploy:
# Make empty commit to trigger redeployment
git commit --allow-empty -m "chore: update env vars"
git push origin main
```

**Rate limiting too strict**
```bash
# Check rate limiter logs
# Increase limit temporarily:
# File: lib/rate-limit.js
# Change: RATE_LIMIT_MAX from 5 to 10

# Deploy:
git add lib/rate-limit.js
git commit -m "chore: temporarily increase rate limit"
git push origin main

# Investigate root cause:
# Is there a legitimate traffic spike?
# Or is it an attack?
```

---

## Useful Dashboards

### Monitoring Tools (Bookmark these!)

```markdown
### Real-time Monitoring
- Vercel Deployments: https://vercel.com/dashboard/chiussi-services/deployments
- Vercel Analytics: https://vercel.com/dashboard/chiussi-services/analytics
- Vercel Logs: https://vercel.com/dashboard/chiussi-services/logs

### Error Tracking
- Sentry Issues: https://sentry.io/organizations/chiussi-services/issues/
- Sentry Alerts: https://sentry.io/organizations/chiussi-services/alerts/
- Sentry Releases: https://sentry.io/organizations/chiussi-services/releases/

### Database & Infrastructure
- Supabase Dashboard: https://supabase.com/dashboard
- Supabase Logs: https://supabase.com/dashboard/project/_/logs
- Supabase Auth: https://supabase.com/dashboard/project/_/auth/users

### CI/CD
- GitHub Actions: https://github.com/FireOneTap/chiussi-services/actions
- GitHub Commits: https://github.com/FireOneTap/chiussi-services/commits/main
- GitHub Releases: https://github.com/FireOneTap/chiussi-services/releases

### System Status
- Vercel Status: https://vercel.com/status
- GitHub Status: https://www.githubstatus.com/
- Supabase Status: https://supabase.io/status
```

---

## Escalation Path

### Who To Contact

**For Deployment Issues:**
1. Check Vercel logs (self-serve)
2. Redeploy or rollback (self-serve)
3. Contact Vercel Support if persists

**For Database Issues:**
1. Check Supabase dashboard (self-serve)
2. Check RLS policies & connection limits
3. Contact Supabase Support if persists

**For Application Errors:**
1. Check Sentry dashboard (self-serve)
2. Check git history for recent changes
3. Rollback recent deployment (self-serve)
4. Create GitHub issue for code review

**For Security Incidents:**
1. IMMEDIATELY revoke compromised tokens
2. Force password resets if needed
3. Notify team in #security-incident channel
4. Contact platform providers if their systems compromised

### Slack Escalation

```
#incidents        - For all P0/P1 incidents
#alert-critical   - Automated P0 alerts
#alert-warnings   - Automated P1/P2 alerts
#security-incident - For security-related issues
```

### Contact Info

- **Senior Engineer:** Check team calendar or Slack status
- **On-Call Engineer:** Check PagerDuty rotation
- **Sentry Support:** https://sentry.io/support
- **Vercel Support:** https://vercel.com/support
- **GitHub Support:** https://support.github.com
- **Supabase Support:** https://supabase.com/support

---

## Incident Report Template

**Use this template after resolving any P0/P1 incident:**

```markdown
## Incident Report

**Date/Time:** YYYY-MM-DD HH:MM UTC
**Duration:** X minutes
**Severity:** P0 / P1

### What Happened
[Brief description of what users experienced]

### Root Cause
[What caused the issue - code bug, infrastructure, external dependency, etc.]

### Timeline
- HH:MM - Issue detected
- HH:MM - Root cause identified
- HH:MM - Fix deployed
- HH:MM - Verified resolved

### Detection Time
[How long before we noticed? How can we detect faster?]

### Resolution
[What did we do to fix it?]

### Prevention
[What can we do to prevent this in the future?]

### Action Items
- [ ] Action 1
- [ ] Action 2
- [ ] Follow-up

### Assignees
- Root cause analysis: @person
- Code/process fix: @person
- Prevention implementation: @person
```

---

## Quick Commands Reference

```bash
# Check if app is up
curl -I https://chiussi-services.vercel.app/

# See what's deployed
git log --oneline -5

# Rollback locally (then push)
git revert HEAD

# See Sentry errors in last 5 min
# Visit: https://sentry.io/organizations/chiussi-services/

# Check rate limiter is working
curl -X GET https://chiussi-services.vercel.app/api/csrf-token -v

# Test database connection
# Visit app and check console for auth errors
# Or check Supabase logs directly

# Force redeploy (useful if env var changed)
git commit --allow-empty -m "trigger: redeploy"
git push origin main
```

---

**Remember:**
- Stay calm - most incidents are fixable
- Communicate with team - keep #incidents updated
- Document what happened - helps prevent future incidents
- Follow the checklist - don't skip steps to save time
- When in doubt - escalate rather than guess

---

**Document Version:** 1.0 | **Last Updated:** 2026-02-05 | **Maintained by:** DevOps Team
