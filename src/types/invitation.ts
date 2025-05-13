
// TypeScript interfaces for RPC function responses

export interface VerifyInvitationResponse {
  valid: boolean;
  error?: string;
  client_id?: string;
  email?: string;
  invitation_type?: string;
}

export interface AcceptInvitationResponse {
  success: boolean;
  error?: string;
  message?: string;
  client_user_id?: string;
}
