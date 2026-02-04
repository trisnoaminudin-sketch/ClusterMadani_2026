import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users } from "lucide-react";

import { FamilyMember } from "@/hooks/useResidents";


interface FamilyMemberFieldsProps {
  members: FamilyMember[];
  onChange: (members: FamilyMember[]) => void;
}

export const FamilyMemberFields = ({ members, onChange }: FamilyMemberFieldsProps) => {
  const updateMember = (index: number, field: keyof FamilyMember, value: string) => {
    const updated = [...members];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  if (members.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4 text-primary" />
        <h3 className="font-semibold text-foreground">Data Anggota Keluarga</h3>
      </div>

      {members.map((member, index) => (
        <Card key={index} className="p-4 border">
          <h4 className="font-medium text-sm text-muted-foreground mb-3">
            Anggota Keluarga {index + 1}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`member-nik-${index}`}>NIK</Label>
              <Input
                id={`member-nik-${index}`}
                type="text"
                placeholder="1234567890123456"
                value={member.nik || ''}
                onChange={(e) => updateMember(index, 'nik', e.target.value)}
                maxLength={16}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`member-nama-${index}`}>Nama</Label>
              <Input
                id={`member-nama-${index}`}
                type="text"
                placeholder="Nama anggota keluarga"
                value={member.nama}
                onChange={(e) => updateMember(index, 'nama', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`member-status-${index}`}>Status</Label>
              <Select
                value={member.status}
                onValueChange={(value) => updateMember(index, 'status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Suami">Suami</SelectItem>
                  <SelectItem value="Istri">Istri</SelectItem>
                  <SelectItem value="Anak">Anak</SelectItem>
                  <SelectItem value="Saudara">Saudara</SelectItem>
                  <SelectItem value="Sendiri/Lajang">Sendiri/Lajang</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`member-tgl-${index}`}>Tanggal Lahir</Label>
              <Input
                id={`member-tgl-${index}`}
                type="date"
                value={member.tanggalLahir}
                onChange={(e) => updateMember(index, 'tanggalLahir', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`member-pekerjaan-${index}`}>Pekerjaan</Label>
              <Input
                id={`member-pekerjaan-${index}`}
                type="text"
                placeholder="Pekerjaan"
                value={member.pekerjaan || ''}
                onChange={(e) => updateMember(index, 'pekerjaan', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`member-kawin-${index}`}>Status Perkawinan</Label>
              <Select
                value={member.statusPerkawinan || ''}
                onValueChange={(value) => updateMember(index, 'statusPerkawinan', value)}
              >
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
              <Label htmlFor={`member-jk-${index}`}>Jenis Kelamin</Label>
              <Select
                value={member.jenisKelamin}
                onValueChange={(value) => updateMember(index, 'jenisKelamin', value)}
              >
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
              <Label htmlFor={`member-hp-${index}`}>No. HP</Label>
              <Input
                id={`member-hp-${index}`}
                type="tel"
                placeholder="08123456789"
                value={member.noHp}
                onChange={(e) => updateMember(index, 'noHp', e.target.value)}
              />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
