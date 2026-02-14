import { Log } from '@microsoft/sp-core-library';
import {
  BaseApplicationCustomizer,
  PlaceholderContent,
  PlaceholderName,
  ApplicationCustomizerContext
} from '@microsoft/sp-application-base';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as strings from 'SidebarAgentApplicationCustomizerStrings';
import SidePanel from './components/SidePanel/SidePanel';
import SettingsPanel, { getActiveAgentConfig } from './components/SettingsPanel/SettingsPanel';
import { 
  ISidebarAgentApplicationCustomizerProperties, 
  ISidebarAgentState 
} from './models/ISidebarAgentProperties';

const LOG_SOURCE: string = 'SidebarAgentApplicationCustomizer';

class SidebarAgentComponent extends React.Component<
  { properties: ISidebarAgentApplicationCustomizerProperties; context: ApplicationCustomizerContext }, 
  ISidebarAgentState
> {
  constructor(props: { properties: ISidebarAgentApplicationCustomizerProperties; context: ApplicationCustomizerContext }) {
    super(props);
    const user = props.context?.pageContext?.user;
    // Get active agent config from localStorage or use default properties
    const activeProperties = getActiveAgentConfig(props.properties);
    this.state = {
      isPanelOpen: false,
      isSettingsOpen: false,
      currentUserLogin: user ? (user.loginName || user.email) : undefined,
      chatKey: 0,
      activeProperties
    };
  }


  private _togglePanel = (): void => {
    this.setState({ isPanelOpen: !this.state.isPanelOpen });
  };

  private _onPanelDismiss = (): void => {
    this.setState({ isPanelOpen: false });
  };

  private _toggleSettings = (): void => {
    this.setState({ isSettingsOpen: !this.state.isSettingsOpen });
  };

  private _onSettingsDismiss = (): void => {
    this.setState({ isSettingsOpen: false });
  };

  private _onSettingsSave = (newProperties: ISidebarAgentApplicationCustomizerProperties): void => {
    this.setState({ 
      activeProperties: newProperties,
      isSettingsOpen: false,
      chatKey: this.state.chatKey + 1 // Reset chat when agent changes
    });
  };

  private _startNewConversation = (): void => {
    this.setState(prevState => ({
      chatKey: prevState.chatKey + 1
    }));
  };

  private _getBaseUrl = (): string => {
    // Use SPFx context to get the base site URL
    const context = this.props.context;
    if (context?.pageContext?.web?.absoluteUrl) {
      return context.pageContext.web.absoluteUrl;
    }
    // Fallback to origin if context is not available
    return window.location.origin;
  };

  public render(): React.ReactElement {
    const { isPanelOpen, isSettingsOpen, activeProperties } = this.state;
    const { properties } = this.props;
    
    const agentTitle = activeProperties.agentTitle || 'BITA';
    
    const hasRequiredProps = activeProperties.appClientId && 
                           activeProperties.tenantId && 
                           (activeProperties.directConnectUrl || 
                            (activeProperties.agentIdentifier && activeProperties.environmentId));
    
    if (!hasRequiredProps) {
      return (
        <div style={{ padding: '10px', background: '#f3f2f1', color: '#d83b01' }}>
          <strong>Configuration Error:</strong> Missing required properties. Please configure appClientId, tenantId, and either directConnectUrl OR both agentIdentifier and environmentId.
        </div>
      );
    }
    
    return (
      <div id="copilot-studio-sidebar-agent">
        {/* Floating Chat Button Container with Greeting - Bottom Right */}
        <div
          id="copilot-studio-fab-container"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            display: isPanelOpen ? 'none' : 'flex',
            alignItems: 'center',
            gap: '12px',
            zIndex: 999998,
          }}
        >
          {/* Greeting Message */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              color: '#002746',
              padding: '10px 16px',
              borderRadius: '20px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              fontSize: '14px',
              fontWeight: '500',
              whiteSpace: 'nowrap',
              animation: 'slideInLeft 0.5s ease-out, pulse 2s ease-in-out 1s infinite',
              fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', sans-serif",
            }}
          >
            Hi! I'm {agentTitle}, how can I help? 👋
          </div>

          {/* Chat Bubble Button */}
          <button
            onClick={this._togglePanel}
            aria-label={isPanelOpen ? `Close ${agentTitle}` : `Open ${agentTitle}`}
            title={agentTitle}
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #F27E4A 0%, #e06a38 100%)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(242, 126, 74, 0.4), 0 2px 8px rgba(0, 0, 0, 0.1)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              padding: 0,
              animation: 'bounce 2s ease-in-out infinite',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.08)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(242, 126, 74, 0.5), 0 4px 12px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(242, 126, 74, 0.4), 0 2px 8px rgba(0, 0, 0, 0.1)';
            }}
          >
            <ChatBubbleIcon />
          </button>
        </div>
        
        {/* Add keyframe animations - only inject once */}
        {!document.getElementById('copilot-studio-animations') && (
          <style id="copilot-studio-animations">{`
            @keyframes bounce {
              0%, 20%, 50%, 80%, 100% {
                transform: translateY(0);
              }
              40% {
                transform: translateY(-10px);
              }
              60% {
                transform: translateY(-5px);
              }
            }
            
            @keyframes pulse {
              0%, 100% {
                transform: scale(1);
              }
              50% {
                transform: scale(1.03);
              }
            }
            
            @keyframes slideInLeft {
              from {
                opacity: 0;
                transform: translateX(20px);
              }
              to {
                opacity: 1;
                transform: translateX(0);
              }
            }
          `}</style>
        )}
        
        <SidePanel
          isOpen={isPanelOpen}
          properties={activeProperties}
          currentUserLogin={this.state.currentUserLogin}
          baseUrl={this._getBaseUrl()}
          onDismiss={this._onPanelDismiss}
          onNewConversation={this._startNewConversation}
          onOpenSettings={this._toggleSettings}
          chatKey={this.state.chatKey}
        />

        <SettingsPanel
          isOpen={isSettingsOpen}
          defaultProperties={properties}
          onDismiss={this._onSettingsDismiss}
          onSave={this._onSettingsSave}
        />
      </div>
    );
  }
}

