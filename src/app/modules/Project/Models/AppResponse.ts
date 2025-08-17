export interface App {
id: number;
  title: string;
  navigateUrl: string;
  loginUrl?: string; // optional since not returned
  logoFile?: File;   // optional since not returned
  logoUrl: string;
  isActive: boolean;
}
export interface AppResponse {
   data: App[];
  succeeded: boolean;
  hasError: boolean;
  warninged: boolean;
  messages: string[];
}
