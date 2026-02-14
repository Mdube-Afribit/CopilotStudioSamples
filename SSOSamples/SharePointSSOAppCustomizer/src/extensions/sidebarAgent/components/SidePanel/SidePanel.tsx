import * as React from 'react';
import styles from './SidePanel.module.scss';
import Chat from '../Chat/Chat';
import { ISidePanelProps } from '../../models/ISidebarAgentProperties';

// Icon Components
const NewChatIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10.5 2C15.1944 2 19 5.80558 19 10.5C19 15.1944 15.1944 19 10.5 19C8.76472 19 7.11922 18.4543 5.75373 17.4816L2.49213 18.5078C2.08002 18.6317 1.65087 18.4024 1.52705 17.9903C1.48179 17.8421 1.48179 17.6842 1.52705 17.536L2.5527 14.2752C1.57831 12.9086 1.0317 11.2612 1.0317 9.52322C1.08606 5.05327 4.99567 1.31044 9.46027 1.03543C9.80475 1.01197 10.1513 1 10.5 1V2ZM10.5 3C6.35786 3 3 6.35786 3 10.5C3 11.8905 3.38968 13.1911 4.06306 14.2901C4.14846 14.4308 4.20128 14.5899 4.21725 14.7554C4.23321 14.9209 4.21188 15.0886 4.15513 15.2446L3.45116 17.3484L5.55498 16.6445C5.86607 16.5406 6.20598 16.5808 6.48684 16.7547C7.58156 17.4263 8.87622 17.8142 10.2598 17.8142H10.5C14.6421 17.8142 18 14.4563 18 10.3142V10.186C17.8591 6.33426 14.9119 3.21269 11.0732 3.00673C10.8831 2.99556 10.692 2.99 10.5 2.99V3ZM10.5 5.5C10.7761 5.5 11 5.72386 11 6V9.5H14.5C14.7761 9.5 15 9.72386 15 10C15 10.2761 14.7761 10.5 14.5 10.5H11V14C11 14.2761 10.7761 14.5 10.5 14.5C10.2239 14.5 10 14.2761 10 14V10.5H6.5C6.22386 10.5 6 10.2761 6 10C6 9.72386 6.22386 9.5 6.5 9.5H10V6C10 5.72386 10.2239 5.5 10.5 5.5Z" fill="currentColor"/>
  </svg>
);

const CloseIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SettingsIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M12.0123 2.25C12.7405 2.24996 13.3667 2.79265 13.4717 3.51183L13.6528 4.79174C13.7107 5.20209 14.0099 5.53304 14.4015 5.65524C14.5027 5.68686 14.6025 5.72167 14.7009 5.75959C15.0837 5.90756 15.5204 5.83681 15.8406 5.56956L16.8503 4.72609C17.4119 4.25754 18.2437 4.29413 18.7614 4.81185L19.1892 5.23962C19.7069 5.75733 19.7435 6.58916 19.2749 7.15079L18.4289 8.16312C18.1622 8.48278 18.0913 8.91868 18.2386 9.30102C18.2768 9.39977 18.3119 9.50001 18.3439 9.60158C18.466 9.99318 18.7969 10.2924 19.2073 10.3502L20.4878 10.5283C21.2073 10.6311 21.751 11.2564 21.751 11.9846V12.5887C21.751 13.3168 21.2073 13.942 20.4879 14.0449L19.2076 14.2259C18.7971 14.2839 18.466 14.5833 18.344 14.9751C18.3122 15.0758 18.2774 15.1752 18.2396 15.273C18.092 15.6559 18.163 16.0927 18.4302 16.4128L19.2749 17.4234C19.7435 17.985 19.7069 18.8168 19.1892 19.3345L18.7614 19.7623C18.2437 20.28 17.4119 20.3166 16.8503 19.8481L15.8397 19.0032C15.5199 18.7362 15.0835 18.6653 14.7011 18.8126C14.6027 18.8507 14.5027 18.8858 14.4012 18.9178C14.0098 19.0399 13.7105 19.3707 13.6526 19.7809L13.4717 21.0615C13.3666 21.7811 12.74 22.324 12.0115 22.3237L11.4077 22.3233C10.6795 22.323 10.0542 21.7793 9.95135 21.0599L9.77313 19.7804C9.71524 19.3701 9.41608 19.0392 9.02454 18.917C8.92281 18.8851 8.82262 18.8501 8.72416 18.8121C8.34129 18.6644 7.90436 18.7354 7.58419 19.0026L6.57559 19.8464C6.01396 20.3149 5.18213 20.2783 4.66442 19.7606L4.23665 19.3329C3.71893 18.8152 3.68234 17.9833 4.15089 17.4217L4.9959 16.4111C5.26286 16.0911 5.33362 15.6544 5.18624 15.2719C5.14803 15.173 5.11298 15.0726 5.0809 14.9708C4.95889 14.579 4.62786 14.2795 4.21736 14.2217L2.93743 14.0436C2.21827 13.9408 1.67458 13.3155 1.67458 12.5873L1.67498 11.9835C1.67502 11.2553 2.2187 10.6301 2.93809 10.5273L4.21798 10.3463C4.62833 10.2884 4.9593 9.98924 5.08151 9.59769C5.11327 9.49616 5.14808 9.39615 5.18599 9.29766C5.33396 8.91478 5.26321 8.47805 4.99595 8.15788L4.15251 7.1483C3.68396 6.58667 3.72055 5.75484 4.23826 5.23712L4.66604 4.80935C5.18375 4.29163 6.01558 4.25504 6.57721 4.72359L7.58879 5.56858C7.9089 5.83577 8.34565 5.9065 8.72835 5.75855C8.82655 5.72065 8.92646 5.68564 9.02792 5.65367C9.41949 5.5316 9.71866 5.20063 9.77654 4.79029L9.95752 3.50954C10.0625 2.79049 10.6891 2.24808 11.4082 2.24844L12.0123 2.25ZM12.0004 8.25C9.9294 8.25 8.25042 9.92893 8.25042 12C8.25042 14.0711 9.9294 15.75 12.0004 15.75C14.0715 15.75 15.7504 14.0711 15.7504 12C15.7504 9.92893 14.0715 8.25 12.0004 8.25Z" fill="currentColor"/>
  </svg>
);

