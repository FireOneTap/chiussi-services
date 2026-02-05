/**
 * SENTRY-ALERTS-SETUP.md
 * 
 * Setup Guide for Sentry Error Tracking & Alert Configuration
 * Version: 1.0 | Date: 2026-02-05
 * 
 * This guide helps you configure Sentry alerts to catch production errors
 * before users are severely impacted.
 */

# Sentry Alerts Configuration Guide

## Quick Setup (15 minutes)

### Prerequisites
- Sentry account access: https://sentry.io
- Slack workspace with admin access (for Slack notifications)
- GitHub integration enabled

### Step 1: Setup Slack Integration (5 min)

**In Sentry:**
```
1. Go to: https://sentry.io/organizations/chiussi-services/
2. Click: Settings (bottom left)
3. Navigate: Integrations
4. Find: Slack
5. Click: Add to Slack
6. Authorize the Sentry app in your Slack workspace
7. Choose channel: #incidents
```

**In Slack:**
```
You'll see a message: "Sentry notification created"
Channel #incidents is now connected to Sentry
```

### Step 2: Create Alert Rule - Error Spike (5 min)

**In Sentry:**
```
1. Go to: https://sentry.io/organizations/chiussi-services/alerts/
2. Click: Create Alert Rule
3. Set filters:
   - Condition: "when error rate is high"
   - Value: > 1% in 5 minute window
4. Set action:
   - Send to: #incidents on Slack
   - Include: Error count, affected users
5. Name: "High Error Rate"
6. Save alert
```

**Expected behavior:**
- If errors > 1% in 5 min → Slack alert in #incidents
- Alert includes links to Sentry issue details

### Step 3: Create Alert Rule - New Issue Type (3 min)

**In Sentry:**
```
1. Go to: https://sentry.io/organizations/chiussi-services/alerts/
2. Click: Create Alert Rule
3. Set filters:
   - Condition: "when a new issue is created"
   - Environment: Production
4. Set action:
   - Send to: #incidents on Slack
5. Name: "New Production Error"
6. Save alert
```

**Expected behavior:**
- Any new error type in production → Immediate Slack alert
- Useful for catching unexpected regressions

---

## Recommended Alert Configuration

### Alert Rules Summary

| Alert | Condition | Action | Severity |
|-------|-----------|--------|----------|
| High Error Rate | Error rate > 1% in 5 min | Slack #incidents | P1 |
| New Error | New issue in production | Slack #incidents | P1 |
| Performance Regression | Response time > 2x baseline | Slack #warnings | P2 |
| Crash-free Sessions | < 99% in 24h | Email + Slack | P1 |
| Database Errors | 5XX errors > 10 in 5 min | Slack #incidents | P0 |

### Setup All Recommended Alerts

```markdown
## Alert 1: Error Rate
- Condition: error count >= 100 in 5 minute window
- OR: error rate >= 1% in 5 minute window
- Action: Send to Slack #incidents
- Name: "High Error Rate Alert"

## Alert 2: New Error Type
- Condition: A new issue is created in Production
- Action: Send to Slack #incidents
- Name: "New Production Error"

## Alert 3: Critical Error Type
- Condition: Issue with "TypeError" or "ReferenceError" created
- Action: Send to Slack #incidents
- Name: "Runtime Error Alert"

## Alert 4: Performance Issues
- Condition: Transaction p99 latency > 2000ms for 5 minutes
- Action: Send to Slack #performance
- Name: "High Latency Warning"

## Alert 5: Release Health
- Condition: Session crash-free rate < 99%
- Action: Send to Slack #alerts
- Name: "Release Quality Alert"
```

---

## Step-by-Step Configuration

### Alert 1: High Error Rate

**Goal:** Catch sudden spikes in errors

**Configuration:**
```
URL: https://sentry.io/organizations/chiussi-services/alerts/new/

1. Choose your environment:
   ✅ Environment: Production
   
2. Set alert condition:
   ✅ When: Error count
   ✅ Is greater than or equal to: 100
   ✅ In the last: 5 minutes
   OR
   ✅ When: Error rate
   ✅ Is: Greater than or equal to
   ✅ Value: 1% (percent)
   ✅ In the last: 5 minutes

3. Set notification action:
   ✅ Then send a Slack notification to: #incidents
   
4. Set trigger:
   ✅ Alert frequency: As often as the condition is met
   
5. Add more actions (optional):
   ✅ Create a GitHub Issue when triggered
   
6. Name your alert:
   ✅ Alert name: "High Error Rate - Production"
   
7. Save:
   ✅ Click "Create Alert Rule"
```

