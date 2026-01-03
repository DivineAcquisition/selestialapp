"use client";

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import QuoteList from '@/components/quotes/QuoteList';
import QuoteForm from '@/components/quotes/QuoteForm';
import QuoteDetail from '@/components/quotes/QuoteDetail';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useQuotes } from '@/hooks/useQuotes';
import { useSequences } from '@/hooks/useSequences';
import { Plus, Loader2, FileText } from 'lucide-react';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

type Quote = Tables<'quotes'>;
type QuoteInsert = TablesInsert<'quotes'>;

function QuotesContent() {
  const searchParams = useSearchParams();
  const { quotes, loading, createQuote, updateQuote, updateQuoteStatus } = useQuotes();
  const { sequences } = useSequences();
  
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  
  // Handle URL param for quote selection (from dashboard click)
  useEffect(() => {
    const quoteId = searchParams.get('id');
    if (quoteId && quotes.length > 0) {
      const quote = quotes.find(q => q.id === quoteId);
      if (quote) {
        setSelectedQuote(quote);
      }
    }
  }, [searchParams, quotes]);
  
  // Update selected quote when quotes change (real-time updates)
  useEffect(() => {
    if (selectedQuote) {
      const updated = quotes.find(q => q.id === selectedQuote.id);
      if (updated) {
        setSelectedQuote(updated);
      } else {
        setSelectedQuote(null);
      }
    }
  }, [quotes, selectedQuote?.id]);
  
  const handleQuoteSelect = (quote: Quote) => {
    setSelectedQuote(quote);
  };
  
  const handleCloseDetail = () => {
    setSelectedQuote(null);
  };
  
  const handleAddQuote = () => {
    setEditingQuote(null);
    setShowForm(true);
  };
  
  const handleEditQuote = () => {
    if (selectedQuote) {
      setEditingQuote(selectedQuote);
      setShowForm(true);
    }
  };
  
  const handleSaveQuote = async (quoteData: any) => {
    if (editingQuote) {
      // Update existing
      const { error } = await updateQuote(editingQuote.id, {
        customer_name: quoteData.customer_name,
        customer_phone: quoteData.customer_phone,
        customer_email: quoteData.customer_email || null,
        service_type: quoteData.service_type,
        quote_amount: quoteData.quote_amount,
        description: quoteData.description || null,
      });
      
      if (error) {
        console.error('Failed to update quote:', error);
      }
    } else {
      // Create new
      const defaultSequence = sequences.find(s => s.is_default);
      
      const quote: Omit<QuoteInsert, 'business_id'> = {
        customer_name: quoteData.customer_name,
        customer_phone: quoteData.customer_phone,
        customer_email: quoteData.customer_email || null,
        service_type: quoteData.service_type,
        quote_amount: quoteData.quote_amount,
        description: quoteData.description || null,
        sequence_id: quoteData.sequence_id || defaultSequence?.id || null,
        status: 'new',
      };
      
      const { error } = await createQuote(quote);
      
      if (error) {
        console.error('Failed to create quote:', error);
      }
    }
  };
  
  const handleStatusChange = async (newStatus: 'won' | 'lost' | 'paused' | 'active', additionalData?: any) => {
    if (!selectedQuote) return;
    
    const { error } = await updateQuoteStatus(selectedQuote.id, newStatus, additionalData);
    
    if (error) {
      console.error('Failed to update status:', error);
    }
  };
  
  if (loading) {
    return (
      <Layout title="Quotes">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout title="Quotes">
      <div className="flex gap-6 h-[calc(100vh-12rem)]">
        {/* Left side: Quote list */}
        <div className="w-full md:w-1/2 lg:w-2/5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              {quotes.length} quote{quotes.length !== 1 ? 's' : ''} total
            </p>
            <Button onClick={handleAddQuote} size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Quote
            </Button>
          </div>
          
          {quotes.length === 0 ? (
            <Card className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold text-foreground mb-2">No quotes yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add your first quote to start tracking follow-ups.
              </p>
              <Button onClick={handleAddQuote} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Your First Quote
              </Button>
            </Card>
          ) : (
            <div className="flex-1 overflow-y-auto">
              <QuoteList
                quotes={quotes}
                selectedId={selectedQuote?.id}
                onSelect={handleQuoteSelect}
              />
            </div>
          )}
        </div>
        
        {/* Right side: Quote detail */}
        {selectedQuote && (
          <div className="hidden md:block md:w-1/2 lg:w-3/5">
            <QuoteDetail
              quote={selectedQuote}
              onClose={handleCloseDetail}
              onEdit={handleEditQuote}
              onStatusChange={handleStatusChange}
            />
          </div>
        )}
      </div>
      
      {/* Add/Edit form */}
      <QuoteForm
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingQuote(null);
        }}
        onSave={handleSaveQuote}
        editQuote={editingQuote}
      />
    </Layout>
  );
}

export default function QuotesPage() {
  return (
    <Suspense fallback={
      <Layout title="Quotes">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    }>
      <QuotesContent />
    </Suspense>
  );
}
