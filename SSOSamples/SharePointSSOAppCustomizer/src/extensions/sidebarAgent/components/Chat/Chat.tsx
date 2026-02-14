import * as React from 'react';
import { useEffect, useState, useRef } from 'react';
import { Components } from 'botframework-webchat';
import { FluentThemeProvider } from 'botframework-webchat-fluent-theme';
import { CopilotStudioWebChatConnection } from '@microsoft/agents-copilotstudio-client';
import { getOrCreateConnection, createFreshConnection } from './connectionManager';
import styles from './Chat.module.scss';

const { BasicWebChat, Composer } = Components;

// Afribit brand colors for WebChat
const afribitStyleOptions = {
  // Primary accent color
  accent: '#F27E4A',
  
  // Background colors
  backgroundColor: '#FFFFFF',
  
  // Bubble colors
  bubbleBackground: '#f0f2f5',
  bubbleTextColor: '#002746',
  bubbleFromUserBackground: '#F27E4A',
  bubbleFromUserTextColor: '#FFFFFF',
  bubbleBorderRadius: 18,
  
  // Send box
  sendBoxBackground: '#FFFFFF',
  sendBoxTextColor: '#002746',
  sendBoxPlaceholderColor: '#a0a5ab',
  sendBoxButtonColor: '#F27E4A',
  sendBoxButtonColorOnHover: '#e06a38',
  sendBoxBorderTop: 'solid 1px #e1e4e8',
  
  // Suggested actions
  suggestedActionBackground: 'transparent',
  suggestedActionBorderColor: '#F27E4A',
  suggestedActionTextColor: '#F27E4A',
  suggestedActionBorderRadius: 20,
  
  // Typography
  primaryFont: "'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', sans-serif",
  
  // Sizing
  rootHeight: '100%',
  rootWidth: '100%',
  
  // Avatar
  botAvatarBackgroundColor: '#F27E4A',
  userAvatarBackgroundColor: '#002746',
  
  // Hide upload button for cleaner look
  hideUploadButton: true,
};

export interface IChatProps {
  appClientId: string;
  tenantId: string;
  environmentId?: string;
  agentIdentifier?: string;
  directConnectUrl?: string;
  showTyping?: boolean;
  currentUserLogin?: string;
  baseUrl?: string;
  agentName?: string; // Optional agent name for header display
}

// Icon Components
const WarningIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-2h2v2h-2zm0-4V7h2v6h-2z"/>
  </svg>
);

const ErrorIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
  </svg>
);

const BotIcon: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className, style }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2M7.5 13A2.5 2.5 0 0 0 5 15.5 2.5 2.5 0 0 0 7.5 18a2.5 2.5 0 0 0 2.5-2.5A2.5 2.5 0 0 0 7.5 13m9 0a2.5 2.5 0 0 0-2.5 2.5 2.5 2.5 0 0 0 2.5 2.5 2.5 2.5 0 0 0 2.5-2.5 2.5 2.5 0 0 0-2.5-2.5z"/>
  </svg>
);

type ConnectionStatus = 'connecting' | 'connected' | 'error' | 'disconnected';

// Map connection status to CSS class names
const getStatusDotClass = (status: ConnectionStatus): string => {
  switch (status) {
    case 'connected':
      return styles.online;
    case 'connecting':
      return styles.connecting;
    case 'error':
    case 'disconnected':
      return styles.offline;
    default:
      return styles.offline;
  }
};

