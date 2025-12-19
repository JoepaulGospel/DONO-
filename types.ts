
export type Role = 'user' | 'assistant';

export interface Message {
  id: string;
  role: Role;
  text: string;
  timestamp: string;
  chartSymbol?: string;
}

export interface AppState {
  isAuth: boolean;
  pin: string;
  messages: Message[];
  isTyping: boolean;
}
