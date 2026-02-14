/**
 * Connection Manager - Singleton pattern to ensure only one connection exists
 * This prevents double greetings caused by React re-renders or Strict Mode
 */

import { ConnectionSettings, CopilotStudioClient, CopilotStudioWebChat, CopilotStudioWebChatConnection } from '@microsoft/agents-copilotstudio-client';
import { acquireToken } from './acquireToken';

export interface ConnectionConfig {
  appClientId: string;
  tenantId: string;
  environmentId?: string;
  agentIdentifier?: string;
  directConnectUrl?: string;
  showTyping?: boolean;
  currentUserLogin?: string;
  baseUrl?: string;
}

interface CachedConnection {
  connection: CopilotStudioWebChatConnection;
  configHash: string;
  createdAt: number;
}

// Singleton state
let cachedConnection: CachedConnection | undefined;
let connectionPromise: Promise<CopilotStudioWebChatConnection | undefined> | undefined;

/**
 * Create a hash of the config to detect if settings changed
 */
function getConfigHash(config: ConnectionConfig): string {
  return `${config.appClientId}|${config.tenantId}|${config.environmentId}|${config.agentIdentifier}|${config.directConnectUrl}`;
}

/**
 * Get or create a connection. Returns the same connection if called multiple times
 * with the same configuration.
 */
export async function getOrCreateConnection(config: ConnectionConfig): Promise<CopilotStudioWebChatConnection | undefined> {
  const configHash = getConfigHash(config);
  
  console.log('🔌 ConnectionManager: getOrCreateConnection called');
  console.log('🔌 Config hash:', configHash);
  
  // If we have a cached connection with the same config, return it
  if (cachedConnection && cachedConnection.configHash === configHash) {
    console.log('🔌 ConnectionManager: Returning cached connection');
    return cachedConnection.connection;
  }
  
  // If a connection is being created, wait for it
  if (connectionPromise) {
    console.log('🔌 ConnectionManager: Connection creation in progress, waiting...');
    return connectionPromise;
  }
  
  // Create new connection
  console.log('🔌 ConnectionManager: Creating new connection...');
  connectionPromise = createNewConnection(config, configHash);
  
  try {
    const connection = await connectionPromise;
    return connection;
  } finally {
    connectionPromise = undefined;
  }
}

async function createNewConnection(config: ConnectionConfig, configHash: string): Promise<CopilotStudioWebChatConnection | undefined> {
  try {
    // End any existing connection
    if (cachedConnection) {
      console.log('🔌 ConnectionManager: Ending previous connection');
      cachedConnection.connection.end();
      cachedConnection = undefined;
    }
    
    console.log('🔌 ConnectionManager: Acquiring token...');
    const token = await acquireToken({
      appClientId: config.appClientId,
      tenantId: config.tenantId,
      currentUserLogin: config.currentUserLogin,
      redirectUri: config.baseUrl
    });
    
    if (!token) {
      console.error('🔌 ConnectionManager: Failed to acquire token');
      return undefined;
    }
    
    console.log('🔌 ConnectionManager: Token acquired, creating connection...');
    
    const connectionSettings = {
      appClientId: config.appClientId,
      tenantId: config.tenantId,
      environmentId: config.environmentId || '',
      agentIdentifier: config.agentIdentifier || '',
      directConnectUrl: config.directConnectUrl || ''
    };
    
    console.log('🔌 ConnectionManager: Connection settings:', JSON.stringify(connectionSettings, null, 2));
    
    const settings = new ConnectionSettings(connectionSettings);
    
    const client = new CopilotStudioClient(settings, token);
    const webchatSettings = { showTyping: config.showTyping ?? true };
    
    const connection = CopilotStudioWebChat.createConnection(client, webchatSettings);
    
    // Cache the connection
    cachedConnection = {
      connection,
      configHash,
      createdAt: Date.now()
    };
    
    console.log('🔌 ConnectionManager: Connection created and cached');
    return connection;
    
  } catch (error) {
    console.error('🔌 ConnectionManager: Error creating connection:', error);
    return undefined;
  }
}

/**
 * Force create a new connection (for "new conversation" feature)
 */
export async function createFreshConnection(config: ConnectionConfig): Promise<CopilotStudioWebChatConnection | undefined> {
  console.log('🔌 ConnectionManager: Creating fresh connection (forced)');
  
  // Clear cached connection
  if (cachedConnection) {
    cachedConnection.connection.end();
    cachedConnection = undefined;
  }
  
  // Clear any pending promise
  connectionPromise = undefined;
  
  // Create new connection
  return getOrCreateConnection(config);
}

/**
 * Clear the cached connection (for cleanup)
 */
export function clearConnection(): void {
  console.log('🔌 ConnectionManager: Clearing connection');
  if (cachedConnection) {
    cachedConnection.connection.end();
    cachedConnection = undefined;
  }
  connectionPromise = undefined;
}

/**
 * Check if a connection exists
 */
export function hasConnection(): boolean {
  return cachedConnection !== undefined;
}
