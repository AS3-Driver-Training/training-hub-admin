
import { UserData } from "../types/index";
import { InvitationActions } from "./actions/InvitationActions";
import { RegularUserActions } from "./actions/RegularUserActions";

interface UserActionsProps {
  user: UserData;
  clientId: string;
  onManageUser: (user: UserData) => void;
}

export function UserActions({ user, clientId, onManageUser }: UserActionsProps) {
  // Determine if this is an invitation or a regular user
  const isInvitation = user.is_invitation === true;

  // Render different action components based on user type
  if (isInvitation) {
    return <InvitationActions user={user} clientId={clientId} onManageUser={onManageUser} />;
  } else {
    return <RegularUserActions user={user} onManageUser={onManageUser} />;
  }
}
