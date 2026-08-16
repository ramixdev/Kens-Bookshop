/**
 * Root admin layout — bare pass-through with no sidebar and no auth guard.
 *
 * The sidebar layout and auth check live in app/admin/(protected)/layout.tsx.
 * app/admin/login/ sits here (outside the (protected) route group) so the
 * login page never renders inside the sidebar shell.
 */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
