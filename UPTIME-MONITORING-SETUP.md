/**
 * UPTIME-MONITORING-SETUP.md
 * 
 * Uptime Monitoring Setup Guide - Chiussi Services
 * Version: 1.0 | Date: 2026-02-05
 * 
 * Setup continuous uptime monitoring for production application
 * using UptimeRobot, Statuspage, or similar services.
 */

# Uptime Monitoring Setup Guide

## Quick Setup (10 minutes)

### Option A: UptimeRobot (Recommended - Free Tier Available)

**Why UptimeRobot?**
- Free tier: 50 monitors
- 5-minute check intervals
- Slack integration
- Cheap paid plans ($9/mo)
- Simple setup

### Step 1: Create UptimeRobot Account

```
1. Go to: https://uptimerobot.com/
2. Sign up (free account)
3. Verify email
4. Login to dashboard
```

### Step 2: Create HTTP Monitor

```
URL: https://uptimerobot.com/dashboard

1. Click: "+ Add Monitor"
2. Monitor Type: HTTP(s)
3. URL: https://chiussi-services.vercel.app/
4. Friendly Name: "Chiussi Services - Homepage"
5. Check Interval: 5 minutes (for free tier)
6. Notification: 
   - Enabled ✅
   - Notify when: All events
7. Save monitor

Expected:
✅ Monitor created
✅ Shows green UP indicator
✅ First check in 5 minutes
```

### Step 3: Setup Slack Notifications

```
1. In UptimeRobot dashboard, go to: Integrations
2. Find: Slack
3. Click: Connect to Slack
4. Authorize UptimeRobot in your Slack workspace
5. Select channel: #incidents
6. Back in UptimeRobot:
   - Monitor → Edit
   - Scroll to: Notification
   - Choose: Slack (you configured)
   - Save
```

### Step 4: Monitor API Health

```
Create second monitor for API:

1. "+ Add Monitor"
2. Monitor Type: HTTP(s)
3. URL: https://chiussi-services.vercel.app/api/csrf-token
4. HTTP Method: GET
5. Check Interval: 5 minutes
6. Notification: Slack #incidents
7. Save monitor

This catches API failures that homepage might not reveal.
```

### Step 5: Verify Setup

```
You should have:
✅ Monitor 1: Homepage (GET /)
✅ Monitor 2: API endpoint (GET /api/csrf-token)
✅ Both showing "UP" (green)
✅ Slack integration active
✅ Notify on: Up, Down, Change
```

**Test it:**
```bash
# Generate test downtime by temporarily blocking traffic
# (or in production, wait for actual downtime)
# 
# When down:
# 1. UptimeRobot detects DOWN
# 2. Slack notification sent to #incidents
# 3. Status page updates
```

---

## Advanced Configuration

### Monitor Critical Paths

**Recommended monitors to setup:**

| Path | URL | Interval | Why |
|------|-----|----------|-----|
| Homepage | `/` | 5 min | Public facing |
| API | `/api/csrf-token` | 5 min | Backend health |
| Dashboard | `/dashboard` | 10 min | Auth required |
| Login | `/login` | 10 min | Auth flow |

### Setup Each Monitor

```bash
for endpoint in "/" "/api/csrf-token" "/login" "/dashboard"; do
  # In UptimeRobot:
  # 1. + Add Monitor
  # 2. Type: HTTP(s)
  # 3. URL: https://chiussi-services.vercel.app${endpoint}
  # 4. Interval: 5-10 minutes
  # 5. Notifications: Slack #incidents
  # 6. Save
done
```

### Advanced Checks

```
Setup keyword checks to detect issues:

For "/"  monitor:
- Keyword check: "Chiussi" (company name)
- If page doesn't contain "Chiussi", mark as DOWN
- Catches 200 OK but broken page responses

For "/api/csrf-token":
- Keyword check: "token" (API response should have token)
- JSON validation (if available in premium)
- Catches broken API responses
```

### Performance Threshold Monitoring

