import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/StatCard";
import { AddResidentForm } from "@/components/AddResidentForm";
import { ResidentList } from "@/components/ResidentList";
import { AdminMenu } from "@/components/AdminMenu";
import { Users, UserCheck, UserX, Calendar, FileText, Banknote, CheckCircle, Loader2, LogOut, Download, CreditCard, Key, Upload } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useResidents, useAddResident, Resident, useBulkAddResidents } from "@/hooks/useResidents";
import { useIplSettings, useResidentUnpaidPeriods } from "@/hooks/useIpl";
import * as XLSX from "xlsx";
import { useProfiles, useChangePassword } from "@/hooks/useProfiles";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";

const Index = () => {
  const navigate = useNavigate();
  const adminName = localStorage.getItem("adminUser") || "User";
  const userRole = localStorage.getItem("userRole");
  const restrictedBlok = localStorage.getItem("restrictedBlok");
  const restrictedNomorRumah = localStorage.getItem("restrictedNomorRumah");

  const { data: residents = [], isLoading, error } = useResidents(restrictedBlok, restrictedNomorRumah);
  const { data: iplSettings } = useIplSettings();
  const { data: unpaidPeriods = [] } = useResidentUnpaidPeriods(residents.length > 0 ? residents[0] : undefined);
  const addResidentMutation = useAddResident();
  const bulkAddResidentMutation = useBulkAddResidents();
  const changePasswordMutation = useChangePassword();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("adminUser");
    localStorage.removeItem("userRole");
    localStorage.removeItem("restrictedBlok");
    localStorage.removeItem("restrictedNomorRumah");
    navigate("/login");
  };

  const handleAddResident = (resident: Omit<Resident, 'id'>) => {
    addResidentMutation.mutate(resident);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Password tidak cocok!");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password minimal 6 karakter!");
      return;
    }

    changePasswordMutation.mutate({
      username: adminName,
      newPassword: newPassword
    }, {
      onSuccess: () => {
        setIsPasswordDialogOpen(false);
        setNewPassword("");
        setConfirmPassword("");
      }
    });
  };

  const handleDownloadTemplateWarga = () => {
    const headers = [
      ["nama", "nik", "nomor_kk", "jenis_kelamin", "tanggal_lahir", "pekerjaan", "status_perkawinan", "alamat", "blok_rumah", "nomor_rumah", "rt", "rw", "status_kepemilikan_rumah", "nominal_ipl", "status_ipl", "no_hp_kepala"]
    ];
    const example = [
      ["Budi Santoso", "1234567890123456", "1234567890123456", "Laki-laki", "1990-01-01", "Karyawan", "Kawin", "Jl. Mawar No. 1", "A", "01", "001", "001", "Milik Sendiri", "150000", "Lunas", "08123456789"]
    ];
    const ws = XLSX.utils.aoa_to_sheet([...headers, ...example]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template Warga");
    XLSX.writeFile(wb, "Template_Upload_Warga.xlsx");
  };

  const handleUploadWarga = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];

        interface ExcelResident {
          nama?: string;
          nik?: string;
          nomor_kk?: string;
          jenis_kelamin?: string;
          tanggal_lahir?: string;
          pekerjaan?: string;
          status_perkawinan?: string;
          alamat?: string;
          blok_rumah?: string;
          nomor_rumah?: string;
          rt?: string;
          rw?: string;
          status_kepemilikan_rumah?: string;
          nominal_ipl?: string;
          status_ipl?: string;
          no_hp_kepala?: string;
        }

        const data = XLSX.utils.sheet_to_json<ExcelResident>(ws);

        const newResidents = data.map((item) => ({
          nik: String(item.nik || ""),
          nomorKK: String(item.nomor_kk || ""),
          nama: String(item.nama || ""),
          noHpKepala: String(item.no_hp_kepala || ""),
          jumlahAnggota: 1, // Defaulting to 1 for bulk upload, can be refined
          anggotaKeluarga: [{
            nama: String(item.nama || ""),
            nik: String(item.nik || ""),
            status: "Kepala Keluarga",
            jenisKelamin: String(item.jenis_kelamin || ""),
            tanggalLahir: String(item.tanggal_lahir || ""),
            pekerjaan: String(item.pekerjaan || ""),
            statusPerkawinan: String(item.status_perkawinan || ""),
            noHp: String(item.no_hp_kepala || "")
          }],
          jenisKelamin: String(item.jenis_kelamin || ""),
          tanggalLahir: String(item.tanggal_lahir || ""),
          alamat: String(item.alamat || ""),
          nomorRumah: String(item.nomor_rumah || ""),
          blokRumah: String(item.blok_rumah || ""),
          rt: String(item.rt || ""),
          rw: String(item.rw || ""),
          statusKepemilikanRumah: String(item.status_kepemilikan_rumah || ""),
          pekerjaan: String(item.pekerjaan || ""),
          statusPerkawinan: String(item.status_perkawinan || ""),
          nominalIPL: String(item.nominal_ipl || ""),
          statusIPL: String(item.status_ipl || "Belum Lunas"),
          createdAt: new Date(),
          tanggalPendaftaran: new Date().toISOString().split('T')[0]
        }));

        bulkAddResidentMutation.mutate(newResidents, {
          onSuccess: () => {
            setIsUploading(false);
            e.target.value = "";
          },
          onError: () => setIsUploading(false)
        });
      } catch (err) {
        console.error(err);
        toast.error("Gagal memproses file Excel");
        setIsUploading(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleExportData = () => {
    if (residents.length === 0) return;

    // Header untuk CSV
    const headers = [
      "Nama", "NIK", "No KK", "Status Hubungan", "Blok", "No Rumah", "RT", "RW",
      "Jenis Kelamin", "Tanggal Lahir", "Pekerjaan", "Status Perkawinan",
      "Status Rumah", "Nominal IPL", "Status IPL", "No HP Kepala"
    ];

    // Buat baris data: mendatarkan (flatten) semua anggota keluarga
    const rows = residents.flatMap(resident => {
      return (resident.anggotaKeluarga || []).map(member => [
        member.nama,
        member.nik,
        resident.nomorKK,
        member.status,
        resident.blokRumah,
        resident.nomorRumah,
        resident.rt,
        resident.rw,
        member.jenisKelamin,
        member.tanggalLahir,
        member.pekerjaan,
        member.statusPerkawinan,
        resident.statusKepemilikanRumah,
        resident.nominalIPL,
        resident.statusIPL,
        resident.noHpKepala
      ]);
    });

    // Gabungkan header dan baris menjadi format CSV
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${(cell || "").toString().replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    // Buat file blob dan trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Data_Warga_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const stats = useMemo(() => {
    // Ambil semua anggota keluarga dari semua data warga
    const allMembers = residents.flatMap(r => r.anggotaKeluarga || []);

    const total = allMembers.length;
    const male = allMembers.filter((m) => m.jenisKelamin === "Laki-laki").length;
    const female = allMembers.filter((m) => m.jenisKelamin === "Perempuan").length;

    const calculateAge = (birthDate: string) => {
      if (!birthDate) return 0;
      try {
        const today = new Date();
        const birth = new Date(birthDate);
        if (isNaN(birth.getTime())) return 0;

        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
          age--;
        }
        return age;
      } catch (e) {
        return 0;
      }
    };

    const children = allMembers.filter((m) => calculateAge(m.tanggalLahir) < 18).length;

    // Hitung jumlah KK unik
    const uniqueKK = new Set(residents.map((r) => r.nomorKK)).size;

    // Hitung total IPL dan yang lunas
    const totalIPL = residents.reduce((sum, r) => sum + (Number(r.nominalIPL) || 0), 0);
    const iplLunas = residents.filter((r) => r.statusIPL === "Lunas").length;

    // For resident view, totalDue is calculated from their unpaidPeriods
    const monthlyIplVal = parseInt(iplSettings?.value || "0");
    const totalDue = userRole === 'admin' ? 0 : (unpaidPeriods?.length || 0) * (isNaN(monthlyIplVal) ? 0 : monthlyIplVal);

    return { total, male, female, children, uniqueKK, totalIPL, iplLunas, totalDue };
  }, [residents, unpaidPeriods, iplSettings, userRole]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="text-lg text-muted-foreground">Memuat data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-lg text-destructive">Gagal memuat data</p>
          <p className="text-sm text-muted-foreground">Pastikan koneksi internet Anda stabil</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Simplified Header */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-card/60 p-6 rounded-2xl border backdrop-blur-md gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
              Cluster Madani <span className="text-primary tracking-normal font-medium text-lg ml-1 opacity-80">(Data Warga)</span>
            </h1>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full text-xs font-semibold text-primary border border-primary/20">
              <Calendar className="w-3 h-3" />
              {userRole === 'admin' ? 'Dashboard Administrator' : `Blok ${restrictedBlok} No ${restrictedNomorRumah}`}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-4">
            <div className="flex flex-col items-center sm:items-end text-right">
              <span className="text-lg font-bold text-primary leading-tight">Selamat datang,</span>
              <span className="text-sm font-medium text-muted-foreground capitalize">{adminName}</span>
            </div>

            <div className="flex items-center gap-2">
              {userRole === "admin" && (
                <AdminMenu onExport={handleExportData} />
              )}

              <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2 h-9 rounded-full border-primary/20 hover:border-destructive hover:bg-destructive hover:text-white transition-all">
                <LogOut className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Keluar</span>
              </Button>

              {userRole === "admin" && (
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleDownloadTemplateWarga} className="gap-2 h-9 rounded-full border-primary/20 hover:bg-primary/5 transition-all">
                    <Download className="w-4 h-4" />
                    <span className="hidden lg:inline text-xs font-semibold uppercase tracking-wider">Template Warga</span>
                  </Button>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".xlsx, .xls"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={handleUploadWarga}
                      disabled={isUploading}
                    />
                    <Button variant="secondary" size="sm" className="gap-2 h-9 rounded-full transition-all" disabled={isUploading}>
                      {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      <span className="hidden lg:inline text-xs font-semibold uppercase tracking-wider">Upload Warga</span>
                    </Button>
                  </div>
                </div>
              )}

              <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 h-9 rounded-full border-primary/20 hover:bg-primary/5 transition-all">
                    <Key className="w-4 h-4 text-primary" />
                    <span className="hidden sm:inline text-xs font-semibold uppercase tracking-wider">Ganti Pass</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Ganti Password</DialogTitle>
                    <DialogDescription>
                      Masukkan password baru Anda di bawah ini.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-password">Password Baru</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Konfirmasi Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={changePasswordMutation.isPending}>
                        {changePasswordMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                        Simpan Password
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Statistics - Only show full stats for Admin */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          <StatCard
            title={userRole === 'admin' ? "Total Warga" : "Anggota Keluarga"}
            value={stats.total}
            icon={Users}
            description={userRole === 'admin' ? "Jumlah seluruh warga" : "Jumlah anggota keluarga"}
            variant="primary"
          />
          {userRole === 'admin' && (
            <StatCard
              title="Total KK"
              value={stats.uniqueKK}
              icon={FileText}
              description="Jumlah Kartu Keluarga"
              variant="accent"
            />
          )}
          <StatCard
            title="Laki-laki"
            value={stats.male}
            icon={UserCheck}
            description="Laki-laki"
            variant="success"
          />
          <StatCard
            title="Perempuan"
            value={stats.female}
            icon={UserX}
            description="Perempuan"
            variant="success"
          />
          <StatCard
            title="Anak-anak"
            value={stats.children}
            icon={Calendar}
            description="Usia di bawah 18 tahun"
            variant="default"
          />
          <StatCard
            title="Biaya IPL"
            value={`Rp ${parseInt(iplSettings?.value || "0").toLocaleString('id-ID')}`}
            icon={Banknote}
            description="Nominal IPL per bulan"
            variant="primary"
          />
          <StatCard
            title="Status IPL"
            value={userRole === 'admin' ? `${stats.iplLunas} Warga` : (unpaidPeriods.length === 0 ? "Lunas" : "Belum Lunas")}
            icon={CheckCircle}
            description={userRole === 'admin'
              ? "Sudah membayar bulan ini"
              : unpaidPeriods.length === 0
                ? "Sistem IPL sudah lunas"
                : `${unpaidPeriods.length} bulan belum lunas (Rp ${stats.totalDue.toLocaleString('id-ID')})`}
            variant={unpaidPeriods.length > 0 && userRole !== 'admin' ? "destructive" : "success"}
          />
        </div>

        {/* User context: If no residents exist for this house, allow creating the first one (Household record) */}
        {/* Admin context: Can always add residents */}
        {(userRole === "admin" || residents.length === 0) && (
          <div className="space-y-4">
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg text-sm text-primary">
              {userRole === "admin"
                ? "Admin dapat menambahkan warga baru ke blok dan nomor rumah mana saja."
                : "Sepertinya data keluarga Anda belum terdaftar. Silakan isi form di bawah untuk mendaftarkan data keluarga Anda."}
            </div>
            <AddResidentForm
              onAddResident={handleAddResident}
              isLoading={addResidentMutation.isPending}
            // We could pass prefilled data here if needed
            />
          </div>
        )}

        {/* List */}
        <ResidentList residents={residents} />
      </div>
    </div>
  );
};

export default Index;
