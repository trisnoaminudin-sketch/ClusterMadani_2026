import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
    mutationFn: async ({ residentId, amount, period }: { residentId: string, amount: number, period: string }) => {
      // 1. Insert into ipl_payments
      const { error: paymentError } = await supabase
        .from('ipl_payments')
        .insert({
          resident_id: residentId,
          amount: amount,
          period: period,
          status: 'PAID'
        });

      if (paymentError) throw paymentError;

      // 2. Update residents table status
      const { error: residentError } = await supabase
        .from('residents')
        .update({ status_ipl: 'Lunas' })
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
