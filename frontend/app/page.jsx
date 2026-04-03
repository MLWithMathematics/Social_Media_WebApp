/**
 * app/page.jsx - Root redirect
 */

import { redirect } from 'next/navigation';

export default function RootPage() {
  // Middleware handles auth-based redirect; this is a fallback
  redirect('/feed');
}
