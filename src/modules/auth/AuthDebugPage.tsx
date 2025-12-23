import { useAuth } from "@/hooks/useAuth";

/**
 * AuthDebugPage is an admin-only utility view that surfaces
 * the current authentication and role state for troubleshooting.
 */
export default function AuthDebugPage() {
  const { user, role, loading, session } = useAuth();

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background p-6">
      <section className="w-full max-w-2xl rounded-lg border bg-card shadow-sm p-6 space-y-4">
        <header>
          <h1 className="text-2xl font-bold">Authentication Debug</h1>
          <p className="text-sm text-muted-foreground">
            Read-only view of the current login, session, and role information.
          </p>
        </header>
        <article className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="font-medium">Loading state:</span>{" "}
              <span className="text-muted-foreground">{loading ? "true" : "false"}</span>
            </div>
            <div>
              <span className="font-medium">Role:</span>{" "}
              <span className="text-muted-foreground">{role ?? "none"}</span>
            </div>
            <div className="col-span-2">
              <span className="font-medium">User ID:</span>{" "}
              <span className="text-muted-foreground">{user?.id ?? "not authenticated"}</span>
            </div>
            <div className="col-span-2">
              <span className="font-medium">Email:</span>{" "}
              <span className="text-muted-foreground">{user?.email ?? "unknown"}</span>
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-sm font-semibold mb-2">Raw session object</h2>
            <pre className="max-h-72 overflow-auto rounded-md bg-muted p-3 text-xs">
              {JSON.stringify(session, null, 2)}
            </pre>
          </div>
        </article>
      </section>
    </main>
  );
}
