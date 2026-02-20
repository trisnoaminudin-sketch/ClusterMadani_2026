import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Profile {
  id: string;
  username: string;
  role: 'admin' | 'user';
  restricted_blok: string | null;
  restricted_nomor_rumah: string | null;
  created_at: string;
}

export const useProfiles = () => {
  return useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching profiles:', error);
        throw error;
      }

      return data as Profile[];
    },
  });
};

export const useAddProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: Omit<Profile, 'id' | 'created_at'> & { password: string }) => {
      const { data, error } = await supabase
        .from('profiles')
        .insert(profile)
        .select()
        .single();

      if (error) {
        console.error('Error adding profile:', error);
        throw error;
      }

      return data as Profile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      toast.success('User berhasil ditambahkan');
    },
    onError: (error: Error) => {
      console.error('Error adding profile:', error);
      toast.error(error.message || 'Gagal menambahkan user');
    },
  });
};

export const useDeleteProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting profile:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      toast.success('User berhasil dihapus');
    },
    onError: (error) => {
      console.error('Error deleting profile:', error);
      toast.error('Gagal menghapus user');
    },
  });
};

export const useChangePassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ username, newPassword }: { username: string; newPassword: string }) => {
      const { data, error } = await supabase
        .from('profiles')
        .update({ password: newPassword })
        .eq('username', username)
        .select()
        .single();

      if (error) {
        console.error('Error changing password:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      toast.success('Password berhasil diperbarui');
    },
    onError: (error: Error) => {
      console.error('Error changing password:', error);
      toast.error(error.message || 'Gagal memperbarui password');
    },
  });
};

export const useBulkAddProfiles = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profiles: (Omit<Profile, 'id' | 'created_at'> & { password: string })[]) => {
      const { data, error } = await supabase
        .from('profiles')
        .insert(profiles)
        .select();

      if (error) {
        console.error('Error adding profiles:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      toast.success('Daftar user berhasil diupload');
    },
    onError: (error: Error) => {
      console.error('Error adding profiles:', error);
      toast.error(error.message || 'Gagal mengupload daftar user');
    },
  });
};
