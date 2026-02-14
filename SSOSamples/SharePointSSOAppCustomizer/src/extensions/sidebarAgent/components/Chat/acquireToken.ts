import { PublicClientApplication, BrowserAuthError } from '@azure/msal-browser';

export interface IAuthSettings {
  appClientId: string;
  tenantId: string;
  currentUserLogin?: string;
  redirectUri?: string;  
}

// Global state to prevent concurrent auth attempts and share results
let authPromise: Promise<string | undefined> | undefined = undefined;

export async function acquireToken(settings: IAuthSettings): Promise<string | undefined> {
  console.log('=== ACQUIRE TOKEN START ===');
  
  // If auth is already in progress, wait for it to complete and return the same result
  if (authPromise) {
    console.log('⚠️ Authentication already in progress, waiting for result...');
    return authPromise;
  }
  
  console.log('Settings received:', {
    appClientId: settings?.appClientId,
    tenantId: settings?.tenantId,
    currentUserLogin: settings?.currentUserLogin,
    redirectUri: settings?.redirectUri
  });

  if (!settings?.appClientId || !settings?.tenantId) {
    console.error('Missing appClientId or tenantId');
    return undefined;
  }

  // Create and store the auth promise so concurrent calls can wait for it
  const currentPromise = doAcquireToken(settings);
  authPromise = currentPromise;
  
  try {
    const result = await currentPromise;
    return result;
  } finally {
    // Clear the promise so next call can start fresh (only if it's still our promise)
    if (authPromise === currentPromise) {
      authPromise = undefined;
    }
  }
}

async function doAcquireToken(settings: IAuthSettings): Promise<string | undefined> {
  try {
    const redirectUri = settings.redirectUri || window.location.origin;
    console.log('Using redirect URI:', redirectUri);
    console.log('Authority:', `https://login.microsoftonline.com/${settings.tenantId}`);

  const msalConfig = {
    auth: {
      clientId: settings.appClientId,
      authority: `https://login.microsoftonline.com/${settings.tenantId}`,
      redirectUri: redirectUri
    },
    cache: {
      cacheLocation: "localStorage" as const
    }
  };
  
  console.log('MSAL Config:', JSON.stringify(msalConfig, null, 2));

  const msalInstance = new PublicClientApplication(msalConfig);

  await msalInstance.initialize();
  console.log('MSAL initialized');
  
  // Use the CDS/Dataverse scope which is commonly required for Copilot Studio
  const scopes = ['https://api.powerplatform.com/.default'];
  // Alternative scopes to try if this fails:
  // ['https://service.powerapps.com/.default']
  // ['https://globaldisco.crm.dynamics.com/.default']  
  console.log('Requesting scopes:', scopes);

  try {
    const accounts = await msalInstance.getAllAccounts();
    console.log('All accounts found:', accounts.length);
    accounts.forEach((acc, idx) => {
      console.log(`Account ${idx}:`, {
        username: acc.username,
        homeAccountId: acc.homeAccountId,
        tenantId: acc.tenantId,
        environment: acc.environment
      });
    });

    let userAccount = null;

    if (!accounts || accounts.length === 0) {
      console.log("No users are signed in - will need interactive login");
    } else if (accounts.length > 1 && settings.currentUserLogin) {
      console.log('Multiple accounts found, looking for:', settings.currentUserLogin);
      userAccount = accounts.find(account => 
        account.username.toLowerCase() === settings.currentUserLogin?.toLowerCase()
      ) || null;
      console.log('Matched account:', userAccount?.username || 'none');
    } else {
      userAccount = accounts[0];
      console.log('Using first account:', userAccount.username);
    }

    // Try silent token acquisition first (may fail in SharePoint iframe)
    if (userAccount) {
      const accessTokenRequest = {
        scopes: scopes,
        account: userAccount
      };
      console.log('Attempting acquireTokenSilent for:', userAccount.username);

      try {
        const response = await msalInstance.acquireTokenSilent(accessTokenRequest);
        console.log('=== TOKEN ACQUIRED (Silent) ===');
        console.log('Token expires:', response.expiresOn);
        console.log('Token scopes:', response.scopes);
        console.log('Token (first 50 chars):', response.accessToken.substring(0, 50) + '...');
        return response.accessToken; 
      } catch (errorInternal) {
        console.log('acquireTokenSilent failed:', errorInternal);
        // Check if it's a timeout error (common in SharePoint iframes)
        if (errorInternal instanceof BrowserAuthError && 
            (errorInternal.errorCode === 'monitor_window_timeout' || 
             errorInternal.errorCode === 'popup_window_error')) {
          console.log('Silent auth blocked by iframe - will use popup');
        }
        // Fall through to try popup
      }
    }

    // Skip ssoSilent in SharePoint context - it will also fail due to iframe restrictions
    // Go directly to popup which works in SharePoint
    console.log('Using popup authentication (required for SharePoint)...');
    
    const popupRequest = {
      scopes: scopes,
      loginHint: settings.currentUserLogin
    };

    try {
      const response = await msalInstance.acquireTokenPopup(popupRequest);
      console.log('=== TOKEN ACQUIRED (Popup) ===');
      console.log('Token expires:', response.expiresOn);
      console.log('Token scopes:', response.scopes);
      console.log('Account:', response.account?.username);
      console.log('Token (first 50 chars):', response.accessToken.substring(0, 50) + '...');
      return response.accessToken;
    } catch (popupError) {
      console.error('acquireTokenPopup failed:', popupError);
      
      // Check specific error types
      if (popupError instanceof BrowserAuthError) {
        if (popupError.errorCode === 'popup_window_error') {
          console.log('❌ Popup was blocked - please allow popups for this site');
          alert('⚠️ Authentication Required\n\nPlease allow pop-ups for this site to sign in.\n\n1. Click the popup blocker icon in your browser address bar\n2. Select "Always allow pop-ups"\n3. Click the chat bubble again to retry');
        } else if (popupError.errorCode === 'user_cancelled') {
          console.log('❌ User cancelled authentication - popup was closed');
          alert('⚠️ Authentication Cancelled\n\nYou closed the sign-in window before completing authentication.\n\nPlease click the chat bubble again and complete the Microsoft sign-in process.');
        } else if (popupError.errorCode === 'consent_required') {
          console.log('❌ Admin consent required for API permissions');
          alert('⚠️ Permission Required\n\nAdmin consent is needed for Power Platform API access.\n\nPlease contact your administrator to grant consent for the required permissions.');
        } else if (popupError.errorCode === 'invalid_request') {
          console.log('❌ Invalid request - check redirect URI configuration');
          alert('⚠️ Configuration Error\n\nInvalid authentication request. Please check:\n\n1. App registration redirect URIs\n2. App is configured as Single Page Application\n3. Client ID is correct');
        } else {
          console.log('❌ Unknown authentication error:', popupError.errorCode, popupError.errorMessage);
          alert(`⚠️ Authentication Error\n\n${popupError.errorCode}: ${popupError.errorMessage}\n\nPlease check Azure AD app registration settings.`);
        }
      } else {
        console.log('❌ Non-MSAL authentication error:', popupError);
        alert('⚠️ Authentication Failed\n\nUnexpected error occurred. Please check browser console for details.');
      }
      
      return undefined;
    }
  } catch (e) {
    console.error('=== TOKEN ACQUISITION ERROR ===');
    console.error('Error:', e);
    return undefined;
  }
  } catch (outerError) {
    console.error('=== FATAL TOKEN ACQUISITION ERROR ===');
    console.error('Error:', outerError);
    return undefined;
  }
}
