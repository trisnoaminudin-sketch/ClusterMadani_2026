import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { Resident, FamilyMember, emptyMember } from "@/hooks/useResidents";
import { FamilyMemberFields } from "./FamilyMemberFields";

interface EditResidentDialogProps {
  resident: Resident | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (resident: Resident) => void;
  isLoading?: boolean;
}



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



          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-nomorRumah">Nomor Rumah</Label>
              <Input
                id="edit-nomorRumah"
                type="text"
                value={formData.nomorRumah}
                onChange={(e) => setFormData({ ...formData, nomorRumah: e.target.value })}
                disabled={localStorage.getItem("userRole") !== 'admin'}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-blokRumah">Blok Rumah</Label>
              <Input
                id="edit-blokRumah"
                type="text"
                value={formData.blokRumah}
                onChange={(e) => setFormData({ ...formData, blokRumah: e.target.value })}
                disabled={localStorage.getItem("userRole") !== 'admin'}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-statusKepemilikanRumah">Status Kepemilikan Rumah</Label>
              <Select value={formData.statusKepemilikanRumah} onValueChange={(value) => setFormData({ ...formData, statusKepemilikanRumah: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status kepemilikan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Milik Sendiri">Milik Sendiri</SelectItem>
                  <SelectItem value="Kontrak">Kontrak</SelectItem>
                  <SelectItem value="Milik Orang Tua">Milik Orang Tua</SelectItem>
                  <SelectItem value="Milik Saudara">Milik Saudara</SelectItem>
                  <SelectItem value="Lainnya">Lainnya</SelectItem>
                </SelectContent>
              </Select>
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



            {localStorage.getItem("userRole") === "admin" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="edit-nominalIPL">Nominal IPL (Rp)</Label>
                  <Input
                    id="edit-nominalIPL"
                    type="number"
                    value={formData.nominalIPL || "0"}
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

                <div className="space-y-2">
                  <Label htmlFor="edit-tanggalPendaftaran">Tanggal Pendaftaran</Label>
                  <Input
                    id="edit-tanggalPendaftaran"
                    type="date"
                    value={formData.tanggalPendaftaran}
                    onChange={(e) => setFormData({ ...formData, tanggalPendaftaran: e.target.value })}
                  />
                </div>
              </>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-alamat">Alamat non Madani</Label>
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
    </Dialog >
  );
};
