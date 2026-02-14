export interface ISidebarAgentApplicationCustomizerProperties {
  appClientId: string;
  tenantId: string;
  environmentId?: string;
  agentIdentifier?: string;
  directConnectUrl?: string;
  showTyping?: boolean;
  headerBackgroundColor?: string;
  agentTitle?: string;
}

export interface ISidebarAgentState {
  isPanelOpen: boolean;
  isSettingsOpen: boolean;
  currentUserLogin?: string;
  chatKey: number;
  activeProperties: ISidebarAgentApplicationCustomizerProperties;
}

export interface ISidePanelProps {
  isOpen: boolean;
  properties: ISidebarAgentApplicationCustomizerProperties;
  currentUserLogin?: string;
  baseUrl?: string;
  onDismiss: () => void;
  onNewConversation: () => void;
  onOpenSettings: () => void;
  chatKey: number;
}