```
Setup performance monitoring:

1. Monitor → Edit
2. Enable: Response time check
3. Set alert if response time > 5000ms
4. This catches slowdowns before complete downtime
```

---

## Status Page (Public Transparency)

### Option 1: UptimeRobot Status Page (Free)

```
1. Dashboard → Status Page
2. Click: Create Status Page
3. Page URL: chiussi-services.uptimerobot.com
4. Subdomain: chiussi (you can customize)
5. Add monitors:
   - Check: Homepage
   - Check: API
6. Customize:
   - Company name: Chiussi Services
   - Logo: (upload company logo)
   - Colors: Match brand
7. Publish

Result:
- Public page: https://chiussi-services.uptimerobot.com
- Show to users when issues occur
- Real-time status updates
```

### Option 2: Statuspage.io (Professional)

```
If you want more professional status page:

1. Go to: https://www.statuspage.io/
2. Sign up (free tier available)
3. Create status page
4. Add incidents manually or via API
5. Public URL: status.chiussi-services.io
6. Show users during outages

Cost: $29/month for most features
```

---

## Monitoring Dashboard

### Daily Check (1 minute)

```bash
# Every morning, check:

1. Go to: https://uptimerobot.com/dashboard
2. Look for:
   ✅ All monitors showing GREEN (UP)
   ✅ No recent DOWN events
   ✅ Average response time < 2s

3. Check Slack #incidents:
   ✅ No downtime alerts overnight
```

### Weekly Review (5 minutes)

```bash
# Every Monday, review:

1. UptimeRobot dashboard:
   - Uptime %: Should be > 99%
   - Incidents: Review any downtime
   - Response times: Any slowdowns?

2. Check reports:
   - UptimeRobot: Dashboard → Reports
   - Look for patterns in downtime
   - Are failures always at same time?

3. Action items:
   - If uptime < 99%: Investigate root cause
   - If slowdowns: Check performance
   - If pattern: Schedule fix
```

---

## Alert Responses

### When Uptime Monitor Alerts

**Immediate action (1 min):**
```
1. Receive Slack notification in #incidents
2. Click link to view details
3. Manually test the URL:
   curl -I https://chiussi-services.vercel.app/
   
4. Determine if it's real:
   ✅ Really down → Follow P0 incident procedures
   ✅ False positive → Dismiss alert
   ✅ Intermittent → Increase monitoring frequency
```

**Real downtime response (5 min):**
```
1. Go to incident response (see RUNBOOK.md)
2. Check Vercel dashboard for deployment issues
3. Check Sentry for errors
4. Implement fix or rollback
5. Monitor until resolved
```

---

## Integration with Existing Alerts

### Alert Flow Diagram

```
UptimeRobot Down
    ↓
Slack #incidents notified
    ↓
On-call engineer sees alert
    ↓
    → Checks Vercel deployment status
    → Checks Sentry error rate
    → Checks database status
    ↓
    → Fix deployed OR rollback executed
    ↓
UptimeRobot monitors recovery
    ↓
Slack notified when UP
    ↓
Incident complete
```

### Deduplication

To avoid duplicate alerts:
```
1. Setup rate limiting in Slack:
   - One alert every 5 minutes max
   
2. Configure escalation:
   - First alert: Slack only
   - After 10 min: Page on-call engineer
   - After 15 min: Page team lead
```

---

## Common Issues & Fixes

### False Positives (Uptime monitor says DOWN but actually UP)

**Cause:** Network issues, rate limiting, temporary delays

**Fix:**
```
1. UptimeRobot → Monitor → Edit
2. Increase: "Check Interval" to 2 minutes
3. Add: Keyword check for expected response
4. Setup: Multiple monitoring locations
   - Use: "Advanced Settings"
   - Enable: "Check from multiple locations"
   - Uses more data but more reliable
```

### Monitor Not Sending Alerts

**Cause:** Slack integration broken or notification disabled

