
export type ClientRole = "client_admin" | "manager" | "supervisor";

// Removing the duplicate UserData interface and importing from types/index.ts
import { UserData, Group, Team } from './types/index';
export { UserData, Group, Team };
