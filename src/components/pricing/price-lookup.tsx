'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

// Flat pricing data for search
const PRICES = [
  // HVAC
  { industry: 'HVAC', job: 'Diagnostic', price: 89 },
  { industry: 'HVAC', job: 'AC Tune-Up', price: 129 },
  { industry: 'HVAC', job: 'Furnace Tune-Up', price: 129 },
  { industry: 'HVAC', job: 'Thermostat Install', price: 175 },
  { industry: 'HVAC', job: 'Capacitor Replace', price: 225 },
  { industry: 'HVAC', job: 'Blower Motor', price: 450 },
  { industry: 'HVAC', job: 'Refrigerant Recharge', price: 275 },
  { industry: 'HVAC', job: 'Coil Cleaning', price: 195 },
  { industry: 'HVAC', job: 'Duct Cleaning', price: 399 },
  { industry: 'HVAC', job: 'Mini Split Install', price: 3500 },
  { industry: 'HVAC', job: 'System Install', price: 7500 },
  
  // Plumbing
  { industry: 'Plumbing', job: 'Service Call', price: 99 },
  { industry: 'Plumbing', job: 'Drain Cleaning', price: 175 },
  { industry: 'Plumbing', job: 'Toilet Repair', price: 150 },
  { industry: 'Plumbing', job: 'Toilet Replace', price: 350 },
  { industry: 'Plumbing', job: 'Faucet Replace', price: 225 },
  { industry: 'Plumbing', job: 'Garbage Disposal', price: 275 },
  { industry: 'Plumbing', job: 'Water Heater Flush', price: 150 },
  { industry: 'Plumbing', job: 'Water Heater Install', price: 1200 },
  { industry: 'Plumbing', job: 'Tankless WH Install', price: 2500 },
  { industry: 'Plumbing', job: 'Leak Repair', price: 250 },
  
  // Electrical
  { industry: 'Electrical', job: 'Service Call', price: 99 },
  { industry: 'Electrical', job: 'Outlet Install', price: 150 },
  { industry: 'Electrical', job: 'GFCI Outlet', price: 175 },
  { industry: 'Electrical', job: 'Switch Replace', price: 125 },
  { industry: 'Electrical', job: 'Ceiling Fan', price: 225 },
  { industry: 'Electrical', job: 'Light Fixture', price: 175 },
  { industry: 'Electrical', job: 'Recessed Light', price: 200 },
  { industry: 'Electrical', job: 'Circuit Breaker', price: 200 },
  { industry: 'Electrical', job: 'Panel Upgrade', price: 2500 },
  
  // Cleaning
  { industry: 'Cleaning', job: 'Standard (1000sf)', price: 125 },
  { industry: 'Cleaning', job: 'Standard (1500sf)', price: 150 },
  { industry: 'Cleaning', job: 'Standard (2000sf)', price: 175 },
  { industry: 'Cleaning', job: 'Standard (2500sf)', price: 200 },
  { industry: 'Cleaning', job: 'Deep Clean (1500sf)', price: 275 },
  { industry: 'Cleaning', job: 'Deep Clean (2000sf)', price: 325 },
  { industry: 'Cleaning', job: 'Move-Out (1500sf)', price: 350 },
  { industry: 'Cleaning', job: 'Move-Out (2000sf)', price: 425 },
  { industry: 'Cleaning', job: 'Post-Construction', price: 500 },
  
  // Landscaping
  { industry: 'Landscaping', job: 'Mow (small)', price: 40 },
  { industry: 'Landscaping', job: 'Mow (medium)', price: 55 },
  { industry: 'Landscaping', job: 'Mow (large)', price: 75 },
  { industry: 'Landscaping', job: 'Leaf Cleanup', price: 150 },
  { industry: 'Landscaping', job: 'Mulch (per yard)', price: 85 },
  { industry: 'Landscaping', job: 'Hedge Trim', price: 150 },
  { industry: 'Landscaping', job: 'Tree Trim', price: 200 },
  { industry: 'Landscaping', job: 'Spring Cleanup', price: 275 },
  { industry: 'Landscaping', job: 'Fall Cleanup', price: 300 },
  
  // Painting
  { industry: 'Painting', job: 'Room (small)', price: 275 },
  { industry: 'Painting', job: 'Room (medium)', price: 350 },
  { industry: 'Painting', job: 'Room (large)', price: 450 },
  { industry: 'Painting', job: 'Bathroom', price: 300 },
  { industry: 'Painting', job: 'Kitchen', price: 500 },
  { industry: 'Painting', job: 'Interior (1500sf)', price: 2500 },
  { industry: 'Painting', job: 'Interior (2000sf)', price: 3200 },
  { industry: 'Painting', job: 'Exterior (1500sf)', price: 3500 },
  { industry: 'Painting', job: 'Exterior (2000sf)', price: 4500 },
  { industry: 'Painting', job: 'Cabinets', price: 3000 },
  
  // Pest Control
  { industry: 'Pest', job: 'Initial Treatment', price: 175 },
  { industry: 'Pest', job: 'Quarterly', price: 99 },
  { industry: 'Pest', job: 'Monthly', price: 75 },
  { industry: 'Pest', job: 'One-Time', price: 199 },
  { industry: 'Pest', job: 'Rodent Control', price: 250 },
  { industry: 'Pest', job: 'Termite Inspection', price: 125 },
  { industry: 'Pest', job: 'Termite Treatment', price: 1500 },
  { industry: 'Pest', job: 'Bed Bug', price: 500 },
  
  // Roofing
  { industry: 'Roofing', job: 'Inspection', price: 150 },
  { industry: 'Roofing', job: 'Emergency Tarp', price: 350 },
  { industry: 'Roofing', job: 'Leak Repair', price: 450 },
  { industry: 'Roofing', job: 'Shingle Repair', price: 275 },
  { industry: 'Roofing', job: 'Flashing Repair', price: 350 },
  { industry: 'Roofing', job: 'Gutter Clean', price: 175 },
  { industry: 'Roofing', job: 'Partial Reroof', price: 2500 },
  
  // Garage Door
  { industry: 'Garage', job: 'Service Call', price: 99 },
  { industry: 'Garage', job: 'Spring Replace', price: 275 },
  { industry: 'Garage', job: 'Cable Repair', price: 175 },
  { industry: 'Garage', job: 'Opener Repair', price: 175 },
  { industry: 'Garage', job: 'Opener Install', price: 450 },
  { industry: 'Garage', job: 'Panel Replace', price: 350 },
  { industry: 'Garage', job: 'Full Door (single)', price: 1200 },
  { industry: 'Garage', job: 'Full Door (double)', price: 1800 },
  
  // Pressure Washing
  { industry: 'Pressure', job: 'Driveway (2 car)', price: 150 },
  { industry: 'Pressure', job: 'Driveway (3 car)', price: 200 },
  { industry: 'Pressure', job: 'Patio/Deck', price: 175 },
  { industry: 'Pressure', job: 'House (1 story)', price: 275 },
  { industry: 'Pressure', job: 'House (2 story)', price: 400 },
  { industry: 'Pressure', job: 'Roof Soft Wash', price: 450 },
  { industry: 'Pressure', job: 'Full Property', price: 500 },
  
  // Pool
  { industry: 'Pool', job: 'Weekly Service', price: 125 },
  { industry: 'Pool', job: 'Bi-Weekly', price: 150 },
  { industry: 'Pool', job: 'One-Time Clean', price: 175 },
  { industry: 'Pool', job: 'Green to Clean', price: 350 },
  { industry: 'Pool', job: 'Filter Clean', price: 150 },
  { industry: 'Pool', job: 'Pump Replace', price: 600 },
  { industry: 'Pool', job: 'Opening', price: 225 },
  { industry: 'Pool', job: 'Closing', price: 250 },
];

