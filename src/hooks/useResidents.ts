import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Resident {
  id: string;
  nik: string;
  nomorKK: string;
  nama: string;
  jenisKelamin: string;
  tanggalLahir: string;
  alamat: string;
  nomorRumah: string;
  blokRumah: string;
  rt: string;
  rw: string;
  pekerjaan: string;
  statusPerkawinan: string;
  nominalIPL: string;
  statusIPL: string;
}

// Convert from database format to frontend format
const fromDatabase = (row: any): Resident => ({
  id: row.id,
  nik: row.nik,
  nomorKK: row.nomor_kk,
  nama: row.nama,
  jenisKelamin: row.jenis_kelamin,
  tanggalLahir: row.tanggal_lahir,
  alamat: row.alamat || '',
  nomorRumah: row.nomor_rumah || '',
  blokRumah: row.blok_rumah || '',
  rt: row.rt || '',
  rw: row.rw || '',
  pekerjaan: row.pekerjaan || '',
  statusPerkawinan: row.status_perkawinan || '',
  nominalIPL: row.nominal_ipl?.toString() || '',
  statusIPL: row.status_ipl || '',
});

// Convert from frontend format to database format
const toDatabase = (resident: Omit<Resident, 'id'>) => ({
  nik: resident.nik,
  nomor_kk: resident.nomorKK,
  nama: resident.nama,
  jenis_kelamin: resident.jenisKelamin,
  tanggal_lahir: resident.tanggalLahir,
  alamat: resident.alamat || null,
  nomor_rumah: resident.nomorRumah || null,
  blok_rumah: resident.blokRumah || null,
  rt: resident.rt || null,
  rw: resident.rw || null,
  pekerjaan: resident.pekerjaan || null,
  status_perkawinan: resident.statusPerkawinan || null,
  nominal_ipl: resident.nominalIPL ? Number(resident.nominalIPL) : null,
  status_ipl: resident.statusIPL || null,
});

export const useResidents = () => {
  return useQuery({
    queryKey: ['residents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('residents')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching residents:', error);
        throw error;
      }
      
      return data.map(fromDatabase);
    },
  });
};

export const useAddResident = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (resident: Omit<Resident, 'id'>) => {
      const { data, error } = await supabase
        .from('residents')
        .insert(toDatabase(resident))
        .select()
        .single();
      
      if (error) {
        console.error('Error adding resident:', error);
        throw error;
      }
      
      return fromDatabase(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['residents'] });
      toast.success('Data warga berhasil ditambahkan');
    },
    onError: (error) => {
      console.error('Error adding resident:', error);
      toast.error('Gagal menambahkan data warga');
    },
  });
};

export const useUpdateResident = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (resident: Resident) => {
      const { data, error } = await supabase
        .from('residents')
        .update(toDatabase(resident))
        .eq('id', resident.id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating resident:', error);
        throw error;
      }
      
      return fromDatabase(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['residents'] });
      toast.success('Data warga berhasil diperbarui');
    },
    onError: (error) => {
      console.error('Error updating resident:', error);
      toast.error('Gagal memperbarui data warga');
    },
  });
};

export const useDeleteResident = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('residents')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting resident:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['residents'] });
      toast.success('Data warga berhasil dihapus');
    },
    onError: (error) => {
      console.error('Error deleting resident:', error);
      toast.error('Gagal menghapus data warga');
    },
  });
};
