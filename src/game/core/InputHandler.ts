import { GameAction } from '../../types';

export interface KeyBinding {
  action: GameAction;
  keys: string[];
  gamepadButton?: number;
  gamepadAxis?: {
    axis: number;
    direction: 'positive' | 'negative';
    threshold?: number;
  };
}

export interface InputConfig {
  keyBindings: KeyBinding[];
  repeatDelay: number;
  repeatInterval: number;
  gamepadDeadzone: number;
}

export type InputCallback = (action: GameAction, pressed: boolean) => void;

export class InputHandler {
  private config: InputConfig;
private callbacks: Set<InputCallback>;
  private pressedKeys: Set<string>;
  private actionRepeatTimers: Map<GameAction, NodeJS.Timeout>;
  private gamepadIndex: number | null;
  private gamepadState: Map<number, boolean>;
  private axisState: Map<number, number>;
  private isDisposed: boolean;

  private static DEFAULT_CONFIG: InputConfig = {
    keyBindings: [
      { action: 'moveLeft', keys: ['ArrowLeft', 'KeyA'] },
      { action: 'moveRight', keys: ['ArrowRight', 'KeyD'] },
      { action: 'rotateCW', keys: ['ArrowUp', 'KeyX', 'KeyK'] },
      { action: 'rotateCCW', keys: ['KeyZ', 'KeyJ'] },
      { action: 'softDrop', keys: ['ArrowDown', 'KeyS'] },
      { action: 'hardDrop', keys: ['Space'] },
      { action: 'hold', keys: ['ShiftLeft', 'ShiftRight', 'KeyC'] },
      { action: 'pause', keys: ['Escape', 'KeyP'] },
    ],
    repeatDelay: 170,
    repeatInterval: 50,
    gamepadDeadzone: 0.15,
  };

  constructor(config?: Partial<InputConfig>) {
    this.config = { ...InputHandler.DEFAULT_CONFIG, ...config };
    this.callbacks = new Set();
    this.pressedKeys = new Set();
    this.actionRepeatTimers = new Map();
    this.gamepadIndex = null;
    this.gamepadState = new Map();
    this.axisState = new Map();
    this.isDisposed = false;

    this.bindEvents();
    this.pollGamepad();
  }

  private bindEvents(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('gamepadconnected', this.handleGamepadConnected);
    window.addEventListener('gamepaddisconnected', this.handleGamepadDisconnected);
  }

  private unbindEvents(): void {
    if (typeof window === 'undefined') return;

    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('gamepadconnected', this.handleGamepadConnected);
    window.removeEventListener('gamepaddisconnected', this.handleGamepadDisconnected);
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    if (event.repeat) return;

    const key = event.code;
    this.pressedKeys.add(key);

    const action = this.getKeyAction(key);
    if (action) {
      this.triggerAction(action, true);
      this.startActionRepeat(action);
    }
  };

  private handleKeyUp = (event: KeyboardEvent): void => {
    const key = event.code;
    this.pressedKeys.delete(key);

    const action = this.getKeyAction(key);
    if (action) {
      this.stopActionRepeat(action);
      this.triggerAction(action, false);
    }
  };

  private handleGamepadConnected = (event: GamepadEvent): void => {
    this.gamepadIndex = event.gamepad.index;
    console.log(`Gamepad connected: ${event.gamepad.id}`);
  };

  private handleGamepadDisconnected = (event: GamepadEvent): void => {
    if (this.gamepadIndex === event.gamepad.index) {
      this.gamepadIndex = null;
      this.gamepadState.clear();
      this.axisState.clear();
    }
  };

  private getKeyAction(key: string): GameAction | null {
    for (const binding of this.config.keyBindings) {
      if (binding.keys.includes(key)) {
        return binding.action;
      }
    }
    return null;
  }

  private getGamepadAction(button: number): GameAction | null {
    for (const binding of this.config.keyBindings) {
      if (binding.gamepadButton === button) {
        return binding.action;
      }
    }
    return null;
  }

  private getGamepadAxisAction(axis: number, value: number): GameAction | null {
    for (const binding of this.config.keyBindings) {
      if (binding.gamepadAxis?.axis === axis) {
        const threshold = binding.gamepadAxis.threshold ?? this.config.gamepadDeadzone;
        const expectedDirection = binding.gamepadAxis.direction;
        const actualDirection = value > 0 ? 'positive' : 'negative';

        if (Math.abs(value) > threshold && expectedDirection === actualDirection) {
          return binding.action;
        }
      }
    }
    return null;
  }

