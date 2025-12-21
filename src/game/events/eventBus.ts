/**
 * Event Bus System
 * 
 * Provides a decoupled event system for game actions.
 * Commands emit events, missions listen and react.
 * This prevents tight coupling between commands and missions.
 */

/**
 * Event types for game actions
 */
export type GameEventType =
  | 'command:executed'
  | 'command:failed'
  | 'tool:used'
  | 'file:read'
  | 'file:written'
  | 'file:deleted'
  | 'server:connected'
  | 'server:disconnected'
  | 'vpn:connected'
  | 'vpn:disconnected'
  | 'email:read'
  | 'email:received'
  | 'mission:started'
  | 'mission:completed'
  | 'task:completed'
  | 'inventory:purchased'
  | 'currency:earned'
  | 'time:tick'
  | 'user:logout';

/**
 * Base event interface
 */
export interface GameEvent {
  type: GameEventType;
  timestamp: number;
  [key: string]: any; // Allow additional properties
}

/**
 * Command executed event
 */
export interface CommandExecutedEvent extends GameEvent {
  type: 'command:executed';
  command: string;
  args: string[];
  success: boolean;
  context?: {
    hostname?: string;
    vpnConnected?: boolean;
    currentDirectory?: string;
    activeServerId?: string | null;
  };
}

/**
 * File read event
 */
export interface FileReadEvent extends GameEvent {
  type: 'file:read';
  filePath: string;
  filename: string;
  serverId?: string | null;
}

/**
 * Server connected event
 */
export interface ServerConnectedEvent extends GameEvent {
  type: 'server:connected';
  serverId: string;
  username: string;
}

/**
 * Server disconnected event
 */
export interface ServerDisconnectedEvent extends GameEvent {
  type: 'server:disconnected';
  serverId: string;
}

/**
 * Tool used event
 */
export interface ToolUsedEvent extends GameEvent {
  type: 'tool:used';
  toolId: string;
  target?: string;
  success: boolean;
}

/**
 * Email read event
 */
export interface EmailReadEvent extends GameEvent {
  type: 'email:read';
  emailId: string;
  missionId?: string;
}

/**
 * Event handler function type
 */
export type EventHandler<T extends GameEvent = GameEvent> = (event: T) => void | Promise<void>;

/**
 * Event Bus Class
 * 
 * Singleton event bus for game-wide event communication.
 * Allows decoupled communication between systems.
 */
class EventBus {
  private handlers: Map<GameEventType, Set<EventHandler>> = new Map();

  /**
   * Subscribe to an event type
   * @param eventType The type of event to listen for
   * @param handler Function to call when event is emitted
   * @returns Unsubscribe function
   */
  on<T extends GameEvent = GameEvent>(
    eventType: GameEventType,
    handler: EventHandler<T>
  ): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }

    const handlers = this.handlers.get(eventType)!;
    handlers.add(handler as EventHandler);

    // Return unsubscribe function
    return () => {
      handlers.delete(handler as EventHandler);
    };
  }

  /**
   * Subscribe to an event type (one-time only)
   * @param eventType The type of event to listen for
   * @param handler Function to call when event is emitted
   */
  once<T extends GameEvent = GameEvent>(
    eventType: GameEventType,
    handler: EventHandler<T>
  ): void {
    const unsubscribe = this.on(eventType, async (event: T) => {
      unsubscribe();
      await handler(event);
    });
  }

  /**
   * Unsubscribe from an event type
   * @param eventType The type of event
   * @param handler The handler to remove
   */
  off(eventType: GameEventType, handler: EventHandler): void {
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  /**
   * Emit an event
   * @param event The event to emit
   */
  async emit(event: GameEvent): Promise<void> {
    const handlers = this.handlers.get(event.type);
    if (!handlers || handlers.size === 0) {
      return;
    }

    // Add timestamp if not present
    if (!event.timestamp) {
      event.timestamp = Date.now();
    }

    // Call all handlers
    const promises: Promise<void>[] = [];
    for (const handler of handlers) {
      try {
        const result = handler(event);
        if (result instanceof Promise) {
          promises.push(result);
        }
      } catch (error) {
        console.error(`Error in event handler for ${event.type}:`, error);
      }
    }

    // Wait for all async handlers
    await Promise.all(promises);
  }

  /**
   * Remove all handlers for an event type
   * @param eventType The event type to clear
   */
  clear(eventType?: GameEventType): void {
    if (eventType) {
      this.handlers.delete(eventType);
    } else {
      this.handlers.clear();
    }
  }

  /**
   * Get count of handlers for an event type
   * @param eventType The event type
   * @returns Number of handlers
   */
  handlerCount(eventType: GameEventType): number {
    return this.handlers.get(eventType)?.size || 0;
  }
}

// Export singleton instance
export const eventBus = new EventBus();

/**
 * Helper functions for common events
 */

/**
 * Emit a command executed event
 */
export function emitCommandExecuted(
  command: string,
  args: string[],
  success: boolean,
  context?: CommandExecutedEvent['context']
): void {
  eventBus.emit({
    type: 'command:executed',
    command,
    args,
    success,
    context,
    timestamp: Date.now(),
  } as CommandExecutedEvent);
}

/**
 * Emit a file read event
 */
export function emitFileRead(
  filePath: string,
  filename: string,
  serverId?: string | null
): void {
  eventBus.emit({
    type: 'file:read',
    filePath,
    filename,
    serverId,
    timestamp: Date.now(),
  } as FileReadEvent);
}

/**
 * Emit a server connected event
 */
export function emitServerConnected(serverId: string, username: string): void {
  eventBus.emit({
    type: 'server:connected',
    serverId,
    username,
    timestamp: Date.now(),
  } as ServerConnectedEvent);
}

/**
 * Emit a server disconnected event
 */
export function emitServerDisconnected(serverId: string): void {
  eventBus.emit({
    type: 'server:disconnected',
    serverId,
    timestamp: Date.now(),
  });
}

/**
 * Emit a tool used event
 */
export function emitToolUsed(
  toolId: string,
  target?: string,
  success: boolean = true
): void {
  eventBus.emit({
    type: 'tool:used',
    toolId,
    target,
    success,
    timestamp: Date.now(),
  } as ToolUsedEvent);
}

/**
 * Emit an email read event
 */
export function emitEmailRead(emailId: string, missionId?: string): void {
  eventBus.emit({
    type: 'email:read',
    emailId,
    missionId,
    timestamp: Date.now(),
  } as EmailReadEvent);
}

/**
 * Emit a user logout event
 */
export function emitUserLogout(username: string): void {
  eventBus.emit({
    type: 'user:logout',
    username,
    timestamp: Date.now(),
  });
}