**Fix:**
```
1. Check Slack integration:
   - Dashboard → Integrations
   - Re-connect Slack
   
2. Check monitor notification:
   - Monitor → Edit
   - Scroll to: "Notify When"
   - Should be: All events
   
3. Test notification:
   - Monitor → Edit
   - Click: "Test Alert"
   - Should see Slack message
```

### Response Time Spikes

**Cause:** Database slow, network latency, or traffic surge

**Fix:**
```
1. Check Vercel analytics:
   - https://vercel.com/dashboard
   - View response time graph
   
2. Check Sentry performance:
   - https://sentry.io/
   - Look for slow transactions
   
3. If sustained:
   - Check database performance
   - Check for memory issues
   - Consider scaling
```

---

## Scaling Monitoring

As your uptime SLA requirements grow:

```
Tier 1: Basic (Current)
- UptimeRobot free tier
- 2 monitors (homepage + API)
- 5 minute intervals
- Slack alerts only
- SLA: 95% uptime

Tier 2: Professional ($15/month)
- UptimeRobot pro
- 10+ monitors
- 1 minute intervals
- Multiple locations
- Slack + Email alerts
- SLA: 98% uptime

Tier 3: Enterprise ($100+/month)
- Dedicated monitoring service
- Sub-second checks
- Phone/PagerDuty alerts
- Status page
- Custom dashboards
- SLA: 99.9% uptime
```

---

## Reporting & Communication

### Weekly Status Report Template

```markdown
## Chiussi Services - Uptime Report
**Week of:** [Date]

### Uptime Statistics
- Overall uptime: 99.8%
- Total downtime: 29 minutes
- Incidents: 1
- MTTR (Mean Time To Recover): 5 minutes

### Incidents
- **2024-02-05, 14:30-14:35**: Database connection timeout
  - Impact: 5 minutes, ~10 users affected
  - Root cause: Database connection pool exhausted
  - Resolution: Restarted connection pool
  - Prevention: Implement connection pooling limits

### Performance Summary
- Average response time: 250ms
- Worst response time: 8450ms (database query)
- Best response time: 45ms

### Recommendations
- [ ] Optimize slow database query
- [ ] Add caching for expensive endpoints
- [ ] Increase monitoring frequency to 1 minute

### Next Week
- Implementing database optimization
- Adding Redis caching layer
```

---

## Useful Commands

```bash
# Check current uptime from command line
curl -o /dev/null -s -w "%{http_code}" https://chiussi-services.vercel.app/

# Test API health
curl -X GET https://chiussi-services.vercel.app/api/csrf-token -v

# Check response time
curl -o /dev/null -s -w "Total: %{time_total}s\n" \
  https://chiussi-services.vercel.app/

# Monitor with watch (every 10 seconds)
watch -n 10 'curl -o /dev/null -s -w "HTTP %{http_code} - Time: %{time_total}s\n" https://chiussi-services.vercel.app/'
```

---

## Monitoring Checklist

After setup:

```
✅ UptimeRobot account created
✅ Homepage monitor created
✅ API monitor created  
✅ Slack integration configured
✅ Test alert successful
✅ Status page created (optional)
✅ Team notified of alerts
✅ Daily check procedure documented
✅ Incident response procedure linked
```

---

## Summary

**Monitoring Status:** ✅ READY

| Component | Status | Check Interval |
|-----------|--------|-----------------|
| Homepage | ✅ Monitored | 5 min |
| API | ✅ Monitored | 5 min |
| Alerts | ✅ Slack #incidents | Instant |
| Status Page | ✅ Public facing | Real-time |
| SLA | ✅ 99% (5min interval) | - |

---

## Useful Links

```markdown
- UptimeRobot: https://uptimerobot.com/
- UptimeRobot Status: https://chiussi-services.uptimerobot.com/
- Statuspage.io: https://www.statuspage.io/
- Vercel Status: https://vercel.com/status
- Supabase Status: https://supabase.io/status
```

---

**Document Version:** 1.0 | **Last Updated:** 2026-02-05 | **Maintained by:** DevOps Team
