// Force dynamic rendering to prevent SSR issues with browser APIs
export const dynamic = 'force-dynamic';

import OnboardingClient from './OnboardingClient';

export default function OnboardingPage() {
  return <OnboardingClient />;
}
