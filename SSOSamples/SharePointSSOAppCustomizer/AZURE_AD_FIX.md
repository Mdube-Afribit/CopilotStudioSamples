# Azure AD Fix for AADSTS650053 Error

## Error Message
```
AADSTS650053: The application 'Agent 1 (Microsoft Copilot Studio)' asked for scope 'user_impersonation' 
that doesn't exist on the resource '8578e004-a5c6-46e7-913e-12f58912df43'.
```

## Root Cause
The app is requesting the Power Platform API but doesn't have the proper API permission configured in Azure AD.

## Fix Steps

### 1. Go to Azure AD App Registration
1. Open [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** → **App registrations**
3. Find your app: **Agent 1 (Microsoft Copilot Studio)**
   - Client ID: `fa27de16-0e80-4bcb-9d49-b7fb52fc7d55` 

### 2. Add Power Platform API Permission
1. Click on **API permissions** in the left menu
2. Click **+ Add a permission**
3. Select **APIs my organization uses** tab
4. Search for one of these:
   - "Power Platform"
   - "Dynamics CRM"
   - "Common Data Service"
5. Select **Dynamics CRM** (this is the Power Platform API)
6. Choose **Delegated permissions**
7. Check the box for: ☑️ `user_impersonation`
8. Click **Add permissions**

### 3. Grant Admin Consent
1. Back in the **API permissions** page
2. Click **Grant admin consent for [Your Tenant Name]**
3. Click **Yes** to confirm
4. Verify the status shows ✅ **Granted for [Your Tenant]**

### 4. Verify Final Permissions
Your app should have these permissions (minimum):

| API | Permission | Type | Status |
|-----|------------|------|--------|
| Microsoft Graph | User.Read | Delegated | ✅ Granted |
| Dynamics CRM | user_impersonation | Delegated | ✅ Granted |

### 5. Clear Browser Cache
In your browser console (F12), run:
```javascript
localStorage.clear();
sessionStorage.clear();
window.location.reload();
```

Or: DevTools → Application → Storage → "Clear site data"

### 6. Restart the Dev Server
```bash
cd "/Users/marshall/Documents/Sample copilot/CopilotStudioSamples/SSOSamples/SharePointSSOAppCustomizer"
npm run serve
```

### 7. Test Again
1. Open the SharePoint page with the webpart
2. Click the chat bubble
3. Sign in when prompted
4. Chat should now connect successfully

## Alternative Scopes to Try
If the above doesn't work, you can try these alternative scopes in `acquireToken.ts`:

```typescript
// Option 1 (Current)
const scopes = ['https://api.powerplatform.com/.default'];

// Option 2
const scopes = ['https://service.powerapps.com/.default'];

// Option 3 (if you know your specific environment)
const scopes = ['https://org123456.crm.dynamics.com/.default'];
```

## Notes
- The resource ID `8578e004-a5c6-46e7-913e-12f58912df43` is the standard Power Platform API service principal
- Using `.default` scope means "use all permissions configured in Azure AD"
- Admin consent is REQUIRED for Power Platform API access
