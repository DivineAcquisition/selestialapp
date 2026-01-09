'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { toast } from 'sonner';

// PRICING DATA - All industry pricing in one place
const PRICING = {
  hvac: {
    name: 'HVAC',
    jobs: [
      { name: 'Diagnostic/Service Call', price: 89, time: '1 hr' },
      { name: 'AC Tune-Up', price: 129, time: '1-1.5 hrs' },
      { name: 'Furnace Tune-Up', price: 129, time: '1-1.5 hrs' },
      { name: 'Filter Replacement', price: 49, time: '15 min' },
      { name: 'Thermostat Install', price: 175, time: '1 hr' },
      { name: 'Capacitor Replace', price: 225, time: '1 hr' },
      { name: 'Blower Motor Repair', price: 450, time: '2 hrs' },
      { name: 'Refrigerant Recharge', price: 275, time: '1 hr' },
      { name: 'Coil Cleaning', price: 195, time: '1.5 hrs' },
      { name: 'Duct Cleaning', price: 399, time: '3-4 hrs' },
      { name: 'Mini Split Install', price: 3500, time: '1 day' },
      { name: 'Full System Install', price: 7500, time: '1-2 days' },
    ],
  },
  plumbing: {
    name: 'Plumbing',
    jobs: [
      { name: 'Service Call', price: 99, time: '1 hr' },
      { name: 'Drain Cleaning', price: 175, time: '1-2 hrs' },
      { name: 'Toilet Repair', price: 150, time: '1 hr' },
      { name: 'Toilet Replace', price: 350, time: '2 hrs' },
      { name: 'Faucet Replace', price: 225, time: '1 hr' },
      { name: 'Garbage Disposal', price: 275, time: '1 hr' },
      { name: 'Water Heater Flush', price: 150, time: '1 hr' },
      { name: 'Water Heater Install', price: 1200, time: '3-4 hrs' },
      { name: 'Tankless WH Install', price: 2500, time: '4-6 hrs' },
      { name: 'Leak Repair', price: 250, time: '1-2 hrs' },
      { name: 'Sewer Line Camera', price: 275, time: '1 hr' },
      { name: 'Repipe (per fixture)', price: 450, time: 'varies' },
    ],
  },
  electrical: {
    name: 'Electrical',
    jobs: [
      { name: 'Service Call', price: 99, time: '1 hr' },
      { name: 'Outlet Install', price: 150, time: '30 min' },
      { name: 'GFCI Outlet', price: 175, time: '30 min' },
      { name: 'Switch Replace', price: 125, time: '30 min' },
      { name: 'Dimmer Install', price: 150, time: '30 min' },
      { name: 'Ceiling Fan Install', price: 225, time: '1-2 hrs' },
      { name: 'Light Fixture', price: 175, time: '1 hr' },
      { name: 'Recessed Light (each)', price: 200, time: '1 hr' },
      { name: 'Panel Inspection', price: 150, time: '1 hr' },
      { name: 'Circuit Breaker', price: 200, time: '1 hr' },
      { name: 'Whole House Surge', price: 350, time: '2 hrs' },
      { name: 'Panel Upgrade', price: 2500, time: '6-8 hrs' },
    ],
  },
  roofing: {
    name: 'Roofing',
    jobs: [
      { name: 'Inspection', price: 150, time: '1 hr' },
      { name: 'Emergency Tarp', price: 350, time: '2 hrs' },
      { name: 'Leak Repair', price: 450, time: '2-4 hrs' },
      { name: 'Shingle Repair (10 sq ft)', price: 275, time: '2 hrs' },
      { name: 'Flashing Repair', price: 350, time: '2 hrs' },
      { name: 'Gutter Clean', price: 175, time: '2 hrs' },
      { name: 'Gutter Repair', price: 275, time: '2-3 hrs' },
      { name: 'Skylight Repair', price: 450, time: '3 hrs' },
      { name: 'Partial Reroof', price: 2500, time: '1 day' },
      { name: 'Full Reroof (per sq)', price: 450, time: 'varies' },
    ],
  },
  cleaning: {
    name: 'Cleaning',
    jobs: [
      { name: 'Standard Clean (1000 sqft)', price: 125, time: '2 hrs' },
      { name: 'Standard Clean (1500 sqft)', price: 150, time: '2.5 hrs' },
      { name: 'Standard Clean (2000 sqft)', price: 175, time: '3 hrs' },
      { name: 'Standard Clean (2500 sqft)', price: 200, time: '3.5 hrs' },
      { name: 'Deep Clean (1000 sqft)', price: 225, time: '4 hrs' },
      { name: 'Deep Clean (1500 sqft)', price: 275, time: '5 hrs' },
      { name: 'Deep Clean (2000 sqft)', price: 325, time: '6 hrs' },
      { name: 'Move-In/Out (1500 sqft)', price: 350, time: '5-6 hrs' },
      { name: 'Move-In/Out (2000 sqft)', price: 425, time: '6-7 hrs' },
      { name: 'Post-Construction', price: 500, time: '6-8 hrs' },
      { name: 'Office (per 1000 sqft)', price: 150, time: '2 hrs' },
    ],
  },
  landscaping: {
    name: 'Landscaping',
    jobs: [
      { name: 'Lawn Mow (small)', price: 40, time: '30 min' },
      { name: 'Lawn Mow (medium)', price: 55, time: '45 min' },
      { name: 'Lawn Mow (large)', price: 75, time: '1 hr' },
      { name: 'Edging & Trimming', price: 45, time: '30 min' },
      { name: 'Leaf Cleanup', price: 150, time: '2 hrs' },
      { name: 'Mulch Install (per yard)', price: 85, time: 'varies' },
      { name: 'Bush/Hedge Trim', price: 150, time: '2 hrs' },
      { name: 'Tree Trim (small)', price: 200, time: '2 hrs' },
      { name: 'Sod Install (per sqft)', price: 2, time: 'varies' },
      { name: 'Sprinkler Repair', price: 125, time: '1 hr' },
      { name: 'Spring Cleanup', price: 275, time: '3-4 hrs' },
      { name: 'Fall Cleanup', price: 300, time: '3-4 hrs' },
    ],
  },
  painting: {
    name: 'Painting',
    jobs: [
      { name: 'Single Room (small)', price: 275, time: '4-5 hrs' },
      { name: 'Single Room (medium)', price: 350, time: '5-6 hrs' },
      { name: 'Single Room (large)', price: 450, time: '6-8 hrs' },
      { name: 'Bathroom', price: 300, time: '4-5 hrs' },
      { name: 'Kitchen', price: 500, time: '1 day' },
      { name: 'Accent Wall', price: 175, time: '3 hrs' },
      { name: 'Interior (1500 sqft)', price: 2500, time: '3-4 days' },
      { name: 'Interior (2000 sqft)', price: 3200, time: '4-5 days' },
      { name: 'Exterior (1500 sqft)', price: 3500, time: '3-4 days' },
      { name: 'Exterior (2000 sqft)', price: 4500, time: '4-5 days' },
      { name: 'Cabinet Refinish', price: 3000, time: '3-5 days' },
      { name: 'Deck Stain', price: 500, time: '1 day' },
    ],
  },
  pest: {
    name: 'Pest Control',
    jobs: [
      { name: 'Initial Treatment', price: 175, time: '1 hr' },
      { name: 'Quarterly Service', price: 99, time: '30 min' },
      { name: 'Monthly Service', price: 75, time: '30 min' },
      { name: 'One-Time Treatment', price: 199, time: '1 hr' },
      { name: 'Ant Treatment', price: 175, time: '1 hr' },
      { name: 'Roach Treatment', price: 200, time: '1-2 hrs' },
      { name: 'Rodent Control', price: 250, time: '1 hr' },
      { name: 'Termite Inspection', price: 125, time: '1 hr' },
      { name: 'Termite Treatment', price: 1500, time: '4-6 hrs' },
      { name: 'Bed Bug Treatment', price: 500, time: '3-4 hrs' },
      { name: 'Mosquito Treatment', price: 125, time: '30 min' },
      { name: 'Wildlife Removal', price: 350, time: 'varies' },
    ],
  },
  garage: {
    name: 'Garage Door',
    jobs: [
      { name: 'Service Call', price: 99, time: '1 hr' },
      { name: 'Spring Replacement', price: 275, time: '1-2 hrs' },
      { name: 'Cable Repair', price: 175, time: '1 hr' },
      { name: 'Roller Replace', price: 150, time: '1 hr' },
      { name: 'Track Alignment', price: 125, time: '1 hr' },
      { name: 'Opener Repair', price: 175, time: '1 hr' },
      { name: 'Opener Install', price: 450, time: '2-3 hrs' },
      { name: 'Keypad Install', price: 150, time: '30 min' },
      { name: 'Safety Sensor', price: 175, time: '1 hr' },
      { name: 'Panel Replace', price: 350, time: '2 hrs' },
      { name: 'Full Door (single)', price: 1200, time: '4-5 hrs' },
      { name: 'Full Door (double)', price: 1800, time: '5-6 hrs' },
    ],
  },
  pressure: {
    name: 'Pressure Washing',
    jobs: [
      { name: 'Driveway (2 car)', price: 150, time: '1-2 hrs' },
      { name: 'Driveway (3 car)', price: 200, time: '2 hrs' },
      { name: 'Sidewalk', price: 75, time: '30 min' },
      { name: 'Patio/Deck (small)', price: 150, time: '1 hr' },
      { name: 'Patio/Deck (large)', price: 225, time: '2 hrs' },
      { name: 'House Wash (1 story)', price: 275, time: '2 hrs' },
      { name: 'House Wash (2 story)', price: 400, time: '3 hrs' },
      { name: 'Fence (per 100 ft)', price: 150, time: '1 hr' },
      { name: 'Roof Soft Wash', price: 450, time: '3 hrs' },
      { name: 'Gutter Brightening', price: 200, time: '2 hrs' },
      { name: 'Full Property Bundle', price: 500, time: '4 hrs' },
    ],
  },
  pool: {
    name: 'Pool Service',
    jobs: [
      { name: 'Weekly Service', price: 125, time: '45 min' },
      { name: 'Bi-Weekly Service', price: 150, time: '1 hr' },
      { name: 'One-Time Clean', price: 175, time: '1-2 hrs' },
      { name: 'Green to Clean', price: 350, time: '3-4 hrs' },
      { name: 'Filter Clean (cartridge)', price: 125, time: '1 hr' },
      { name: 'Filter Clean (DE)', price: 175, time: '1.5 hrs' },
      { name: 'Pump Repair', price: 225, time: '2 hrs' },
      { name: 'Pump Replace', price: 600, time: '2-3 hrs' },
      { name: 'Heater Repair', price: 275, time: '2 hrs' },
      { name: 'Salt Cell Replace', price: 450, time: '1 hr' },
      { name: 'Acid Wash', price: 500, time: '4-6 hrs' },
      { name: 'Pool Opening', price: 225, time: '2 hrs' },
      { name: 'Pool Closing', price: 250, time: '2 hrs' },
    ],
  },
  window: {
    name: 'Window Cleaning',
    jobs: [
      { name: 'Interior Only (10 win)', price: 100, time: '1 hr' },
      { name: 'Interior Only (20 win)', price: 175, time: '2 hrs' },
      { name: 'Exterior Only (10 win)', price: 125, time: '1.5 hrs' },
      { name: 'Exterior Only (20 win)', price: 200, time: '2.5 hrs' },
      { name: 'In/Out (10 windows)', price: 175, time: '2 hrs' },
      { name: 'In/Out (20 windows)', price: 300, time: '3.5 hrs' },
      { name: 'In/Out (30 windows)', price: 400, time: '5 hrs' },
      { name: 'Screen Cleaning (each)', price: 5, time: '5 min' },
      { name: 'Track Cleaning', price: 75, time: '1 hr' },
      { name: 'Hard Water Removal', price: 15, time: 'per window' },
      { name: 'Storefront (per pane)', price: 8, time: '5 min' },
    ],
  },
};

