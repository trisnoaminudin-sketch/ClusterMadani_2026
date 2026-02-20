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
  pekerjaan: string;
  statusPerkawinan: string;
  nominalIPL: string;
  statusIPL: string;
}

// Convert from database format to frontend format
const fromDatabase = (row: Record<string, unknown>): Resident => ({
  id: row.id as string,
  nik: row.nik as string,
  nomorKK: row.nomor_kk as string,
  nama: row.nama as string,
  noHpKepala: (row.no_hp_kepala as string) || '',
  jumlahAnggota: (row.jumlah_anggota as number) || 0,
  anggotaKeluarga: (row.anggota_keluarga as FamilyMember[]) || [],
  jenisKelamin: row.jenis_kelamin as string,
  tanggalLahir: row.tanggal_lahir as string,
  alamat: (row.alamat as string) || '',
  nomorRumah: (row.nomor_rumah as string) || '',
  blokRumah: (row.blok_rumah as string) || '',
  rt: (row.rt as string) || '',
  rw: (row.rw as string) || '',
  statusKepemilikanRumah: row.status_kepemilikan_rumah as string,
  pekerjaan: row.pekerjaan as string,
  statusPerkawinan: row.status_perkawinan as string,
  nominalIPL: row.nominal_ipl as string,
  statusIPL: row.status_ipl as string,
});

// Convert from frontend format to database format
const toDatabase = (resident: Partial<Resident>): Record<string, unknown> => ({
  nik: resident.nik,
  nomor_kk: resident.nomorKK,
  nama: resident.nama,
  no_hp_kepala: resident.noHpKepala,
  jumlah_anggota: resident.jumlahAnggota,
  anggota_keluarga: resident.anggotaKeluarga,
  jenis_kelamin: resident.jenisKelamin,
  tanggal_lahir: resident.tanggalLahir,
  alamat: resident.alamat,
  nomor_rumah: resident.nomorRumah,
  blok_rumah: resident.blokRumah,
  rt: resident.rt,
  rw: resident.rw,
  status_kepemilikan_rumah: resident.statusKepemilikanRumah,
  pekerjaan: resident.pekerjaan,
  status_perkawinan: resident.statusPerkawinan,
  nominal_ipl: resident.nominalIPL,
  status_ipl: resident.statusIPL,
});

export const useResidents = (blok?: string | null, nomorRumah?: string | null) => {
  return useQuery({
    queryKey: ['residents', blok, nomorRumah],
    queryFn: async () => {
      let query = supabase
        .from('residents')
        .select('*');

      if (blok) {
        query = query.eq('blok_rumah', blok);
      }
      if (nomorRumah) {
        query = query.eq('nomor_rumah', nomorRumah);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

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