**Test it:**
```bash
# Generate test error
curl https://chiussi-services.vercel.app/api/test-error
# Check Slack - should receive alert within 1-2 minutes
```

### Alert 2: New Issues in Production

**Goal:** Catch new bugs immediately

**Configuration:**
```
URL: https://sentry.io/organizations/chiussi-services/alerts/new/

1. Environment:
   ✅ Environment: Production
   
2. Set alert condition:
   ✅ When: A new issue is created
   
3. Optionally filter:
   ✅ With Level: Error
   
4. Set notification action:
   ✅ Then send a Slack notification to: #incidents
   
5. Name:
   ✅ Alert name: "New Production Error"
   
6. Save
```

**What happens:**
- Any new error type appears → Slack alert with full details
- Includes stack trace, affected user count, browser info

### Alert 3: Database/API Errors

**Goal:** Catch infrastructure issues

**Configuration:**
```
1. Environment: Production

2. Set alert condition:
   ✅ When: Number of errors for a specific event
   ✅ Error matches: "database" OR "connection" OR "timeout"
   ✅ Value: >= 5 errors
   ✅ In: 5 minutes

3. Set notification:
   ✅ Send to Slack #incidents
   
4. Name: "Database/API Error Alert"

5. Save
```

### Alert 4: Performance Regression

**Goal:** Catch slowdowns before users complain

**Configuration:**
```
1. Environment: Production

2. Set alert condition:
   ✅ When: Transaction p99 latency
   ✅ Is: Greater than or equal to
   ✅ Value: 2000 (milliseconds)
   ✅ In: 5 minutes

3. Set notification:
   ✅ Send to Slack #performance (less critical)
   
4. Name: "Performance Regression Alert"

5. Save
```

### Alert 5: Release Health (Crash-Free Sessions)

**Goal:** Track release quality

**Configuration:**
```
1. Environment: Production

2. Set alert condition:
   ✅ When: Crash-free sessions
   ✅ Falls below: 99%
   ✅ In: 24 hours
   
3. Set notification:
   ✅ Send to Slack #alerts
   
4. Name: "Release Health Alert"

5. Save
```

---

## Slack Channel Setup

### Create Dedicated Channels

```bash
# In Slack workspace:

# For critical P0 incidents
#incidents
- Purpose: "Real-time P0/P1 incident alerts"
- Notifications: All members (24/7)

# For warnings and P2 issues
#alert-warnings
- Purpose: "P2/P3 alerts and performance warnings"
- Notifications: During business hours

# For performance monitoring
#performance
- Purpose: "Performance metrics and regressions"
- Notifications: Business hours

# For deployments
#deployments
- Purpose: "Deployment notifications from Vercel/GitHub"
- Notifications: All members (need quick feedback)
```

### Configure Slack Integrations

**Sentry to Slack:**
```
1. Settings → Integrations → Slack
2. Connect to Slack
3. For each alert, select destination channel:
   - High Error Rate → #incidents
   - New Error → #incidents  
   - Performance Issue → #alert-warnings
   - Release Health → #alert-warnings
```

**Vercel to Slack (Optional):**
```
1. Go to: https://vercel.com/dashboard/integrations
2. Find: Slack
3. Install and configure
4. Select #deployments channel
5. Toggle notifications:
   - Deployments: ON
   - Build failures: ON
```

---

## Monitoring Dashboard

### Daily Monitoring Checklist

**Every morning (5 min):**
```bash
# 1. Check overnight alerts
# Go to: https://sentry.io/organizations/chiussi-services/alerts/

# 2. Review error rate
# Go to: https://sentry.io/organizations/chiussi-services/
# Look at "Errors" graph - should be flat/low

# 3. Check Slack #incidents
# Any alerts overnight? Read the thread

# 4. Verify deployment status
# Go to: https://vercel.com/dashboard/chiussi-services/deployments
# Last deployment successful?

# 5. Quick health check
curl https://chiussi-services.vercel.app/api/csrf-token
# Should return 200 with token
```

**During business hours (2x per day):**
```bash
# Check Sentry dashboard
# Look for trends:
- Error rate trending up? (bad)
- New error types? (investigate)
- Performance degrading? (check metrics)
```

