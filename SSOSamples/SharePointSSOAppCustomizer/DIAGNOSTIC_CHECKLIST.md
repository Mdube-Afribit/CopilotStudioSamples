# Azure AD & Authentication Diagnostic Checklist

## 🔍 Current Error
**"Unable to acquire authentication token"** when adding a new agent in webpart settings.

## ✅ Azure AD App Registration Checklist

### 1. Basic App Settings
- [ ] **App Type**: Single Page Application (SPA) ✓
- [ ] **Client ID**: `4250092e-84d6-479f-b5f9-b8cab23f4b04` ✓

### 2. Authentication Settings
**Redirect URIs must include:**
- [ ] `https://afribit.sharepoint.com/sites/AFRIBITCentral`
- [ ] `https://localhost:4321` (for development)
- [ ] **Access tokens** checkbox: ✅ CHECKED
- [ ] **ID tokens** checkbox: ✅ CHECKED

### 3. API Permissions (CRITICAL)
**Required permissions:**
- [ ] **Microsoft Graph**
  - [ ] `User.Read` (Delegated) ✅ Admin Consent
- [ ] **PowerApps Service** 
  - [ ] `User` (Delegated) ✅ Admin Consent
- [ ] **Power Platform API** (if available)
  - [ ] `user_impersonation` (Delegated) ✅ Admin Consent

### 4. Advanced Settings
- [ ] **Allow public client flows**: NO (should be OFF for SPA)
- [ ] **Treat application as a public client**: NO

## 🧪 Quick Test Steps

### Step 1: Check Browser Console
1. Open Developer Tools (F12)
2. Go to Console tab
3. Click the chat bubble
4. Look for these specific error messages:
   - `MSAL Config:`
   - `acquireTokenSilent failed:`
   - `acquireTokenPopup failed:`

### Step 2: Check Network Tab
1. Open Developer Tools → Network tab
2. Click the chat bubble
3. Look for failed requests to:
   - `login.microsoftonline.com`
   - `api.powerplatform.com`

### Step 3: Test Direct Authentication
Open browser console and run:
```javascript
// Test if you can reach the authority
fetch('https://login.microsoftonline.com/a91d1fa7-91fa-4c36-8626-613c01ea71ee/v2.0/.well-known/openid-configuration')
.then(r => r.json())
.then(d => console.log('Authority reachable:', d))
.catch(e => console.error('Authority error:', e))
```

## 🚨 Common Issues & Fixes

### Issue 1: Wrong Redirect URI
**Symptom**: `invalid_request` or `redirect_uri_mismatch`
**Fix**: Add exact SharePoint URL to Azure AD redirect URIs

### Issue 2: Missing API Permissions
**Symptom**: `insufficient_privileges` or `consent_required`
**Fix**: Add PowerApps/Power Platform permissions + Admin consent

### Issue 3: Wrong App Type
**Symptom**: `unsupported_response_type`
**Fix**: Ensure app is registered as "Single Page Application"

### Issue 4: Blocked Popups
**Symptom**: `popup_window_error` or `user_cancelled`
**Fix**: Allow popups for SharePoint site

### Issue 5: Wrong Environment/Agent ID
**Symptom**: Connection works but chat doesn't load
**Fix**: Verify agent is in environment `362139ad-5ee1-ebe3-839c-f6a8692d1d53`

## 📋 Next Steps

1. **Go through Azure AD checklist above** ☑️
2. **Run browser console tests** 🧪
3. **Check browser console errors** 📝
4. **Reply with specific error messages** 💬

---

*Generated for Afribit SharePoint SSO Chat Webpart*
