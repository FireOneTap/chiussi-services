# 📅 MONITORING SETUP - ACTION PLAN

**Date:** 2026-02-05  
**Estimated Time:** 20 minutes  
**Complexity:** Easy (follow guides provided)  
**Status:** Ready to execute

---

## 🎯 Objectives

After completing this plan:
- ✅ Sentry alerts fully configured
- ✅ UptimeRobot monitoring active
- ✅ Slack notifications working
- ✅ Team alerted on issues
- ✅ Status page available (optional)

---

## ⏱️ Timeline

```
Total Time: 25 minutes
├─ Sentry Alerts Setup: 15 minutes
│  ├─ Create alert rules: 8 minutes
│  ├─ Slack integration: 4 minutes
│  └─ Test alerts: 3 minutes
└─ UptimeRobot Setup: 10 minutes
   ├─ Create monitors: 5 minutes
   ├─ Slack integration: 3 minutes
   └─ Test notifications: 2 minutes
```

---

## 📋 PART 1: SENTRY ALERTS (15 minutes)

### Prerequisites ✅
- Sentry account created: YES (https://sentry.io/organizations/chiussi-services)
- Project configured: YES (chiussi-services/production)
- Slack workspace: Required (have Slack ready)

### Step 1: Access Sentry Alerts (2 min)

1. Login to Sentry: https://sentry.io/organizations/chiussi-services
2. Navigate to: Settings → Alerts (left sidebar)
3. Click "Create Alert"

### Step 2: Create Alert Rule #1 - High Priority Errors (3 min)

**Configuration:**
```
Name: "🔴 Critical: Unhandled Exceptions"
Condition:
  - Level equals "error"
  - AND Level equals "fatal"
  - AND Environment equals "production"
  
Action: Send notification to Slack
  - Channel: #engineering-alerts
  - Mention: @oncall
  - Color: Red
```

### Step 3: Create Alert Rule #2 - Release Health (2 min)

**Configuration:**
```
Name: "⚠️ Release Health Degradation"
Condition:
  - Release Health Status is "Regressed"
  - AND Environment equals "production"
  
Action: Send notification to Slack
  - Channel: #engineering-alerts
  - Mention: @channel
  - Color: Orange
```

### Step 4: Create Alert Rule #3 - Performance Issues (2 min)

**Configuration:**
```
Name: "📊 Performance Degradation"
Condition:
  - Transaction Duration greater than "2.0s"
  - AND Environment equals "production"
  
Action: Send notification to Slack
  - Channel: #engineering-alerts
  - Color: Yellow
```

### Step 5: Create Alert Rule #4 - Custom Business Events (3 min)

**Configuration:**
```
Name: "🎯 Custom Business Alert"
Condition:
  - Tags match: event_type equals "business_metric"
  - AND Tags match: severity equals "high"
  
Action: Send notification to Slack
  - Channel: #business-alerts
  - Color: Purple
```

### Step 6: Create Alert Rule #5 - Dead Letter Queue (2 min)

**Configuration:**
```
Name: "❌ Dead Letter Queue Detected"
Condition:
  - Message contains "dead_letter" OR "failed_processing"
  - AND Environment equals "production"
  
Action: Send notification to Slack
  - Channel: #engineering-alerts
  - Mention: @oncall
  - Color: Red
```

### Step 7: Test Sentry Alerts (1 min)

**Generate Test Error:**
```bash
# In your app, call:
Sentry.captureException(
  new Error("🚀 Sentry Alert Test - Delete This Message"),
  { tags: { severity: "high", event_type: "test" } }
)

# Or via curl:
curl -X POST https://o<org>.ingest.sentry.io/api/<project>/store/ \
  -H "Content-Type: application/json" \
  -d '{"message":"Test alert","level":"error"}'
```

**Verify:**
- ✅ Message appears in Sentry dashboard
- ✅ Slack notification received in #engineering-alerts
- ✅ Alert can be dismissed

---

## 📋 PART 2: UPTIMEROBOT SETUP (10 minutes)

### Prerequisites ✅
- UptimeRobot account: Required (sign up free at https://uptimerobot.com)
- Slack workspace: Required (for notifications)

### Step 1: Login & Dashboard (1 min)

1. Go to: https://uptimerobot.com
2. Login with your account
3. Click "Add New Monitor" button

### Step 2: Create Monitor #1 - Homepage (3 min)

**Configuration:**
```
Monitor Type: HTTP(s)
URL: https://chiussi-services.vercel.app/
Friendly Name: "Chiussi Services - Homepage"
Check Interval: Every 5 minutes
Enable Alerts: YES
```

**Alert Notifications:**
```
Type: Slack
Webhook: [Your Slack Webhook URL]
Message: "🚨 Chiussi Services homepage is DOWN! Check: https://uptimerobot.com"
```

### Step 3: Create Monitor #2 - API Endpoint (3 min)

**Configuration:**
```
Monitor Type: HTTP(s)
URL: https://chiussi-services.vercel.app/api/tickets
Friendly Name: "Chiussi Services - API"
Check Interval: Every 5 minutes
Expected Status Code: 200
Enable Alerts: YES
```

**Alert Notifications:**
```
Type: Slack
Webhook: [Your Slack Webhook URL]
Message: "🚨 Chiussi Services API is DOWN! Check: https://uptimerobot.com"
```

### Step 4: Configure Slack Integration (2 min)

**For Each Monitor:**
1. Click "Alert Contacts"
2. Add new contact: Slack
3. Get webhook from your Slack workspace
4. Test webhook with "Send Test Alert"

### Step 5: Setup Status Page (Optional - 2 min)

**Public Status Page:**
1. Go to: Settings → Status Pages
2. Click "Create Status Page"
3. Configuration:
   ```
   Name: "Chiussi Services Status"
   Domain: status.chiussi-services.com (optional)
   Monitors to include: Homepage + API
   Public: YES
   ```

---

## ✅ VERIFICATION CHECKLIST

### Sentry Alerts
- [ ] 5 alert rules created
- [ ] Slack channel configured
- [ ] @oncall mentioned in critical alerts
- [ ] Test error created and received in Slack
- [ ] Alerts can be dismissed from Sentry

### UptimeRobot
- [ ] 2 monitors created (Homepage + API)
- [ ] Check interval: 5 minutes
- [ ] Slack notifications configured
- [ ] Status page created (optional)
- [ ] Test downtime alert sent

### Integration
- [ ] Sentry dashboard shows monitoring data
- [ ] UptimeRobot shows 100% uptime (green)
- [ ] Team receives alerts as expected
- [ ] No duplicate notifications

---

## 📊 EXPECTED RESULTS AFTER SETUP

```
✅ Error Tracking
   - Sentry captures all exceptions
   - Alerts triggered within 1 minute
   - Slack notifications in #engineering-alerts

✅ Uptime Monitoring
   - 2 endpoints monitored every 5 minutes
   - 100% uptime expected (green status)
   - Downtime alerts immediate
   - Status page available (optional)

✅ Team Notifications
   - Critical errors: @oncall pinged
   - Release health: @channel pinged
   - Performance issues: Alert sent
   - Downtime: Immediate notification
```

---

## 🚨 INCIDENT RESPONSE WORKFLOW

After monitoring is setup:

**When Error Alert Received:**
1. Check Sentry dashboard
2. Review error details
3. Check if production is down
4. Follow: [RUNBOOK.md](./RUNBOOK.md)

**When Downtime Alert Received:**
1. Check UptimeRobot status page
2. Manually verify endpoint: `curl https://chiussi-services.vercel.app/`
3. Check Vercel deployment status
4. If down: Follow [RUNBOOK.md](./RUNBOOK.md)

---

## 📚 REFERENCE DOCUMENTS

For detailed setup instructions, see:

1. **SENTRY-ALERTS-SETUP.md** (350+ lines)
   - Detailed alert rule examples
   - Advanced configuration options
   - Custom metrics and tags
   - Integration examples

2. **UPTIME-MONITORING-SETUP.md** (400+ lines)
   - Step-by-step with screenshots
   - Multiple notification channels
   - Status page customization
   - API integration examples

3. **RUNBOOK.md** (380+ lines)
   - Incident response procedures
   - Troubleshooting guide
   - Escalation paths
   - Post-incident review template

---

## 🎯 SUCCESS CRITERIA

When complete, verify:

✅ Sentry alerts working (test error received)  
✅ UptimeRobot monitors active (green status)  
✅ Slack notifications flowing (at least one test)  
✅ Team can see alerts (check Slack)  
✅ Status page accessible (if created)

---

## ⏭️ AFTER MONITORING SETUP

### Production Ready Checklist
```
✅ Code merged to main
✅ Vercel deployment successful
✅ Tests passing (82/82)
✅ Security verified (0 vulns)
✅ Sentry alerts configured ← YOU ARE HERE
✅ UptimeRobot monitoring active ← YOU ARE HERE
✅ Documentation complete
✅ Team briefed
```

### Next Review
- Date: 2026-02-12 (1 week)
- Check: Alert accuracy, false positives
- Action: Tune alert thresholds if needed

---

## 💡 TIPS FOR SUCCESS

1. **Test Alerts:** Don't skip the test steps - verify everything works before relying on it
2. **Channel Strategy:** Use different Slack channels for different alert severities
3. **Mention Strategy:** Reserve @oncall for critical alerts only
4. **Monitor Frequency:** 5 minutes is good balance between detection speed and false positives
5. **Status Page:** Useful for transparency - share with stakeholders

---

## 🆘 TROUBLESHOOTING

**Alert not received in Slack?**
1. Check Slack webhook URL is correct
2. Verify Slack app has permission to post
3. Test with "Send Test Alert" button
4. Check Slack app logs

**Monitor shows red but site is up?**
1. Check expected status code (should be 200)
2. Verify SSL certificate is valid
3. Check for IP blocking or geo-restrictions
4. Try manual curl: `curl -I https://chiussi-services.vercel.app/`

**Too many false alerts?**
1. Increase check interval (from 5 to 10 minutes)
2. Add retry logic (fail after 2 consecutive failures)
3. Adjust Sentry alert thresholds
4. Exclude known error types (tests, staging)

---

## 📞 CONTACT & ESCALATION

**Sentry Alerts Escalation:**
- Level 1: Log in Sentry
- Level 2: Check UptimeRobot
- Level 3: Manual monitoring
- Level 4: Page on-call engineer

**UptimeRobot Alerts Escalation:**
- Level 1: Check Vercel dashboard
- Level 2: SSH to server (if applicable)
- Level 3: Check network connectivity
- Level 4: Page infrastructure team

---

## ✅ SIGN-OFF

Date Completed: ___________________  
Completed By: ___________________  
Verified By: ___________________  

---

**Generated:** 2026-02-05  
**Next Review:** 2026-02-12  
**Status:** Ready for Execution