interface ISidePanelState {
  hasBeenOpened: boolean;
}

export default class SidePanel extends React.Component<ISidePanelProps, ISidePanelState> {
  constructor(props: ISidePanelProps) {
    super(props);
    this.state = {
      hasBeenOpened: false
    };
  }

  public componentDidUpdate(prevProps: ISidePanelProps): void {
    // Track when panel has been opened at least once
    if (this.props.isOpen && !prevProps.isOpen && !this.state.hasBeenOpened) {
      this.setState({ hasBeenOpened: true });
    }
  }

  public render(): React.ReactElement {
    const { isOpen, properties, currentUserLogin, baseUrl, onDismiss, onNewConversation, onOpenSettings, chatKey } = this.props;
    const { hasBeenOpened } = this.state;
    const agentTitle = properties.agentTitle || 'BITA';
    
    // Keep chat mounted once it's been opened, just hide it when panel is closed
    const shouldRenderChat = isOpen || hasBeenOpened;

    return (
      <>
        {/* Overlay backdrop */}
        <div 
          className={`${styles.overlay} ${isOpen ? styles.visible : ''}`} 
          onClick={onDismiss} 
        />
        
        {/* Popup Modal */}
        <div className={`${styles.sidePanel} ${isOpen ? styles.open : ''}`}>
          <div className={styles.chatContainer}>
            {/* Action bar with Settings, New Chat and Close buttons */}
            <div className={styles.actionBar}>
              <button
                className={styles.iconButton}
                aria-label="Agent Settings"
                onClick={onOpenSettings}
                title="Settings"
                // Hide button visually but keep it accessible
                style={{ display: 'none' }}
                aria-hidden="true"
                tabIndex={-1}
              >
                <SettingsIcon />
              </button>
              <button
                className={styles.iconButton}
                aria-label="Start new conversation"
                onClick={onNewConversation}
                title="New conversation"
              >
                <NewChatIcon />
              </button>
              <button
                className={styles.closeButton}
                aria-label="Close chat"
                onClick={onDismiss}
                title="Close"
              >
                <CloseIcon />
              </button>
            </div>
            
            {/* Chat Component - keep mounted once opened to preserve connection */}
            <div className={styles.chatWrapper}>
              {shouldRenderChat && (
                <Chat
                  key={chatKey}
                  appClientId={properties.appClientId}
                  tenantId={properties.tenantId}
                  environmentId={properties.environmentId}
                  agentIdentifier={properties.agentIdentifier}
                  directConnectUrl={properties.directConnectUrl}
                  showTyping={properties.showTyping}
                  currentUserLogin={currentUserLogin}
                  baseUrl={baseUrl}
                  agentName={agentTitle}
                />
              )}
            </div>
          </div>
        </div>
      </>
    );
  }
}