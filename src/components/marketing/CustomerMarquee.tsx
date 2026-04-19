'use client';

import { Marquee } from '@/components/ui/marquee';
import { cn } from '@/lib/utils';

const REVIEWS = [
  {
    name: 'BadgerLuxClean',
    role: 'Premium Residential Cleaning',
    initials: 'BL',
    body:
      '32% of our one-time customers convert to recurring at the booking page. That\u2019s the number that matters.',
  },
  {
    name: 'Bay Area Cleaning Pros',
    role: 'Residential, Bay Area CA',
    initials: 'BA',
    body:
      'We added $50K in new annual revenue from bookings that would\u2019ve been phone tag before Selestial.',
  },
  {
    name: 'Capitol Maids',
    role: 'Austin, TX',
    initials: 'CM',
    body:
      'Customers see the price, pick the time, and the deposit hits before I\u2019d have called them back.',
  },
  {
    name: 'Bright & Tidy',
    role: 'Charlotte, NC',
    initials: 'BT',
    body:
      'The recurring upgrade prompt at checkout doubled our biweekly subscribers in 30 days.',
  },
  {
    name: 'Spotless Squad',
    role: 'Phoenix, AZ',
    initials: 'SS',
    body:
      'Setup was 48 hours. We replaced 3 separate tools with one Selestial booking page.',
  },
];

function ReviewCard({
  name,
  role,
  initials,
  body,
}: (typeof REVIEWS)[number]) {
  return (
    <figure
      className={cn(
        'relative h-full w-72 sm:w-80 cursor-default overflow-hidden rounded-2xl border p-5',
        'border-gray-200 bg-white hover:bg-gray-50',
        'shadow-sm transition-all'
      )}
    >
      <div className="flex flex-row items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center text-white text-sm font-semibold">
          {initials}
        </div>
        <div className="flex flex-col">
          <figcaption className="text-sm font-semibold text-gray-900">{name}</figcaption>
          <p className="text-xs text-gray-500">{role}</p>
        </div>
      </div>
      <blockquote className="text-sm text-gray-600 leading-relaxed">&ldquo;{body}&rdquo;</blockquote>
    </figure>
  );
}

export function CustomerMarquee() {
  const firstHalf = REVIEWS.slice(0, Math.ceil(REVIEWS.length / 2));
  const secondHalf = REVIEWS.slice(Math.ceil(REVIEWS.length / 2));
  return (
    <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
      <Marquee pauseOnHover className="[--duration:30s]">
        {firstHalf.map((review) => (
          <ReviewCard key={review.name} {...review} />
        ))}
      </Marquee>
      <Marquee reverse pauseOnHover className="[--duration:35s] mt-4">
        {secondHalf.map((review) => (
          <ReviewCard key={review.name} {...review} />
        ))}
      </Marquee>
      {/* Edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/6 bg-gradient-to-r from-white" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/6 bg-gradient-to-l from-white" />
    </div>
  );
}