type IndustryKey = keyof typeof PRICING;

interface QuickPriceProps {
  onSelectPrice?: (price: number, jobName: string, industry: string) => void;
}

export function QuickPrice({ onSelectPrice }: QuickPriceProps) {
  const [industry, setIndustry] = React.useState<IndustryKey | null>(null);
  const [selectedJob, setSelectedJob] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState<string | null>(null);

  const data = industry ? PRICING[industry] : null;

  const copyPrice = (price: number, jobName: string) => {
    navigator.clipboard.writeText(`$${price}`);
    setCopied(jobName);
    toast.success(`$${price} copied`);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSelect = (job: { name: string; price: number }) => {
    setSelectedJob(job.name);
    if (onSelectPrice && data) {
      onSelectPrice(job.price, job.name, data.name);
    }
  };

  return (
    <div className="space-y-4">
      {/* Industry Pills */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(PRICING).map(([key, val]) => (
          <button
            key={key}
            onClick={() => {
              setIndustry(key as IndustryKey);
              setSelectedJob(null);
            }}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
              industry === key
                ? 'bg-violet-600 text-white'
                : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
            )}
          >
            {val.name}
          </button>
        ))}
      </div>

      {/* Jobs Grid */}
      {data && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2"
        >
          {data.jobs.map((job) => (
            <button
              key={job.name}
              onClick={() => handleSelect(job)}
              className={cn(
                'flex items-center justify-between p-3 rounded-lg border text-left transition-all group',
                selectedJob === job.name
                  ? 'border-violet-600 bg-violet-50 ring-1 ring-violet-600'
                  : 'hover:border-violet-300 hover:bg-muted/50'
              )}
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm truncate">{job.name}</p>
                <p className="text-xs text-muted-foreground">{job.time}</p>
              </div>
              <div className="flex items-center gap-2 ml-2">
                <span className="font-bold text-violet-600">${job.price}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    copyPrice(job.price, job.name);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-violet-100 rounded"
                >
                  {copied === job.name ? (
                    <Icon name="check" size="sm" className="text-emerald-600" />
                  ) : (
                    <Icon name="copy" size="sm" className="text-muted-foreground" />
                  )}
                </button>
              </div>
            </button>
          ))}
        </motion.div>
      )}

      {/* Empty State */}
      {!industry && (
        <div className="text-center py-8 text-muted-foreground">
          <Icon name="sparkles" size="2xl" className="mx-auto mb-2 opacity-50" />
          <p className="text-sm">Select an industry above</p>
        </div>
      )}
    </div>
  );
}

// Export the pricing data for use elsewhere
export { PRICING };
