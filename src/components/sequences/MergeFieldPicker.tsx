import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { MERGE_FIELDS } from '@/lib/constants';
import { Icon } from '@/components/ui/icon';

interface MergeFieldPickerProps {
  onSelect: (field: string) => void;
}

export default function MergeFieldPicker({ onSelect }: MergeFieldPickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <Icon name="plus" size="xs" />
          Insert Field
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="end">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground px-2 py-1">
            Click to insert
          </p>
          {MERGE_FIELDS.map((field) => (
            <button
              key={field.key}
              className="w-full text-left px-2 py-1.5 rounded text-sm hover:bg-muted transition-colors"
              onClick={() => onSelect(field.key)}
            >
              <span className="font-mono text-xs text-primary">{field.key}</span>
              <span className="text-muted-foreground ml-2">→ {field.example}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
