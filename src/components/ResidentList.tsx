import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Users, Pencil, Trash2 } from "lucide-react";
import { Resident, useUpdateResident, useDeleteResident } from "@/hooks/useResidents";
import { EditResidentDialog } from "./EditResidentDialog";
import { DeleteResidentDialog } from "./DeleteResidentDialog";

interface ResidentListProps {
  residents: Resident[];
}

export const ResidentList = ({ residents }: ResidentListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [editResident, setEditResident] = useState<Resident | null>(null);
  const [deleteResident, setDeleteResident] = useState<Resident | null>(null);
  
  const updateMutation = useUpdateResident();
  const deleteMutation = useDeleteResident();

  const filteredResidents = residents.filter((resident) =>
    resident.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resident.nik.includes(searchTerm) ||
    resident.nomorKK.includes(searchTerm) ||
    resident.alamat.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resident.blokRumah.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resident.nomorRumah.includes(searchTerm)
  );

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handleEditSave = (resident: Resident) => {
    updateMutation.mutate(resident, {
      onSuccess: () => {
        setEditResident(null);
      },
    });
  };

  const handleDeleteConfirm = () => {
    if (deleteResident) {
      deleteMutation.mutate(deleteResident.id, {
        onSuccess: () => {
          setDeleteResident(null);
        },
      });
    }
  };

  return (
    <>
      <Card className="p-6 border-2">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold text-foreground">Daftar Warga</h2>
            </div>
            <Badge variant="secondary" className="px-4 py-1">
              {filteredResidents.length} Warga
            </Badge>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Cari berdasarkan nama, NIK, No. KK, alamat, atau blok..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="rounded-lg border overflow-hidden overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-bold">NIK</TableHead>
                  <TableHead className="font-bold">No. KK</TableHead>
                  <TableHead className="font-bold">Nama</TableHead>
                  <TableHead className="font-bold">Jenis Kelamin</TableHead>
                  <TableHead className="font-bold">Usia</TableHead>
                  <TableHead className="font-bold">Blok/No. Rumah</TableHead>
                  <TableHead className="font-bold">RT/RW</TableHead>
                  <TableHead className="font-bold">Pekerjaan</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                  <TableHead className="font-bold">IPL</TableHead>
                  <TableHead className="font-bold">Status IPL</TableHead>
                  <TableHead className="font-bold text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResidents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={12} className="text-center py-8 text-muted-foreground">
                      {searchTerm ? "Tidak ada data yang sesuai dengan pencarian" : "Belum ada data warga"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredResidents.map((resident) => (
                    <TableRow key={resident.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-mono text-sm">{resident.nik}</TableCell>
                      <TableCell className="font-mono text-sm">{resident.nomorKK}</TableCell>
                      <TableCell className="font-medium">{resident.nama}</TableCell>
                      <TableCell>
                        <Badge variant={resident.jenisKelamin === "Laki-laki" ? "default" : "secondary"}>
                          {resident.jenisKelamin}
                        </Badge>
                      </TableCell>
                      <TableCell>{calculateAge(resident.tanggalLahir)} tahun</TableCell>
                      <TableCell>{resident.blokRumah || "-"}/{resident.nomorRumah || "-"}</TableCell>
                      <TableCell>{resident.rt}/{resident.rw}</TableCell>
                      <TableCell>{resident.pekerjaan || "-"}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{resident.statusPerkawinan || "-"}</Badge>
                      </TableCell>
                      <TableCell className="font-mono">
                        {resident.nominalIPL ? `Rp ${Number(resident.nominalIPL).toLocaleString('id-ID')}` : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={resident.statusIPL === "Lunas" ? "default" : "destructive"}>
                          {resident.statusIPL || "-"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                            onClick={() => setEditResident(resident)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setDeleteResident(resident)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </Card>

      <EditResidentDialog
        resident={editResident}
        open={!!editResident}
        onOpenChange={(open) => !open && setEditResident(null)}
        onSave={handleEditSave}
        isLoading={updateMutation.isPending}
      />

      <DeleteResidentDialog
        resident={deleteResident}
        open={!!deleteResident}
        onOpenChange={(open) => !open && setDeleteResident(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
      />
    </>
  );
};
