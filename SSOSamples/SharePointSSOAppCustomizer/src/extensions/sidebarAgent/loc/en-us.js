define([], function() {
  return {
    "Title": "Copilot Studio Agent",
    "PropertyPaneDescription": "Configure Copilot Studio Agent settings for this extension.",
    "AuthenticationGroupName": "Authentication Settings",
    "AgentConnectionGroupName": "Agent Connection",
    "AppearanceGroupName": "Appearance",
    "AppClientIdFieldLabel": "App Client ID",
    "AppClientIdFieldDescription": "Azure AD app registration client ID",
    "TenantIdFieldLabel": "Tenant ID",
    "TenantIdFieldDescription": "Azure AD/Entra tenant ID",
    "DirectConnectUrlFieldLabel": "Direct Connect URL",
    "DirectConnectUrlFieldDescription": "Direct connection URL from Copilot Studio (e.g., 'https://xxxx.environment.api.powerplatform.com/...'). Alternative to Environment ID + Agent Identifier.",
    "EnvironmentIdFieldLabel": "Environment ID",
    "EnvironmentIdFieldDescription": "Copilot Studio environment ID (required if not using Direct Connect URL)",
    "AgentIdentifierFieldLabel": "Agent Identifier",
    "AgentIdentifierFieldDescription": "Agent's schema name from Copilot Studio (required if not using Direct Connect URL)",
    "ShowTypingFieldLabel": "Show Typing Indicators",
    "ShowTypingOnText": "Show",
    "ShowTypingOffText": "Hide",
    "HeaderBackgroundColorFieldLabel": "Header Background Color",
    "HeaderBackgroundColorFieldDescription": "CSS color value for the header bar (e.g., 'white', '#0078d4')",
    "AgentTitleFieldLabel": "Agent Title",
    "AgentTitleFieldDescription": "Display title shown in the agent panel header"
  }
});