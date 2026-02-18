/**
 * Home page component for NeuronBook
 * Redirects to the main dashboard page
 */

import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/dashboard');
}
