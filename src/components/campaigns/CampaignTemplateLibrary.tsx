import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useCampaigns, CampaignTemplate } from '@/hooks/useCampaigns';
import { Loader2, Layout, Calendar, Tag, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CampaignTemplateLibraryProps {
  open: boolean;
  onClose: () => void;
  onSelect: (template: CampaignTemplate) => void;
}

export default function CampaignTemplateLibrary({ open, onClose, onSelect }: CampaignTemplateLibraryProps) {
  const { templates, templatesLoading, fetchTemplates } = useCampaigns();

  useEffect(() => {
    if (open) {
      fetchTemplates();
    }
  }, [open, fetchTemplates]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'seasonal': return 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400';
      case 'holiday': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'slow_season': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getSeasonIcon = (season: string | null) => {
    switch (season) {
      case 'spring': return <Calendar className="w-4 h-4 text-pink-500" />;
      case 'summer': return <Calendar className="w-4 h-4 text-amber-500" />;
      case 'fall': return <Calendar className="w-4 h-4 text-orange-500" />;
      case 'winter': return <Calendar className="w-4 h-4 text-blue-500" />;
      default: return <Calendar className="w-4 h-4 text-gray-500" />;
    }
  };

  const groupedTemplates = templates.reduce((acc, template) => {
    const key = template.campaign_type;
    if (!acc[key]) acc[key] = [];
    acc[key].push(template);
    return acc;
  }, {} as Record<string, CampaignTemplate[]>);

  const typeLabels: Record<string, string> = {
    holiday: 'Holiday Campaigns',
    seasonal: 'Seasonal Campaigns',
    slow_season: 'Slow Season Campaigns',
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layout className="w-5 h-5 text-primary" />
            Campaign Templates
          </DialogTitle>
          <DialogDescription>
            Pre-built campaigns optimized for your industry. Select one to customize.
          </DialogDescription>
        </DialogHeader>

        {templatesLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-8 py-4">
            {Object.entries(typeLabels).map(([type, label]) => {
              const typeTemplates = groupedTemplates[type];
              if (!typeTemplates?.length) return null;

              return (
                <div key={type}>
                  <h3 className="font-semibold text-lg mb-4">{label}</h3>
                  <div className="grid gap-3">
                    {typeTemplates.map((template) => (
                      <div
                        key={template.id}
                        className="group p-4 border rounded-xl hover:border-primary/50 hover:bg-accent/50 transition-all cursor-pointer"
                        onClick={() => onSelect(template)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="flex items-center justify-center">{getSeasonIcon(template.season)}</span>
                              <h4 className="font-medium text-foreground">{template.name}</h4>
                              <Badge className={cn('text-xs', getTypeColor(template.campaign_type))}>
                                {template.campaign_type}
                              </Badge>
                              {template.industry_slug && (
                                <Badge variant="outline" className="text-xs">
                                  {template.industry_slug.replace('_', ' ')}
                                </Badge>
                              )}
                            </div>
                            {template.description && (
                              <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                            )}
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              {template.month && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  Month {template.month}
                                </span>
                              )}
                              {template.suggested_promotion_type && (
                                <span className="flex items-center gap-1">
                                  <Tag className="w-3 h-3" />
                                  {template.suggested_promotion_value}% off suggested
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-3 p-3 bg-muted/50 rounded-lg line-clamp-2">
                              {template.sms_template}
                            </p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
