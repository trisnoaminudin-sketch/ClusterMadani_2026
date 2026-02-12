import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { UserPlus, Loader2 } from "lucide-react";
import { Resident, FamilyMember, emptyMember } from "@/hooks/useResidents";
import { FamilyMemberFields } from "./FamilyMemberFields";

interface AddResidentFormProps {
  onAddResident: (resident: Omit<Resident, 'id'>) => void;
  isLoading?: boolean;
}



export const AddResidentForm = ({ onAddResident, isLoading }: AddResidentFormProps) => {
  const userRole = localStorage.getItem("userRole");
  const restrictedBlok = localStorage.getItem("restrictedBlok");
  const restrictedNomorRumah = localStorage.getItem("restrictedNomorRumah");

  const [formData, setFormData] = useState({
    nomorKK: "",
    alamat: "",
    nomorRumah: userRole === 'admin' ? "" : (restrictedNomorRumah || ""),
    blokRumah: userRole === 'admin' ? "" : (restrictedBlok || ""),
    statusKepemilikanRumah: "",
    rt: "",
    rw: "",
    nominalIPL: "",
    statusIPL: "",
  });

  const [jumlahAnggota, setJumlahAnggota] = useState("0");
  const [anggotaKeluarga, setAnggotaKeluarga] = useState<FamilyMember[]>([]);

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

    if (!formData.nomorKK) {
      return;
    }

    // Prepare the resident object with defaults for fields that were removed from the form
    // but might still be required by the backend/database schema.
    // data.nik and others are taken from family members if available or defaults.
    const headOfHousehold = anggotaKeluarga.find(m => m.status === "Suami" || m.status === "Kepala Keluarga") || anggotaKeluarga[0] || emptyMember();

    onAddResident({
      ...formData,
      nik: headOfHousehold.nik || "",
      nama: headOfHousehold.nama || "",
      noHpKepala: headOfHousehold.noHp || "",
      jenisKelamin: headOfHousehold.jenisKelamin || "",
      tanggalLahir: headOfHousehold.tanggalLahir || "",
      pekerjaan: headOfHousehold.pekerjaan || "",
      statusPerkawinan: headOfHousehold.statusPerkawinan || "",
      jumlahAnggota: parseInt(jumlahAnggota, 10),
      anggotaKeluarga: anggotaKeluarga,
    });

    setFormData({
      nomorKK: "",
      alamat: "",
      nomorRumah: userRole === 'admin' ? "" : (restrictedNomorRumah || ""),
      blokRumah: userRole === 'admin' ? "" : (restrictedBlok || ""),
      statusKepemilikanRumah: "",
      rt: "",
      rw: "",
      nominalIPL: "",
      statusIPL: "",
    });
    setJumlahAnggota("0");
    setAnggotaKeluarga([]);
  };

  return (
    <Card className="p-6 border-2">
      <div className="flex items-center gap-2 mb-6">
        <UserPlus className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold text-foreground">Tambah Data Warga</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nomor Kartu Keluarga - Pertama */}
        <div className="space-y-2">
          <Label htmlFor="nomorKK">Nomor Kartu Keluarga *</Label>
          <Input
            id="nomorKK"
            type="text"
            placeholder="1234567890123456"
            value={formData.nomorKK}
            onChange={(e) => setFormData({ ...formData, nomorKK: e.target.value })}
            maxLength={16}
            required
          />
        </div>

        {/* Jumlah Anggota Keluarga - Kedua */}
        <div className="space-y-2">
          <Label htmlFor="jumlahAnggota">Jumlah Anggota Keluarga</Label>
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
            <Label htmlFor="nomorRumah">Nomor Rumah</Label>
            <Input
              id="nomorRumah"
              type="text"
              placeholder="12"
              value={formData.nomorRumah}
              onChange={(e) => setFormData({ ...formData, nomorRumah: e.target.value })}
              disabled={userRole !== 'admin'}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="blokRumah">Blok Rumah</Label>
            <Input
              id="blokRumah"
              type="text"
              placeholder="A"
              value={formData.blokRumah}
              onChange={(e) => setFormData({ ...formData, blokRumah: e.target.value })}
              disabled={userRole !== 'admin'}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="statusKepemilikanRumah">Status Kepemilikan Rumah</Label>
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
            <Label htmlFor="rt">RT</Label>
            <Input
              id="rt"
              type="text"
              placeholder="001"
              value={formData.rt}
              onChange={(e) => setFormData({ ...formData, rt: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rw">RW</Label>
            <Input
              id="rw"
              type="text"
              placeholder="001"
              value={formData.rw}
              onChange={(e) => setFormData({ ...formData, rw: e.target.value })}
            />
          </div>



          {localStorage.getItem("userRole") === "admin" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="nominalIPL">Nominal IPL (Rp)</Label>
                <Input
                  id="nominalIPL"
                  type="number"
                  placeholder="150000"
                  value={formData.nominalIPL}
                  onChange={(e) => setFormData({ ...formData, nominalIPL: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="statusIPL">Status IPL</Label>
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
            </>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="alamat">Alamat non Madani</Label>
          <Input
            id="alamat"
            type="text"
            placeholder="Masukkan Alamat non Madani"
            value={formData.alamat}
            onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
          />
        </div>

        <Button type="submit" className="w-full md:w-auto" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <UserPlus className="w-4 h-4 mr-2" />
          )}
          {isLoading ? 'Menyimpan...' : 'Tambah Warga'}
        </Button>
      </form>
    </Card>
  );
};
