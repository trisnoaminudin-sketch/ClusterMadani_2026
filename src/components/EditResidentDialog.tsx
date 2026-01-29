import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { Resident, FamilyMember } from "@/hooks/useResidents";
import { FamilyMemberFields } from "./FamilyMemberFields";

interface EditResidentDialogProps {
  resident: Resident | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (resident: Resident) => void;
  isLoading?: boolean;
}

const emptyMember = (): FamilyMember => ({ nama: "", status: "", tanggalLahir: "", jenisKelamin: "", noHp: "" });

export const EditResidentDialog = ({ resident, open, onOpenChange, onSave, isLoading }: EditResidentDialogProps) => {
  const [formData, setFormData] = useState<Resident | null>(null);
  const [jumlahAnggota, setJumlahAnggota] = useState("0");
  const [anggotaKeluarga, setAnggotaKeluarga] = useState<FamilyMember[]>([]);

  useEffect(() => {
    if (resident) {
      setFormData(resident);
      setJumlahAnggota(String(resident.jumlahAnggota || 0));
      setAnggotaKeluarga(resident.anggotaKeluarga || []);
    }
  }, [resident]);

  const handleJumlahChange = (value: string) => {
    const count = parseInt(value, 10);
    setJumlahAnggota(value);
    
    const currentLength = anggotaKeluarga.length;
    if (count > currentLength) {
      const newMembers = Array(count - currentLength).fill(null).map(() => emptyMember());
      setAnggotaKeluarga([...anggotaKeluarga, ...newMembers]);
    } else if (count < currentLength) {
      setAnggotaKeluarga(anggotaKeluarga.slice(0, count));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData) {
      onSave({
        ...formData,
        jumlahAnggota: parseInt(jumlahAnggota, 10),
        anggotaKeluarga: anggotaKeluarga,
      });
    }
  };

  if (!formData) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Data Warga</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nomor Kartu Keluarga - Pertama */}
          <div className="space-y-2">
            <Label htmlFor="edit-nomorKK">Nomor Kartu Keluarga *</Label>
            <Input
              id="edit-nomorKK"
              type="text"
              value={formData.nomorKK}
              onChange={(e) => setFormData({ ...formData, nomorKK: e.target.value })}
              maxLength={16}
              required
            />
          </div>

          {/* Jumlah Anggota Keluarga - Kedua */}
          <div className="space-y-2">
            <Label htmlFor="edit-jumlahAnggota">Jumlah Anggota Keluarga</Label>
            <Select value={jumlahAnggota} onValueChange={handleJumlahChange}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih jumlah anggota" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">0 (Tidak ada)</SelectItem>
                <SelectItem value="1">1 orang</SelectItem>
                <SelectItem value="2">2 orang</SelectItem>
                <SelectItem value="3">3 orang</SelectItem>
                <SelectItem value="4">4 orang</SelectItem>
                <SelectItem value="5">5 orang</SelectItem>
                <SelectItem value="6">6 orang</SelectItem>
                <SelectItem value="7">7 orang</SelectItem>
                <SelectItem value="8">8 orang</SelectItem>
                <SelectItem value="9">9 orang</SelectItem>
                <SelectItem value="10">10 orang</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Data Anggota Keluarga - Ketiga */}
          <FamilyMemberFields 
            members={anggotaKeluarga} 
            onChange={setAnggotaKeluarga} 
          />

          {/* Data Lainnya */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-nik">NIK Kepala Keluarga *</Label>
              <Input
                id="edit-nik"
                type="text"
                value={formData.nik}
                onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                maxLength={16}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-nama">Nama Kepala Keluarga *</Label>
              <Input
                id="edit-nama"
                type="text"
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-noHpKepala">No. HP Kepala Keluarga</Label>
              <Input
                id="edit-noHpKepala"
                type="tel"
                value={formData.noHpKepala}
                onChange={(e) => setFormData({ ...formData, noHpKepala: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-jenisKelamin">Jenis Kelamin Kepala Keluarga *</Label>
              <Select value={formData.jenisKelamin} onValueChange={(value) => setFormData({ ...formData, jenisKelamin: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenis kelamin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                  <SelectItem value="Perempuan">Perempuan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-tanggalLahir">Tanggal Lahir Kepala Keluarga *</Label>
              <Input
                id="edit-tanggalLahir"
                type="date"
                value={formData.tanggalLahir}
                onChange={(e) => setFormData({ ...formData, tanggalLahir: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-nomorRumah">Nomor Rumah</Label>
              <Input
                id="edit-nomorRumah"
                type="text"
                value={formData.nomorRumah}
                onChange={(e) => setFormData({ ...formData, nomorRumah: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-blokRumah">Blok Rumah</Label>
              <Input
                id="edit-blokRumah"
                type="text"
                value={formData.blokRumah}
                onChange={(e) => setFormData({ ...formData, blokRumah: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-rt">RT</Label>
              <Input
                id="edit-rt"
                type="text"
                value={formData.rt}
                onChange={(e) => setFormData({ ...formData, rt: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-rw">RW</Label>
              <Input
                id="edit-rw"
                type="text"
                value={formData.rw}
                onChange={(e) => setFormData({ ...formData, rw: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-pekerjaan">Pekerjaan</Label>
              <Input
                id="edit-pekerjaan"
                type="text"
                value={formData.pekerjaan}
                onChange={(e) => setFormData({ ...formData, pekerjaan: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-statusPerkawinan">Status Perkawinan</Label>
              <Select value={formData.statusPerkawinan} onValueChange={(value) => setFormData({ ...formData, statusPerkawinan: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Belum Kawin">Belum Kawin</SelectItem>
                  <SelectItem value="Kawin">Kawin</SelectItem>
                  <SelectItem value="Cerai Hidup">Cerai Hidup</SelectItem>
                  <SelectItem value="Cerai Mati">Cerai Mati</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-nominalIPL">Nominal IPL (Rp)</Label>
              <Input
                id="edit-nominalIPL"
                type="number"
                value={formData.nominalIPL}
                onChange={(e) => setFormData({ ...formData, nominalIPL: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-statusIPL">Status IPL</Label>
              <Select value={formData.statusIPL} onValueChange={(value) => setFormData({ ...formData, statusIPL: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status IPL" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Lunas">Lunas</SelectItem>
                  <SelectItem value="Belum Lunas">Belum Lunas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-alamat">Alamat Lengkap</Label>
            <Input
              id="edit-alamat"
              type="text"
              value={formData.alamat}
              onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                'Simpan Perubahan'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
