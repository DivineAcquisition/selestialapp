"use client";

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icon, IconName } from '@/components/ui/icon';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useBusiness } from '@/contexts/BusinessContext';
import { cn } from '@/lib/utils';
import {
  ALL_TEMPLATES,
  BUSINESS_TYPES,
  getTemplatesForBucket,
  type SequenceTemplate,
  type BusinessBucket,
} from '@/lib/sequences/templates';

export default function SequenceTemplatesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { business } = useBusiness();
  
  const [selectedBucket, setSelectedBucket] = useState<BusinessBucket | 'all'>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<SequenceTemplate | null>(null);
  const [installing, setInstalling] = useState(false);
  
  // Determine the business's bucket based on industry
  const businessBucket = useMemo(() => {
    const industry = business?.industry;
    if (!industry) return null;
    
    // Map industry to bucket
    const emergencyIndustries = ['hvac', 'plumbing', 'electrical', 'garage_door', 'locksmith'];
    const scheduledIndustries = ['roofing', 'flooring', 'landscaping', 'painting', 'remodeling'];
    const recurringIndustries = ['cleaning', 'pest_control', 'window_cleaning', 'pool_service', 'lawn_care'];
    
    if (emergencyIndustries.includes(industry)) return 'emergency';
    if (scheduledIndustries.includes(industry)) return 'scheduled';
    if (recurringIndustries.includes(industry)) return 'recurring';
    return null;
  }, [business?.industry]);
  
  // Filter templates based on selected bucket
  const filteredTemplates = useMemo(() => {
    if (selectedBucket === 'all') {
      return ALL_TEMPLATES;
    }
    return getTemplatesForBucket(selectedBucket);
  }, [selectedBucket]);
  
  // Get bucket info
  const getBucketInfo = (bucket: BusinessBucket | 'universal') => {
    if (bucket === 'universal') {
      return { name: 'Universal', color: 'gray', icon: 'globe' as IconName };
    }
    const info = BUSINESS_TYPES.find(b => b.id === bucket);
    return {
      name: info?.name || bucket,
      color: info?.color || 'gray',
      icon: info?.icon as IconName || 'briefcase',
    };
  };
  
  // Install template
  const handleInstall = async () => {
    if (!selectedTemplate) return;
    
    setInstalling(true);
    
    try {
      const response = await fetch('/api/sequences/templates/install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId: selectedTemplate.id }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to install template');
      }
      
      const { sequence } = await response.json();
      
      toast({
        title: 'Template installed',
        description: `"${selectedTemplate.name}" has been added to your sequences`,
      });
      
      setSelectedTemplate(null);
      router.push(`/sequences/${sequence.id}`);
    } catch (error) {
      toast({
        title: 'Installation failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setInstalling(false);
    }
  };
  
  return (
    <Layout title="Sequence Templates">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => router.push('/sequences')}
              className="rounded-xl"
            >
              <Icon name="arrowLeft" size="lg" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Sequence Templates</h1>
              <p className="text-gray-500">Pre-built automation workflows for your business type</p>
            </div>
          </div>
        </div>
        
        {/* Business Type Recommendation */}
        {businessBucket && (
          <Card className="card-elevated p-4 bg-gradient-to-r from-primary/5 to-[#9D96FF]/5 border-primary/20">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <Icon name="sparkles" size="lg" className="text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  Recommended for your business
                </p>
                <p className="text-sm text-gray-500">
                  Based on your {business?.industry} business, we recommend {getBucketInfo(businessBucket).name} templates
                </p>
              </div>
              <Button 
                variant="outline" 
                className="rounded-xl"
                onClick={() => setSelectedBucket(businessBucket)}
              >
                View Recommended
              </Button>
            </div>
          </Card>
        )}
        
        {/* Bucket Filters */}
        <div className="flex items-center gap-3">
          <Button
            variant={selectedBucket === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedBucket('all')}
            className="rounded-xl"
          >
            All Templates
          </Button>
          {BUSINESS_TYPES.map((type) => (
            <Button
              key={type.id}
              variant={selectedBucket === type.id ? 'default' : 'outline'}
              onClick={() => setSelectedBucket(type.id)}
              className={cn(
                "rounded-xl gap-2",
                selectedBucket === type.id && type.color === 'red' && "bg-red-500 hover:bg-red-600",
                selectedBucket === type.id && type.color === 'blue' && "bg-blue-500 hover:bg-blue-600",
                selectedBucket === type.id && type.color === 'green' && "bg-emerald-500 hover:bg-emerald-600",
              )}
            >
              <Icon name={type.icon as IconName} size="sm" />
              {type.name}
            </Button>
          ))}
        </div>
        
        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => {
            const bucketInfo = getBucketInfo(template.bucket);
            const isRecommended = template.bucket === businessBucket || template.bucket === 'universal';
            
            return (
              <Card 
                key={template.id}
                className="card-elevated p-5 hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => setSelectedTemplate(template)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    template.bucket === 'emergency' && "bg-red-100 text-red-600",
                    template.bucket === 'scheduled' && "bg-blue-100 text-blue-600",
                    template.bucket === 'recurring' && "bg-emerald-100 text-emerald-600",
                    template.bucket === 'universal' && "bg-gray-100 text-gray-600",
                  )}>
                    <Icon name={bucketInfo.icon} size="xl" />
                  </div>
                  
                  {isRecommended && (
                    <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs">
                      <Icon name="sparkles" size="xs" className="mr-1" />
                      Recommended
                    </Badge>
                  )}
                </div>
                
                <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-primary transition-colors">
                  {template.name}
                </h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                  {template.description}
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-400 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Icon name="list" size="xs" />
                      {template.steps.length} steps
                    </span>
                    <Badge variant="outline" className="text-[10px] capitalize">
                      {template.bucket}
                    </Badge>
                  </div>
                  
                  {template.metrics?.target_conversion && (
                    <span className="flex items-center gap-1 text-emerald-600">
                      <Icon name="trendUp" size="xs" />
                      {template.metrics.target_conversion}% target
                    </span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
      
      {/* Template Preview Dialog */}
      <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl">
          {selectedTemplate && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    selectedTemplate.bucket === 'emergency' && "bg-red-100 text-red-600",
                    selectedTemplate.bucket === 'scheduled' && "bg-blue-100 text-blue-600",
                    selectedTemplate.bucket === 'recurring' && "bg-emerald-100 text-emerald-600",
                    selectedTemplate.bucket === 'universal' && "bg-gray-100 text-gray-600",
                  )}>
                    <Icon name={getBucketInfo(selectedTemplate.bucket).icon} size="lg" />
                  </div>
                  {selectedTemplate.name}
                </DialogTitle>
                <DialogDescription>
                  {selectedTemplate.description}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                {/* Metrics */}
                {selectedTemplate.metrics && (
                  <div className="grid grid-cols-2 gap-4">
                    {selectedTemplate.metrics.target_conversion && (
                      <div className="p-4 bg-emerald-50 rounded-xl">
                        <p className="text-2xl font-bold text-emerald-600">
                          {selectedTemplate.metrics.target_conversion}%
                        </p>
                        <p className="text-sm text-emerald-700">Target Conversion</p>
                      </div>
                    )}
                    {selectedTemplate.metrics.avg_completion_days && (
                      <div className="p-4 bg-blue-50 rounded-xl">
                        <p className="text-2xl font-bold text-blue-600">
                          {selectedTemplate.metrics.avg_completion_days} days
                        </p>
                        <p className="text-sm text-blue-700">Avg. Duration</p>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Steps Preview */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Sequence Steps</h4>
                  <div className="space-y-3">
                    {selectedTemplate.steps.map((step, index) => (
                      <div 
                        key={index}
                        className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl"
                      >
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary flex-shrink-0">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs capitalize">
                              {step.action}
                            </Badge>
                            <span className="text-xs text-gray-400">
                              {step.delay.type === 'immediate' 
                                ? 'Immediately' 
                                : `After ${step.delay.value} ${step.delay.type}`}
                            </span>
                          </div>
                          {step.name && (
                            <p className="font-medium text-gray-900 text-sm">{step.name}</p>
                          )}
                          {step.message && (
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                              {step.message.substring(0, 100)}...
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Exit Conditions */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Exit Conditions</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTemplate.exit_on.map((condition, index) => (
                      <Badge key={index} variant="outline" className="capitalize">
                        {condition.replace(/_/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedTemplate(null)}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleInstall}
                  disabled={installing}
                  className="gap-2 rounded-xl bg-gradient-to-r from-primary to-[#9D96FF] hover:opacity-90"
                >
                  {installing ? (
                    <>
                      <Icon name="spinner" size="sm" className="animate-spin" />
                      Installing...
                    </>
                  ) : (
                    <>
                      <Icon name="download" size="sm" />
                      Install Template
                    </>
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
