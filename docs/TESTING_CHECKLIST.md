# Testing Checklist - Graph Integration

## Pre-Test Verification ✅

- [x] Build succeeds without errors
- [x] All filesystems verified (server-01, server-02)
- [x] Mission filesystems match mission requirements
- [x] Dynamic content helpers implemented
- [x] Hardcoded references removed

---

## Test Mission Command Tests

### Test 1: Basic Command Execution
- [ ] Run `testmission n00b-01`
- [ ] Verify mission starts successfully
- [ ] Verify mission title displays correctly (should show "Server-01" not "server-01")
- [ ] Verify mission description uses display names

### Test 2: Mission Content Display
- [ ] Check mission panel shows correct title
- [ ] Check task descriptions use display names
- [ ] Check task objectives use display names
- [ ] Check task hints use display names

### Test 3: Email Content
- [ ] Run `testmission n00b-01`
- [ ] Run `mail read 1`
- [ ] Verify email subject uses display name (e.g., "Server-01" not "server-01")
- [ ] Verify email body uses display names (e.g., "Megacorp Industries" not "megacorp")
- [ ] Verify IP addresses/ranges are correct

### Test 4: Server Connection
- [ ] Run `testmission n00b-01`
- [ ] Purchase required tools (VPN, Password Cracker)
- [ ] Connect to VPN
- [ ] Decrypt credentials file
- [ ] Run `connect server-01`
- [ ] Verify connection succeeds
- [ ] Verify prompt shows "Server-01" (or correct display name)

### Test 5: File Reading (n00b-01)
- [ ] While connected to server-01
- [ ] Run `cat /home/admin/data/secret.txt`
- [ ] Verify file content displays
- [ ] Verify task-8 completes automatically

### Test 6: File Reading (n00b-02)
- [ ] Run `testmission n00b-02`
- [ ] Connect to server-02
- [ ] Run `cat /home/admin/database/customers/customer-data.txt`
- [ ] Verify task-6 completes automatically
- [ ] Run `cat /home/admin/database/reports/financial-report.txt`
- [ ] Verify task-7 completes automatically

### Test 7: Disconnect Task
- [ ] While connected to server-01 or server-02
- [ ] Run `disconnect`
- [ ] Verify disconnect task completes automatically
- [ ] Verify prompt returns to localhost

### Test 8: Mission Event Handlers
- [ ] Verify server connection tasks complete via graph queries
- [ ] Verify file reading tasks complete via graph queries
- [ ] Verify disconnect tasks complete via graph queries
- [ ] Verify no hardcoded host ID checks remain

---

## Expected Results

### Mission Titles
- ✅ Should show display names: "Server-01", "Server-02"
- ❌ Should NOT show IDs: "server-01", "server-02"

### Email Content
- ✅ Should show "Megacorp Industries" (display name)
- ✅ Should show "Server-01" (display name)
- ✅ Should show correct IP addresses from registry
- ✅ Should show correct IP ranges from organization

### Task Content
- ✅ All descriptions should use display names
- ✅ All objectives should use display names
- ✅ All hints should use display names
- ✅ IP ranges should come from organization entities

### Event Handlers
- ✅ Should work for any mission targeting server-01 or server-02
- ✅ Should NOT require code changes for new missions

---

## Known Issues / Notes

- Dynamic helpers are called at module load time (should be fine)
- Mission titles/descriptions are generated when module loads
- Test mission command should work correctly with dynamic content

---

## Files to Test

1. **Mission Modules**:
   - `02_01_first_hack.ts` - Uses dynamic helpers ✅
   - `02_02_data_extraction.ts` - Uses dynamic helpers ✅

2. **Event Handlers**:
   - `missionEventHandlers.ts` - Uses graph queries ✅

3. **Email Templates**:
   - `emailTemplates.ts` - Uses display name helpers ✅

4. **Filesystems**:
   - `server-01.ts` - Has correct file paths ✅
   - `server-02.ts` - Has correct file paths ✅

---

## Success Criteria

✅ All tests pass
✅ No hardcoded entity references in output
✅ Display names shown correctly throughout
✅ Test mission command works as expected
✅ Mission progression works correctly

