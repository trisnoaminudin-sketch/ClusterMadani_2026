import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { calculateUnpaidPeriods, getNextPeriodsToPay } from '@/lib/ipl-utils';
import { Resident } from './useResidents';

export const useIplSettings = () => {
  return useQuery({
    queryKey: ['ipl_settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'ipl_amount')
        .single();

      if (error) {
        // If error (e.g., table doesn't exist yet or row missing), return default
        console.error("Error fetching IPL settings:", error);
        return { value: '0' };
      }
      return data;
    }
  });
};

export const useUpdateIplSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (amount: string) => {
      const { error } = await supabase
        .from('app_settings')
        .upsert({ key: 'ipl_amount', value: amount });

      if (error) throw error;
      return amount;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ipl_settings'] });
      toast.success('Harga IPL berhasil diperbarui');
    },
    onError: (error) => {
      console.error("Error updating IPL settings:", error);
      toast.error('Gagal memperbarui harga IPL');
    }
  });
};

export const usePayIpl = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ residentId, amount, periods }: { residentId: string, amount: number, periods: string[] }) => {
      // 1. Insert into ipl_payments for each period
      const payments = periods.map(period => ({
        resident_id: residentId,
        amount: amount / periods.length, // Split total amount per period
        period: period,
        status: 'PAID'
      }));

      const { error: paymentError } = await supabase
        .from('ipl_payments')
        .insert(payments);

      if (paymentError) throw paymentError;

      // 2. Update residents table status
      // We set it to 'Lunas' as a hint, but the real logic depends on ipl_payments
      const { error: residentError } = await supabase
        .from('residents')
        .update({ status_ipl: (periods.length > 0 ? 'Lunas' : 'Belum Lunas') })
        .eq('id', residentId);

      if (residentError) throw residentError;

      return residentId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['residents'] });
      queryClient.invalidateQueries({ queryKey: ['ipl_payments'] });
      toast.success('Pembayaran IPL berhasil dicatat');
    },
    onError: (error) => {
      console.error("Error recording payment:", error);
      toast.error('Gagal mencatat pembayaran');
    }
  });
};

export const useResetIplStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (residentId: string) => {
      const { error } = await supabase
        .from('residents')
        .update({ status_ipl: 'Belum Lunas' })
        .eq('id', residentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['residents'] });
      toast.success('Status IPL direset ke Belum Lunas');
    },
    onError: (error) => {
      toast.error('Gagal mereset status');
    }
  });
}

export const useIplPayments = () => {
  return useQuery({
    queryKey: ['ipl_payments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ipl_payments')
        .select(`
                    *,
                    residents (
                        nama,
                        blok_rumah,
                        nomor_rumah
                    )
                `)
        .order('payment_date', { ascending: false });

      if (error) throw error;
      return data;
    }
  });
};

export const useResidentUnpaidPeriods = (resident: Resident | undefined) => {
  return useQuery({
    queryKey: ['ipl_payments', 'unpaid', resident?.id],
    enabled: !!resident,
    queryFn: async () => {
      if (!resident) return [];

      // Fetch already paid periods for this resident
      const { data, error } = await supabase
        .from('ipl_payments')
        .select('period')
        .eq('resident_id', resident.id)
        .eq('status', 'PAID');

      if (error) throw error;

      const paidPeriods = data.map(p => p.period);
      return calculateUnpaidPeriods(resident.tanggalPendaftaran, paidPeriods);
    }
  });
};

export const useResidentPaidPeriods = (residentId: string | undefined) => {
  return useQuery({
    queryKey: ['ipl_payments', 'paid', residentId],
    enabled: !!residentId,
    queryFn: async () => {
      if (!residentId) return [];
      const { data, error } = await supabase
        .from('ipl_payments')
        .select('period')
        .eq('resident_id', residentId)
        .eq('status', 'PAID');

      if (error) throw error;
      return data.map(p => p.period);
    }
  });
};