**Before deployment (always):**
```bash
# 1. Baseline current error rate
# Screenshot or note the % in Sentry

# 2. After deployment, watch for 5 minutes
# Should NOT see sudden increase in errors

# 3. Check Slack #incidents
# Any new alerts? If yes, might be the deployment
```

---

## Troubleshooting Alerts

### Alert Not Firing (Not Receiving Notifications)

**Check 1: Is Slack integration active?**
```
Settings → Integrations → Slack
✅ Should show "Connected"
✅ Should see workspace name
```

**Check 2: Is alert rule enabled?**
```
Alerts → All Alerts
✅ Find your alert
✅ Toggle should be ON (blue)
✅ Click alert → Check "Enabled" checkbox
```

**Check 3: Are conditions being met?**
```
Click on alert → Audit Log
- See "condition evaluated: false"? 
  → Threshold not yet hit

- See "condition evaluated: true"?
  → Action should have fired
  → Check if Slack permission issue
```

**Check 4: Slack channel permissions**
```
In Slack:
1. Go to channel (e.g., #incidents)
2. Channel details → Integrations
3. Should see Sentry app listed
4. If missing: Re-authorize Sentry in Slack
```

### Getting Too Many Alerts (Alert Fatigue)

**Solution 1: Increase threshold**
```
Alerts → Your alert → Edit
- Increase: Error count threshold (100 → 500)
- Or: Error rate (1% → 5%)
- Save
```

**Solution 2: Add filters**
```
Edit alert → Add conditions:
✅ Level: Error or higher
✅ Environment: Production only
✅ Not: [common false-positive errors]
```

**Solution 3: Create separate channels**
```
#incidents → Critical only
#warnings → Medium severity
#info → Low severity / FYI
```

---

## Integration with On-Call Rotation

### PagerDuty Integration (Optional)

**If using PagerDuty:**

```
1. Go to: https://sentry.io/organizations/chiussi-services/settings/integrations/
2. Search: PagerDuty
3. Install
4. Configure:
   - Service: "Chiussi Services Production"
   - Urgency: High
   - Alert: When error rate > 1%
```

**Result:**
- High-severity Sentry alerts → PagerDuty incident
- On-call engineer gets paged (if outside business hours)

---

## Best Practices

### ✅ DO:

- [ ] Test alert with test error
- [ ] Monitor Slack #incidents for 24h after deploy
- [ ] Review alert frequency weekly
- [ ] Update alert thresholds based on traffic growth
- [ ] Document what each alert is for
- [ ] Keep on-call team notified of new alerts

### ❌ DON'T:

- [ ] Create too many alerts (causes fatigue)
- [ ] Use low thresholds (spammy)
- [ ] Ignore alerts (defeats the purpose)
- [ ] Configure without Slack integration
- [ ] Add critical alerts during off-hours without on-call rotation

---

## Sample Sentry Alert Response

**When you receive a Slack alert:**

```
You get: 
📊 [SENTRY] High Error Rate in Chiussi Services
   Error rate: 5.2% (threshold: 1%)
   Errors: 127 in last 5 minutes
   Affected users: 23
   Most common: TypeError in dashboard/auth
   
   View full details: https://sentry.io/...

YOUR RESPONSE:
1. Click link to view details
2. Check recent commits: git log --oneline -5
3. If recent change looks wrong:
   - Revert: git revert <commit>
   - Push: git push origin main
4. Else, investigate error type
5. Post update in thread: "Investigating..." or "Fixed by reverting..."
```

---

## Verification Checklist

After completing setup:

```
✅ Sentry account connected to workspace
✅ Slack integration installed and authorized
✅ #incidents channel created
✅ High Error Rate alert created
✅ New Error alert created
✅ Test alert configured (optional)
✅ Sent test error and verified Slack notification
✅ On-call team knows about alerts
✅ Documentation shared with team
```

---

## Useful Links

```markdown
- Sentry Dashboard: https://sentry.io/organizations/chiussi-services/
- Sentry Alerts: https://sentry.io/organizations/chiussi-services/alerts/
- Sentry Issues: https://sentry.io/organizations/chiussi-services/issues/
- Sentry Releases: https://sentry.io/organizations/chiussi-services/releases/
- Sentry Docs: https://docs.sentry.io/
```

---

**Document Version:** 1.0 | **Last Updated:** 2026-02-05 | **Maintained by:** DevOps Team