// Chat Bubble Icon for FAB
function ChatBubbleIcon(): JSX.Element {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C6.48 2 2 6.48 2 12C2 14.17 2.74 16.17 4 17.77V22L8.23 19.77C9.41 20.18 10.68 20.41 12 20.41C17.52 20.41 22 15.93 22 10.41C22 6.48 17.52 2 12 2ZM13 15H11V13H13V15ZM13 11H11V7H13V11Z" fill="white"/>
      <circle cx="8" cy="12" r="1.5" fill="white"/>
      <circle cx="12" cy="12" r="1.5" fill="white"/>
      <circle cx="16" cy="12" r="1.5" fill="white"/>
    </svg>
  );
}

export default class SidebarAgentApplicationCustomizer
  extends BaseApplicationCustomizer<ISidebarAgentApplicationCustomizerProperties> {

  private _topPlaceholder?: PlaceholderContent;
  private _reactContainer?: HTMLDivElement;

  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, `Initialized ${strings.Title}`);
    
    if (!this.properties.appClientId || !this.properties.tenantId) {
      Log.error(LOG_SOURCE, new Error('appClientId and tenantId are required properties.'));
      return Promise.reject('Missing required properties: appClientId and tenantId');
    }
    
    if (!this.properties.directConnectUrl && (!this.properties.agentIdentifier || !this.properties.environmentId)) {
      Log.error(LOG_SOURCE, new Error('Either directConnectUrl OR both agentIdentifier and environmentId must be provided.'));
      return Promise.reject('Missing required properties: Either provide directConnectUrl OR both agentIdentifier and environmentId');
    }
    
    this.context.placeholderProvider.changedEvent.add(this, this._renderPlaceholders);
    this._renderPlaceholders();
    return Promise.resolve();
  }

  private _renderPlaceholders(): void {
    // Prevent duplicate rendering
    if (document.getElementById('copilot-studio-sidebar-agent')) {
      console.log('Copilot Studio sidebar already rendered, skipping...');
      return;
    }

    if (!this._topPlaceholder) {
      this._topPlaceholder = this.context.placeholderProvider.tryCreateContent(PlaceholderName.Top, { onDispose: this._onDispose });

      if (!this._topPlaceholder) {
        Log.warn(LOG_SOURCE, 'Top placeholder not available.');
        return;
      }

      if (this._topPlaceholder.domElement) {
        this._topPlaceholder.domElement.innerHTML = '';
        this._reactContainer = document.createElement('div');
        this._topPlaceholder.domElement.appendChild(this._reactContainer);

        const componentElement: React.ReactElement = React.createElement(
          SidebarAgentComponent,
          { properties: this.properties, context: this.context }
        );

        ReactDOM.render(componentElement, this._reactContainer);
      }
    }
  }

  private _onDispose = (): void => {
    if (this._reactContainer) {
      try {
        ReactDOM.unmountComponentAtNode(this._reactContainer);
      } catch { /* noop */ }
      this._reactContainer = undefined;
    }
    Log.info(LOG_SOURCE, 'Disposed Top placeholder content.');
  };
}
