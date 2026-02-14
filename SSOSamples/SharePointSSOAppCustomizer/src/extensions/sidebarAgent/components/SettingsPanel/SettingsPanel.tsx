import * as React from 'react';
import { useState, useEffect } from 'react';
import { ISidebarAgentApplicationCustomizerProperties } from '../../models/ISidebarAgentProperties';
import styles from './SettingsPanel.module.scss';

export interface ISettingsPanelProps {
  isOpen: boolean;
  defaultProperties: ISidebarAgentApplicationCustomizerProperties;
  onDismiss: () => void;
  onSave: (properties: ISidebarAgentApplicationCustomizerProperties) => void;
}

export interface IAgentConfig {
  name: string;
  appClientId: string;
  tenantId: string;
  environmentId?: string;
  agentIdentifier?: string;
  directConnectUrl?: string;
  showTyping?: boolean;
  headerBackgroundColor?: string;
  agentTitle?: string;
}

const STORAGE_KEY = 'copilotStudioAgentConfigs';
const ACTIVE_AGENT_KEY = 'copilotStudioActiveAgent';

export const getStoredConfigs = (): IAgentConfig[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// HARDCODED BITA CREDENTIALS - This ensures BITA is always used regardless of SharePoint caching
// Correct credentials from Copilot Studio metadata
const BITA_CREDENTIALS = {
  appClientId: 'f5e1f474-5e52-4fd2-844c-022428f9e532',  // Application (client) ID from Azure AD
  tenantId: 'a91d1fa7-91fa-4c36-8626-613c01ea71ee',    // Tenant ID
  environmentId: '362139ad-5ee1-ebe3-839c-f6a8692d1d53', // Environment ID from Copilot Studio
  agentIdentifier: 'copilots_header_c93fa',             // Schema name from Copilot Studio
  directConnectUrl: '',
  showTyping: true,
  headerBackgroundColor: '#002746',
  agentTitle: 'BITA'
};

export const getActiveAgentConfig = (defaultProps: ISidebarAgentApplicationCustomizerProperties): ISidebarAgentApplicationCustomizerProperties => {
  try {
    const activeAgentName = localStorage.getItem(ACTIVE_AGENT_KEY);
    if (activeAgentName) {
      const configs = getStoredConfigs();
      const activeConfig = configs.find(c => c.name === activeAgentName);
      if (activeConfig) {
        return {
          appClientId: activeConfig.appClientId,
          tenantId: activeConfig.tenantId,
          environmentId: activeConfig.environmentId,
          agentIdentifier: activeConfig.agentIdentifier,
          directConnectUrl: activeConfig.directConnectUrl,
          showTyping: activeConfig.showTyping ?? true,
          headerBackgroundColor: activeConfig.headerBackgroundColor || '#002746',
          agentTitle: activeConfig.agentTitle || 'BITA'
        };
      }
    }
  } catch {
    // Fall back to BITA credentials
  }
  
  // FORCE BITA CREDENTIALS: Always use BITA regardless of what SharePoint sends
  // This bypasses any SharePoint caching issues with CustomAction properties
  console.log('🔧 Using hardcoded BITA credentials (bypassing SharePoint props)');
  return {
    appClientId: BITA_CREDENTIALS.appClientId,
    tenantId: BITA_CREDENTIALS.tenantId,
    environmentId: BITA_CREDENTIALS.environmentId,
    agentIdentifier: BITA_CREDENTIALS.agentIdentifier,
    directConnectUrl: BITA_CREDENTIALS.directConnectUrl,
    showTyping: BITA_CREDENTIALS.showTyping,
    headerBackgroundColor: BITA_CREDENTIALS.headerBackgroundColor,
    agentTitle: BITA_CREDENTIALS.agentTitle
  };
};

const SettingsPanel: React.FC<ISettingsPanelProps> = ({ isOpen, defaultProperties, onDismiss, onSave }) => {
  const [configs, setConfigs] = useState<IAgentConfig[]>([]);
  const [activeAgent, setActiveAgent] = useState<string>('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingConfig, setEditingConfig] = useState<IAgentConfig | null>(null);
  
  // Form state for new/edit agent
  const [formData, setFormData] = useState<IAgentConfig>({
    name: '',
    appClientId: defaultProperties.appClientId || '',
    tenantId: defaultProperties.tenantId || '',
    environmentId: defaultProperties.environmentId || '',
    agentIdentifier: defaultProperties.agentIdentifier || '',
    directConnectUrl: defaultProperties.directConnectUrl || '',
    showTyping: defaultProperties.showTyping ?? true,
    headerBackgroundColor: defaultProperties.headerBackgroundColor || '#0078d4',
    agentTitle: defaultProperties.agentTitle || 'BITA'
  });

  useEffect(() => {
    const storedConfigs = getStoredConfigs();
    setConfigs(storedConfigs);
    const storedActive = localStorage.getItem(ACTIVE_AGENT_KEY) || '';
    setActiveAgent(storedActive);
  }, [isOpen]);

  const saveConfigs = (newConfigs: IAgentConfig[]): void => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfigs));
    setConfigs(newConfigs);
  };

  const handleInputChange = (field: keyof IAgentConfig, value: string | boolean): void => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = (): void => {
    setFormData({
      name: '',
      appClientId: defaultProperties.appClientId || '',
      tenantId: defaultProperties.tenantId || '',
      environmentId: defaultProperties.environmentId || '',
      agentIdentifier: defaultProperties.agentIdentifier || '',
      directConnectUrl: defaultProperties.directConnectUrl || '',
      showTyping: defaultProperties.showTyping ?? true,
      headerBackgroundColor: defaultProperties.headerBackgroundColor || '#0078d4',
      agentTitle: defaultProperties.agentTitle || 'BITA'
    });
  };

  const handleAddAgent = (): void => {
    if (!formData.name.trim()) {
      alert('Please enter an agent name');
      return;
    }
    if (configs.some(c => c.name === formData.name && (!editingConfig || editingConfig.name !== formData.name))) {
      alert('An agent with this name already exists');
      return;
    }
    
    let newConfigs: IAgentConfig[];
    if (editingConfig) {
      newConfigs = configs.map(c => c.name === editingConfig.name ? formData : c);
    } else {
      newConfigs = [...configs, formData];
    }
    
    saveConfigs(newConfigs);
    setIsAddingNew(false);
    setEditingConfig(null);
    resetForm();
  };

  const handleDeleteAgent = (name: string): void => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      const newConfigs = configs.filter(c => c.name !== name);
      saveConfigs(newConfigs);
      if (activeAgent === name) {
        localStorage.removeItem(ACTIVE_AGENT_KEY);
        setActiveAgent('');
      }
    }
  };

  const handleEditAgent = (config: IAgentConfig): void => {
    setFormData(config);
    setEditingConfig(config);
    setIsAddingNew(true);
  };

  const handleSelectAgent = (config: IAgentConfig): void => {
    localStorage.setItem(ACTIVE_AGENT_KEY, config.name);
    setActiveAgent(config.name);
    onSave({
      appClientId: config.appClientId,
      tenantId: config.tenantId,
      environmentId: config.environmentId,
      agentIdentifier: config.agentIdentifier,
      directConnectUrl: config.directConnectUrl,
      showTyping: config.showTyping ?? true,
      headerBackgroundColor: config.headerBackgroundColor || '#0078d4',
      agentTitle: config.agentTitle || 'BITA'
    });
  };

  const handleUseDefault = (): void => {
    localStorage.removeItem(ACTIVE_AGENT_KEY);
    setActiveAgent('');
    onSave(defaultProperties);
  };

  const handleCancel = (): void => {
    setIsAddingNew(false);
    setEditingConfig(null);
    resetForm();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onDismiss}>
      <div className={styles.panel} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Agent Settings</h2>
          <button className={styles.closeButton} onClick={onDismiss} aria-label="Close settings">
            ✕
          </button>
        </div>

        <div className={styles.content}>
          {!isAddingNew ? (
            <>
              <div className={styles.section}>
                <h3>Saved Agents</h3>
                
                {/* Default agent option */}
                <div 
                  className={`${styles.agentCard} ${!activeAgent ? styles.active : ''}`}
                  onClick={handleUseDefault}
                >
                  <div className={styles.agentInfo}>
                    <span className={styles.agentName}>Default (from deployment)</span>
                    <span className={styles.agentTitle}>{defaultProperties.agentTitle || 'BITA'}</span>
                  </div>
                  {!activeAgent && <span className={styles.activeBadge}>Active</span>}
                </div>

                {configs.map(config => (
                  <div 
                    key={config.name}
                    className={`${styles.agentCard} ${activeAgent === config.name ? styles.active : ''}`}
                  >
                    <div className={styles.agentInfo} onClick={() => handleSelectAgent(config)}>
                      <span className={styles.agentName}>{config.name}</span>
                      <span className={styles.agentTitle}>{config.agentTitle || 'BITA'}</span>
                    </div>
                    <div className={styles.agentActions}>
                      {activeAgent === config.name && <span className={styles.activeBadge}>Active</span>}
                      <button 
                        className={styles.iconButton} 
                        onClick={(e) => { e.stopPropagation(); handleEditAgent(config); }}
                        aria-label="Edit agent"
                      >
                        ✎
                      </button>
                      <button 
                        className={styles.iconButton} 
                        onClick={(e) => { e.stopPropagation(); handleDeleteAgent(config.name); }}
                        aria-label="Delete agent"
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button className={styles.addButton} onClick={() => setIsAddingNew(true)}>
                + Add New Agent
              </button>
            </>
          ) : (
            <div className={styles.form}>
              <h3>{editingConfig ? 'Edit Agent' : 'Add New Agent'}</h3>
              
              <div className={styles.formGroup}>
                <label>Agent Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => handleInputChange('name', e.target.value)}
                  placeholder="My Custom Agent"
                />
              </div>

              <div className={styles.formGroup}>
                <label>App Client ID *</label>
                <input
                  type="text"
                  value={formData.appClientId}
                  onChange={e => handleInputChange('appClientId', e.target.value)}
                  placeholder="00000000-0000-0000-0000-000000000000"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Tenant ID *</label>
                <input
                  type="text"
                  value={formData.tenantId}
                  onChange={e => handleInputChange('tenantId', e.target.value)}
                  placeholder="00000000-0000-0000-0000-000000000000"
                />
              </div>

              <div className={styles.formDivider}>
                <span>Use Direct Connect URL OR Environment ID + Agent Identifier</span>
              </div>

              <div className={styles.formGroup}>
                <label>Direct Connect URL</label>
                <input
                  type="text"
                  value={formData.directConnectUrl || ''}
                  onChange={e => handleInputChange('directConnectUrl', e.target.value)}
                  placeholder="https://xxxxx.api.powerplatform.com/..."
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Environment ID</label>
                  <input
                    type="text"
                    value={formData.environmentId || ''}
                    onChange={e => handleInputChange('environmentId', e.target.value)}
                    placeholder="Environment ID"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Agent Identifier</label>
                  <input
                    type="text"
                    value={formData.agentIdentifier || ''}
                    onChange={e => handleInputChange('agentIdentifier', e.target.value)}
                    placeholder="cr770_myAgent"
                  />
                </div>
              </div>

              <div className={styles.formDivider}>
                <span>Appearance Settings</span>
              </div>

              <div className={styles.formGroup}>
                <label>Agent Title</label>
                <input
                  type="text"
                  value={formData.agentTitle || ''}
                  onChange={e => handleInputChange('agentTitle', e.target.value)}
                  placeholder="BITA"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Header Background Color</label>
                <input
                  type="text"
                  value={formData.headerBackgroundColor || ''}
                  onChange={e => handleInputChange('headerBackgroundColor', e.target.value)}
                  placeholder="white, #0078d4, etc."
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formData.showTyping ?? true}
                    onChange={e => handleInputChange('showTyping', e.target.checked)}
                  />
                  Show Typing Indicator
                </label>
              </div>

              <div className={styles.formActions}>
                <button className={styles.cancelButton} onClick={handleCancel}>
                  Cancel
                </button>
                <button className={styles.saveButton} onClick={handleAddAgent}>
                  {editingConfig ? 'Update Agent' : 'Add Agent'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
