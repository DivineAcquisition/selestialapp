import { redirect } from 'next/navigation';

/**
 * /welcome was the previous marketing landing page. It has been merged into
 * /demo, which is now the single canonical landing page.
 */
export default function WelcomeRedirect() {
  redirect('/demo');
}
