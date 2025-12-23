import RoleDispatcher from "@/modules/auth/RoleDispatcher";

/**
 * Dashboard is a thin wrapper around the authentication-layer RoleDispatcher.
 * Keeping this as a page component lets routing stay stable while the
 * auth module owns post-login role routing.
 */
export default function Dashboard() {
  return <RoleDispatcher />;
}