interface PriceLookupProps {
  onSelect?: (price: number, job: string, industry: string) => void;
  triggerClassName?: string;
}

export function PriceLookup({ onSelect, triggerClassName }: PriceLookupProps) {
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<typeof PRICES[0] | null>(null);

  const handleSelect = (item: typeof PRICES[0]) => {
    setSelected(item);
    setOpen(false);
    onSelect?.(item.price, item.job, item.industry);
  };

  // Group by industry
  const grouped = PRICES.reduce((acc, item) => {
    if (!acc[item.industry]) acc[item.industry] = [];
    acc[item.industry].push(item);
    return acc;
  }, {} as Record<string, typeof PRICES>);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('justify-between', triggerClassName)}
        >
          {selected ? (
            <span>
              {selected.job} - <span className="font-bold">${selected.price}</span>
            </span>
          ) : (
            <span className="text-muted-foreground flex items-center">
              <Icon name="search" size="sm" className="mr-2" />
              Look up price...
            </span>
          )}
          <Icon name="chevronDown" size="sm" className="ml-2 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <Command>
          <CommandInput placeholder="Search jobs..." />
          <CommandList className="max-h-80">
            <CommandEmpty>No job found.</CommandEmpty>
            {Object.entries(grouped).map(([industry, jobs]) => (
              <CommandGroup key={industry} heading={industry}>
                {jobs.map((item) => (
                  <CommandItem
                    key={`${item.industry}-${item.job}`}
                    value={`${item.industry} ${item.job}`}
                    onSelect={() => handleSelect(item)}
                    className="flex justify-between"
                  >
                    <span>{item.job}</span>
                    <span className="font-bold text-primary">${item.price}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// Simple inline display
export function PriceTag({ 
  industry, 
  job 
}: { 
  industry: string; 
  job: string 
}) {
  const item = PRICES.find(
    (p) => p.industry.toLowerCase() === industry.toLowerCase() && 
           p.job.toLowerCase().includes(job.toLowerCase())
  );
  
  if (!item) return null;
  
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-primary/10 text-primary text-sm font-medium">
      ${item.price}
    </span>
  );
}

// Hook for programmatic access
export function useIndustryPrices(industry: string) {
  return PRICES.filter(
    (p) => p.industry.toLowerCase() === industry.toLowerCase()
  );
}

// Get single price
export function getPrice(industry: string, job: string): number | null {
  const item = PRICES.find(
    (p) => p.industry.toLowerCase() === industry.toLowerCase() && 
           p.job.toLowerCase().includes(job.toLowerCase())
  );
  return item?.price ?? null;
}

// Export raw data for Cursor/AI access
export { PRICES };
