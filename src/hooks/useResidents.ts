import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface FamilyMember {
  nama: string;
  status: string;
  tanggalLahir: string;
  jenisKelamin: string;
  noHp: string;
  nik: string;
  pekerjaan: string;
  statusPerkawinan: string;
}

export const emptyMember = (): FamilyMember => ({
  nama: "",
  status: "",
  tanggalLahir: "",
  jenisKelamin: "",
  noHp: "",
  nik: "",
  pekerjaan: "",
  statusPerkawinan: ""
});

export interface Resident {
  id: string;
  nik: string;
  nomorKK: string;
  nama: string;
  noHpKepala: string;
  jumlahAnggota: number;
  anggotaKeluarga: FamilyMember[];
  jenisKelamin: string;
  tanggalLahir: string;
  alamat: string;
  nomorRumah: string;
  blokRumah: string;
  rt: string;
  rw: string;
  statusKepemilikanRumah: string;
  nominalIPL: string;
  statusIPL: string;
}

// Convert from database format to frontend format
const fromDatabase = (row: any): Resident => ({
  id: row.id,
  nik: row.nik,
  nomorKK: row.nomor_kk,
  nama: row.nama,
  noHpKepala: row.no_hp_kepala || '',
  jumlahAnggota: row.jumlah_anggota || 0,
  anggotaKeluarga: row.anggota_keluarga || [],
  jenisKelamin: row.jenis_kelamin,
  tanggalLahir: row.tanggal_lahir,
  alamat: row.alamat || '',
  nomorRumah: row.nomor_rumah || '',
  blokRumah: row.blok_rumah || '',
  rt: row.rt || '',
  rw: row.rw || '',
  statusKepemilikanRumah: row.status_kepemilikan_rumah || '',
  nominalIPL: row.nominal_ipl?.toString() || '',
  statusIPL: row.status_ipl || '',
});

// Convert from frontend format to database format
const toDatabase = (resident: Omit<Resident, 'id'>) => ({
  nik: resident.nik,
  nomor_kk: resident.nomorKK,
  nama: resident.nama,
  no_hp_kepala: resident.noHpKepala || null,
  jumlah_anggota: resident.jumlahAnggota || 0,
  anggota_keluarga: resident.anggotaKeluarga || [],
  jenis_kelamin: resident.jenisKelamin,
  tanggal_lahir: resident.tanggalLahir,
  alamat: resident.alamat || null,
  nomor_rumah: resident.nomorRumah || null,
  blok_rumah: resident.blokRumah || null,
  rt: resident.rt || null,
  rw: resident.rw || null,
  status_kepemilikan_rumah: resident.statusKepemilikanRumah || null,
  pekerjaan: null, // Moved to family members
  status_perkawinan: null, // Moved to family members
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
