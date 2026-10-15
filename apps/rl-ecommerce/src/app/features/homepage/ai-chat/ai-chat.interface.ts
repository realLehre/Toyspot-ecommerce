export interface Parts {
  text: string;
  thoughtSignature?: string;
}

export interface PartsItem {
  parts: Parts[];
  role: string;
}

export interface AiResponse {
  history: PartsItem[];
  response: string;
}
