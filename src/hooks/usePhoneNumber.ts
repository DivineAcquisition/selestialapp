import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useBusiness } from '@/contexts/BusinessContext';

interface PhoneNumber {
  id: string;
  phone_number: string;
  friendly_name: string | null;
  is_active: boolean | null;
  is_primary: boolean | null;
}

interface AvailableNumber {
  phone_number: string;
  friendly_name: string;
  capabilities: {
    sms: boolean;
    mms: boolean;
    voice: boolean;
  };
}

export function usePhoneNumber() {
  const { business, refetch: refetchBusiness } = useBusiness();
  const [phoneNumber, setPhoneNumber] = useState<PhoneNumber | null>(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [availableNumbers, setAvailableNumbers] = useState<AvailableNumber[]>([]);

  const fetchPhoneNumber = useCallback(async () => {
    if (!business) {
      setPhoneNumber(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('phone_numbers')
        .select('id, phone_number, friendly_name, is_active, is_primary')
        .eq('business_id', business.id)
        .eq('is_active', true)
        .order('is_primary', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Failed to fetch phone number:', error);
      }

      setPhoneNumber(data);
    } catch (err) {
      console.error('Failed to fetch phone number:', err);
    } finally {
      setLoading(false);
    }
  }, [business]);

  useEffect(() => {
    fetchPhoneNumber();
  }, [fetchPhoneNumber]);

  const searchNumbers = async (areaCode?: string) => {
    setSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke('phone-numbers', {
        body: { action: 'search', areaCode },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      setAvailableNumbers(data.numbers || []);
      return { error: null };
    } catch (err) {
      console.error('Search numbers error:', err);
      return { error: err instanceof Error ? err : new Error('Search failed') };
    } finally {
      setSearching(false);
    }
  };

  const purchaseNumber = async (phoneNumberToPurchase: string) => {
    setPurchasing(true);
    try {
      const { data, error } = await supabase.functions.invoke('phone-numbers', {
        body: { action: 'purchase', phoneNumber: phoneNumberToPurchase },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      setPhoneNumber(data.phone);
      await refetchBusiness();
      return { error: null };
    } catch (err) {
      console.error('Purchase number error:', err);
      return { error: err instanceof Error ? err : new Error('Purchase failed') };
    } finally {
      setPurchasing(false);
    }
  };

  const releaseNumber = async () => {
    if (!phoneNumber) return { error: new Error('No phone number') };

    try {
      const { data, error } = await supabase.functions.invoke('phone-numbers', {
        body: { action: 'release' },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      setPhoneNumber(null);
      await refetchBusiness();
      return { error: null };
    } catch (err) {
      console.error('Release number error:', err);
      return { error: err instanceof Error ? err : new Error('Release failed') };
    }
  };

  return {
    phoneNumber,
    loading,
    searching,
    purchasing,
    availableNumbers,
    searchNumbers,
    purchaseNumber,
    releaseNumber,
    refetch: fetchPhoneNumber,
  };
}