  private startActionRepeat(action: GameAction): void {
    if (this.actionRepeatTimers.has(action)) return;

    const timer = setTimeout(() => {
      if (!this.pressedKeys.size && this.gamepadIndex === null) return;

      this.triggerAction(action, true);
      const repeatTimer = setInterval(() => {
        if (!this.isActionPressed(action)) {
          clearInterval(repeatTimer);
          this.actionRepeatTimers.delete(action);
          return;
        }
        this.triggerAction(action, true);
      }, this.config.repeatInterval);

      this.actionRepeatTimers.set(action, repeatTimer as unknown as NodeJS.Timeout);
    }, this.config.repeatDelay);

    this.actionRepeatTimers.set(action, timer);
  }

  private stopActionRepeat(action: GameAction): void {
    const timer = this.actionRepeatTimers.get(action);
    if (timer) {
      clearTimeout(timer);
      clearInterval(timer as unknown as number);
      this.actionRepeatTimers.delete(action);
    }
  }

  private isActionPressed(action: GameAction): boolean {
    for (const binding of this.config.keyBindings) {
      if (binding.action === action) {
        for (const key of binding.keys) {
          if (this.pressedKeys.has(key)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  private pollGamepad = (): void => {
    if (this.isDisposed) return;

    if (this.gamepadIndex !== null) {
      const gamepads = navigator.getGamepads();
      const gamepad = gamepads[this.gamepadIndex];

      if (gamepad) {
        for (let i = 0; i < gamepad.buttons.length; i++) {
          const button = gamepad.buttons[i];
          const pressed = button.pressed;
          const wasPressed = this.gamepadState.get(i) || false;

          if (pressed && !wasPressed) {
            const action = this.getGamepadAction(i);
            if (action) {
              this.triggerAction(action, true);
              this.startActionRepeat(action);
            }
          } else if (!pressed && wasPressed) {
            const action = this.getGamepadAction(i);
            if (action) {
              this.stopActionRepeat(action);
              this.triggerAction(action, false);
            }
          }

          this.gamepadState.set(i, pressed);
        }

        // Handle axes
        for (let i = 0; i < gamepad.axes.length; i++) {
          const value = gamepad.axes[i];
          const prevValue = this.axisState.get(i) || 0;
          const threshold = this.config.gamepadDeadzone;
          const wasActive = Math.abs(prevValue) > threshold;
          const isActive = Math.abs(value) > threshold;

          if (isActive && !wasActive) {
            const action = this.getGamepadAxisAction(i, value);
            if (action) {
              this.triggerAction(action, true);
              this.startActionRepeat(action);
            }
          } else if (!isActive && wasActive) {
            const action = this.getGamepadAxisAction(i, prevValue);
            if (action) {
              this.stopActionRepeat(action);
              this.triggerAction(action, false);
            }
          }

          this.axisState.set(i, value);
        }
      }
    }

    requestAnimationFrame(this.pollGamepad);
  };

  private triggerAction(action: GameAction, pressed: boolean): void {
    for (const callback of this.callbacks) {
      callback(action, pressed);
    }
  }

  public subscribe(callback: InputCallback): () => void {
    this.callbacks.add(callback);
    return () => {
      this.callbacks.delete(callback);
    };
  }

  public updateKeyBinding(action: GameAction, keys: string[]): void {
    const binding = this.config.keyBindings.find((b) => b.action === action);
    if (binding) {
      binding.keys = keys;
    } else {
      this.config.keyBindings.push({ action, keys });
    }
  }

  public updateGamepadBinding(action: GameAction, button?: number, axis?: KeyBinding['gamepadAxis']): void {
    const binding = this.config.keyBindings.find((b) => b.action === action);
    if (binding) {
      binding.gamepadButton = button;
      binding.gamepadAxis = axis;
    } else {
      this.config.keyBindings.push({ action, keys: [], gamepadButton: button, gamepadAxis: axis });
    }
  }

  public getKeyBindings(): KeyBinding[] {
    return [...this.config.keyBindings];
  }
  public setConfig(config: Partial<InputConfig>): void {
    this.config = { ...this.config, ...config };
  }

  public getConfig(): InputConfig {
    return { ...this.config };
  }

  public detectGamepad(): number | null {
    const gamepads = navigator.getGamepads();
    for (let i = 0; i < gamepads.length; i++) {
      if (gamepads[i]) {
        this.gamepadIndex = i;
        return i;
      }
    }
    return null;
  }

  public dispose(): void {
    this.isDisposed = true;
    this.unbindEvents();

    for (const timer of this.actionRepeatTimers.values()) {
      clearTimeout(timer);
      clearInterval(timer as unknown as number);
    }
    this.actionRepeatTimers.clear();
    this.callbacks.clear();
    this.pressedKeys.clear();
    this.gamepadState.clear();
    this.axisState.clear();
  }
}

export default InputHandler;