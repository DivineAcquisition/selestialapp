/**
 * /welcome was previously the public marketing landing page with its own
 * shell (nav + footer). It now redirects to /demo, so this layout is a
 * passthrough.
 */
export default function WelcomeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