const Chat: React.FC<IChatProps> = ({
  appClientId,
  tenantId,
  environmentId,
  agentIdentifier,
  directConnectUrl,
  showTyping = true,
  currentUserLogin,
  baseUrl,
  agentName = 'BITA'
}) => {
  const [connection, setConnection] = useState<CopilotStudioWebChatConnection | null>(null);
  const [error, setError] = useState<string>();
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  
  // Ref to track if this specific component instance has initialized
  const hasInitializedRef = useRef(false);

  const isConfigured = appClientId && tenantId && (directConnectUrl || (environmentId && agentIdentifier));

  // Connection config object
  const connectionConfig = {
    appClientId,
    tenantId,
    environmentId,
    agentIdentifier,
    directConnectUrl,
    showTyping,
    currentUserLogin,
    baseUrl
  };

  // Use useEffect to initialize connection once
  useEffect(() => {
    // Skip if not configured or already initialized
    if (!isConfigured || hasInitializedRef.current) {
      return;
    }

    hasInitializedRef.current = true;

    const initializeConnection = async (): Promise<void> => {
      try {
        setConnectionStatus('connecting');
        setError(undefined);
        
        console.log('=== CHAT INITIALIZATION START ===');
        console.log('Using ConnectionManager to get/create connection');

        const newConnection = await getOrCreateConnection(connectionConfig);
        
        if (!newConnection) {
          console.error('=== CONNECTION IS NULL/UNDEFINED ===');
          setError('Unable to establish connection. Please try again.');
          setConnectionStatus('error');
          hasInitializedRef.current = false; // Allow retry
          return;
        }
        
        setConnection(newConnection);
        setConnectionStatus('connected');
        console.log('=== CONNECTION READY ===');
      } catch (e) {
        console.error('=== CHAT INITIALIZATION ERROR ===');
        console.error('Error details:', e);
        setError(e instanceof Error ? e.message : 'Unknown error initializing chat');
        setConnectionStatus('error');
        hasInitializedRef.current = false; // Allow retry
      }
    };

    initializeConnection().catch(console.error);
    
    // No cleanup - the connection manager handles the singleton
  }, [isConfigured]); // Only depend on isConfigured

  const handleRetry = async (): Promise<void> => {
    hasInitializedRef.current = false;
    setConnection(null);
    setError(undefined);
    setConnectionStatus('connecting');
    
    try {
      // Force create a fresh connection
      const newConnection = await createFreshConnection(connectionConfig);
      
      if (!newConnection) {
        setError('Unable to establish connection. Please try again.');
        setConnectionStatus('error');
        return;
      }
      
      setConnection(newConnection);
      setConnectionStatus('connected');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error initializing chat');
      setConnectionStatus('error');
    }
  };

  // Configuration Warning State
  if (!isConfigured) {
    return (
      <div className={styles.chatContainer}>
        <div className={styles.warningMessage}>
          <WarningIcon className={styles.warningIcon} />
          <h4 className={styles.warningTitle}>Configuration Required</h4>
          <p className={styles.warningText}>
            Please configure the agent settings: appClientId, tenantId, and either directConnectUrl 
            or both environmentId and agentIdentifier.
          </p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className={styles.chatContainer}>
        <div className={styles.errorMessage}>
          <ErrorIcon className={styles.errorIcon} />
          <h4 className={styles.errorTitle}>Connection Error</h4>
          <p className={styles.errorText}>{error}</p>
          <button className={styles.retryButton} onClick={handleRetry}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Loading/Connecting State
  if (!connection) {
    return (
      <div className={styles.chatContainer}>
        <div className={styles.connectingMessage}>
          <div className={styles.spinner} />
          <span className={styles.connectingText}>Connecting to {agentName}...</span>
          <span className={styles.connectingSubtext}>This may take a moment</span>
        </div>
      </div>
    );
  }

  // Connected - Show WebChat
  return (
    <div className={styles.chatContainer}>
      {/* Chat Header */}
      <div className={styles.chatHeader}>
        <div className={styles.headerInfo}>
          <h3 className={styles.headerTitle}>{agentName}</h3>
          <span className={styles.headerSubtitle}>AI-Powered Assistant</span>
        </div>
        {/* Status indicator moved here, below the title */}
        <div className={styles.statusBadge}>
          <span className={`${styles.statusDot} ${getStatusDotClass(connectionStatus)}`} />
          <span>{connectionStatus === 'connected' ? 'Online' : 'Connecting'}</span>
        </div>
      </div>
      
      {/* WebChat Container */}
      <div className={styles.webChatContainer}>
        <FluentThemeProvider>
          <Composer 
            directLine={connection}
            styleOptions={afribitStyleOptions}
          >
            <BasicWebChat />
          </Composer>
        </FluentThemeProvider>
      </div>
      
      {/* Footer */}
      <div className={styles.poweredBy}>
        <BotIcon style={{ width: 14, height: 14, color: '#F27E4A' }} />
        Powered by <a href="https://afribit.co.za" target="_blank" rel="noopener noreferrer">Afribit</a> & Microsoft Copilot Studio
      </div>
    </div>
  );
};

export default Chat;
