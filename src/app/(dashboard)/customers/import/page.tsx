"use client";

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type ImportStep = 'upload' | 'map' | 'review' | 'complete';

interface ColumnMapping {
  csvColumn: string;
  dbField: string;
}

interface ImportPreview {
  headers: string[];
  rows: string[][];
  totalRows: number;
}

const DB_FIELDS = [
  { value: 'skip', label: 'Skip this column' },
  { value: 'first_name', label: 'First Name', required: true },
  { value: 'last_name', label: 'Last Name' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone', required: true },
  { value: 'address_line1', label: 'Street Address' },
  { value: 'address_line2', label: 'Address Line 2' },
  { value: 'city', label: 'City' },
  { value: 'state', label: 'State' },
  { value: 'zip_code', label: 'ZIP Code' },
  { value: 'source', label: 'Lead Source' },
  { value: 'notes', label: 'Notes' },
  { value: 'tags', label: 'Tags (comma-separated)' },
];

export default function CustomerImportPage() {
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [step, setStep] = useState<ImportStep>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [mappings, setMappings] = useState<ColumnMapping[]>([]);
  const [duplicateHandling, setDuplicateHandling] = useState<'skip' | 'update' | 'create_new'>('skip');
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState<{
    success: number;
    skipped: number;
    errors: number;
    errorMessages: string[];
  } | null>(null);
  
  // Parse CSV file
  const parseCSV = useCallback((text: string): ImportPreview => {
    const lines = text.split(/\r?\n/).filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const rows = lines.slice(1, 11).map(line => {
      // Simple CSV parsing - handles quoted values
      const values: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (const char of line) {
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());
      return values;
    });
    
    return {
      headers,
      rows,
      totalRows: lines.length - 1,
    };
  }, []);
  
  // Handle file selection
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    if (!selectedFile.name.endsWith('.csv')) {
      toast({ title: 'Please select a CSV file', variant: 'destructive' });
      return;
    }
    
    setFile(selectedFile);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const parsed = parseCSV(text);
      setPreview(parsed);
      
      // Auto-map columns based on header names
      const autoMappings: ColumnMapping[] = parsed.headers.map(header => {
        const headerLower = header.toLowerCase().replace(/[^a-z0-9]/g, '');
        
        // Try to match headers to database fields
        const match = DB_FIELDS.find(field => {
          const fieldLower = field.value.replace(/_/g, '');
          return headerLower.includes(fieldLower) || fieldLower.includes(headerLower);
        });
        
        return {
          csvColumn: header,
          dbField: match?.value || 'skip',
        };
      });
      
      setMappings(autoMappings);
      setStep('map');
    };
    reader.readAsText(selectedFile);
  }, [parseCSV, toast]);
  
  // Handle drag and drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && fileInputRef.current) {
      // Create a DataTransfer to set the file
      const dt = new DataTransfer();
      dt.items.add(droppedFile);
      fileInputRef.current.files = dt.files;
      handleFileSelect({ target: fileInputRef.current } as React.ChangeEvent<HTMLInputElement>);
    }
  }, [handleFileSelect]);
  
  // Update column mapping
  const updateMapping = useCallback((index: number, dbField: string) => {
    setMappings(prev => prev.map((m, i) => 
      i === index ? { ...m, dbField } : m
    ));
  }, []);
  
  // Validate mappings
  const validateMappings = useCallback(() => {
    const hasFirstName = mappings.some(m => m.dbField === 'first_name');
    const hasContact = mappings.some(m => m.dbField === 'phone' || m.dbField === 'email');
    
    if (!hasFirstName) {
      toast({ title: 'Please map a column to First Name', variant: 'destructive' });
      return false;
    }
    
    if (!hasContact) {
      toast({ title: 'Please map a column to Phone or Email', variant: 'destructive' });
      return false;
    }
    
    return true;
  }, [mappings, toast]);
  
  // Handle import
  const handleImport = useCallback(async () => {
    if (!file || !preview) return;
    
    setImporting(true);
    setImportProgress(0);
    
    try {
      const reader = new FileReader();
      const text = await new Promise<string>((resolve) => {
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsText(file);
      });
      
      const lines = text.split(/\r?\n/).filter(line => line.trim());
      const dataRows = lines.slice(1);
      
      const results = {
        success: 0,
        skipped: 0,
        errors: 0,
        errorMessages: [] as string[],
      };
      
      // Process in batches
      const batchSize = 50;
      for (let i = 0; i < dataRows.length; i += batchSize) {
        const batch = dataRows.slice(i, i + batchSize);
        
        // Parse batch rows
        const customers = batch.map((line, rowIndex) => {
          const values: string[] = [];
          let current = '';
          let inQuotes = false;
          
          for (const char of line) {
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              values.push(current.trim());
              current = '';
            } else {
              current += char;
            }
          }
          values.push(current.trim());
          
          // Map values to fields
          const customer: Record<string, string> = {};
          mappings.forEach((mapping, colIndex) => {
            if (mapping.dbField !== 'skip' && values[colIndex]) {
              customer[mapping.dbField] = values[colIndex];
            }
          });
          
          return { ...customer, _row: i + rowIndex + 2 };
        });
        
        // Send to API
        try {
          const response = await fetch('/api/customers/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              customers,
              duplicateHandling,
            }),
          });
          
          const data = await response.json();
          
          if (response.ok) {
            results.success += data.imported || 0;
            results.skipped += data.skipped || 0;
            results.errors += data.errors || 0;
            if (data.errorMessages) {
              results.errorMessages.push(...data.errorMessages);
            }
          } else {
            results.errors += batch.length;
            results.errorMessages.push(data.error || 'Unknown error');
          }
        } catch {
          results.errors += batch.length;
          results.errorMessages.push('Network error during import');
        }
        
        setImportProgress(Math.min(100, Math.round(((i + batch.length) / dataRows.length) * 100)));
      }
      
      setImportResults(results);
      setStep('complete');
      
      toast({
        title: 'Import complete',
        description: `${results.success} customers imported successfully`,
      });
    } catch (error) {
      toast({
        title: 'Import failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setImporting(false);
    }
  }, [file, preview, mappings, duplicateHandling, toast]);
  
  return (
    <Layout title="Import Customers">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => router.push('/customers')}
              className="rounded-xl"
            >
              <Icon name="arrowLeft" size="lg" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Import Customers</h1>
              <p className="text-gray-500">Upload a CSV file to import customers in bulk</p>
            </div>
          </div>
        </div>
        
        {/* Progress Steps */}
        <div className="flex items-center gap-2">
          {['upload', 'map', 'review', 'complete'].map((s, i) => (
            <div key={s} className="flex items-center">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                step === s
                  ? "bg-primary text-white"
                  : ['upload', 'map', 'review', 'complete'].indexOf(step) > i
                    ? "bg-emerald-500 text-white"
                    : "bg-gray-100 text-gray-500"
              )}>
                {['upload', 'map', 'review', 'complete'].indexOf(step) > i ? (
                  <Icon name="check" size="sm" />
                ) : (
                  i + 1
                )}
              </div>
              {i < 3 && (
                <div className={cn(
                  "w-12 h-1 mx-1",
                  ['upload', 'map', 'review', 'complete'].indexOf(step) > i
                    ? "bg-emerald-500"
                    : "bg-gray-200"
                )} />
              )}
            </div>
          ))}
        </div>
        
        {/* Upload Step */}
        {step === 'upload' && (
          <Card className="card-elevated p-8">
            <div 
              className="border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center hover:border-primary/50 transition-colors cursor-pointer"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Icon name="upload" size="2xl" className="text-primary" />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Upload your CSV file
              </h3>
              <p className="text-gray-500 mb-4">
                Drag and drop or click to browse
              </p>
              
              <Badge variant="outline" className="text-sm">
                Supports .csv files up to 10MB
              </Badge>
            </div>
            
            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
              <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <Icon name="info" size="sm" className="text-primary" />
                CSV Format Tips
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• First row should contain column headers</li>
                <li>• Required: First Name and either Phone or Email</li>
                <li>• Dates should be in YYYY-MM-DD format</li>
                <li>• Phone numbers can include formatting (we&apos;ll clean them)</li>
              </ul>
            </div>
          </Card>
        )}
        
        {/* Map Columns Step */}
        {step === 'map' && preview && (
          <Card className="card-elevated p-0 overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Map Your Columns</h2>
              <p className="text-sm text-gray-500 mt-1">
                Match your CSV columns to customer fields. We&apos;ve auto-detected some matches.
              </p>
            </div>
            
            <div className="p-5">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Your Column</TableHead>
                    <TableHead>Sample Data</TableHead>
                    <TableHead>Map To</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {preview.headers.map((header, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{header}</TableCell>
                      <TableCell className="text-gray-500">
                        {preview.rows[0]?.[index] || '-'}
                      </TableCell>
                      <TableCell>
                        <Select 
                          value={mappings[index]?.dbField || 'skip'}
                          onValueChange={(v) => updateMapping(index, v)}
                        >
                          <SelectTrigger className="w-[200px] rounded-lg">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {DB_FIELDS.map(field => (
                              <SelectItem key={field.value} value={field.value}>
                                {field.label}
                                {field.required && <span className="text-red-500 ml-1">*</span>}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            <div className="p-5 border-t border-gray-100 flex justify-between">
              <Button variant="outline" onClick={() => setStep('upload')} className="rounded-xl">
                <Icon name="arrowLeft" size="sm" className="mr-2" />
                Back
              </Button>
              <Button 
                onClick={() => validateMappings() && setStep('review')}
                className="rounded-xl bg-gradient-to-r from-primary to-[#9D96FF] hover:opacity-90"
              >
                Continue
                <Icon name="arrowRight" size="sm" className="ml-2" />
              </Button>
            </div>
          </Card>
        )}
        
        {/* Review Step */}
        {step === 'review' && preview && (
          <Card className="card-elevated p-0 overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Review & Import</h2>
              <p className="text-sm text-gray-500 mt-1">
                Preview the first 10 rows before importing all {preview.totalRows} customers.
              </p>
            </div>
            
            <div className="p-5 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {mappings.filter(m => m.dbField !== 'skip').map((m, i) => (
                      <TableHead key={i}>
                        {DB_FIELDS.find(f => f.value === m.dbField)?.label}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {preview.rows.map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {mappings.map((m, colIndex) => {
                        if (m.dbField === 'skip') return null;
                        return (
                          <TableCell key={colIndex}>
                            {row[colIndex] || '-'}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            <div className="p-5 border-t border-gray-100">
              <div className="flex items-center gap-4 mb-4">
                <label className="text-sm font-medium text-gray-700">
                  Handle duplicates:
                </label>
                <Select value={duplicateHandling} onValueChange={(v) => setDuplicateHandling(v as 'skip' | 'update' | 'create_new')}>
                  <SelectTrigger className="w-[200px] rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="skip">Skip duplicates</SelectItem>
                    <SelectItem value="update">Update existing</SelectItem>
                    <SelectItem value="create_new">Create new anyway</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep('map')} className="rounded-xl">
                  <Icon name="arrowLeft" size="sm" className="mr-2" />
                  Back
                </Button>
                <Button 
                  onClick={handleImport}
                  disabled={importing}
                  className="rounded-xl bg-gradient-to-r from-primary to-[#9D96FF] hover:opacity-90"
                >
                  {importing ? (
                    <>
                      <Icon name="spinner" size="sm" className="animate-spin mr-2" />
                      Importing... {importProgress}%
                    </>
                  ) : (
                    <>
                      <Icon name="upload" size="sm" className="mr-2" />
                      Import {preview.totalRows} Customers
                    </>
                  )}
                </Button>
              </div>
              
              {importing && (
                <Progress value={importProgress} className="mt-4" />
              )}
            </div>
          </Card>
        )}
        
        {/* Complete Step */}
        {step === 'complete' && importResults && (
          <Card className="card-elevated p-8 text-center">
            <div className="w-20 h-20 rounded-3xl bg-emerald-100 flex items-center justify-center mx-auto mb-6">
              <Icon name="checkCircle" size="4xl" className="text-emerald-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Import Complete!</h2>
            <p className="text-gray-500 mb-6">
              Your customers have been imported successfully.
            </p>
            
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-8">
              <div className="p-4 bg-emerald-50 rounded-xl">
                <p className="text-2xl font-bold text-emerald-600">{importResults.success}</p>
                <p className="text-sm text-emerald-700">Imported</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-xl">
                <p className="text-2xl font-bold text-amber-600">{importResults.skipped}</p>
                <p className="text-sm text-amber-700">Skipped</p>
              </div>
              <div className="p-4 bg-red-50 rounded-xl">
                <p className="text-2xl font-bold text-red-600">{importResults.errors}</p>
                <p className="text-sm text-red-700">Errors</p>
              </div>
            </div>
            
            {importResults.errorMessages.length > 0 && (
              <div className="text-left p-4 bg-red-50 rounded-xl mb-6 max-w-md mx-auto">
                <p className="text-sm font-medium text-red-700 mb-2">Error details:</p>
                <ul className="text-sm text-red-600 space-y-1">
                  {importResults.errorMessages.slice(0, 5).map((msg, i) => (
                    <li key={i}>• {msg}</li>
                  ))}
                  {importResults.errorMessages.length > 5 && (
                    <li>...and {importResults.errorMessages.length - 5} more</li>
                  )}
                </ul>
              </div>
            )}
            
            <div className="flex justify-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setStep('upload');
                  setFile(null);
                  setPreview(null);
                  setImportResults(null);
                }}
                className="rounded-xl"
              >
                Import More
              </Button>
              <Button 
                onClick={() => router.push('/customers')}
                className="rounded-xl bg-gradient-to-r from-primary to-[#9D96FF] hover:opacity-90"
              >
                View Customers
                <Icon name="arrowRight" size="sm" className="ml-2" />
              </Button>
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
}
