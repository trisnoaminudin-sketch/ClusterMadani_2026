import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/StatCard";
import { AddResidentForm } from "@/components/AddResidentForm";
import { ResidentList } from "@/components/ResidentList";
import { useResidents, useAddResident, Resident } from "@/hooks/useResidents";
import { Users, UserCheck, UserX, Calendar, FileText, Banknote, CheckCircle, Loader2, LogOut } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const adminName = localStorage.getItem("adminUser") || "User";
  const userRole = localStorage.getItem("userRole");
  const restrictedBlok = localStorage.getItem("restrictedBlok");
  const restrictedNomorRumah = localStorage.getItem("restrictedNomorRumah");

  const { data: residents = [], isLoading, error } = useResidents(restrictedBlok, restrictedNomorRumah);
  const addResidentMutation = useAddResident();

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

  const stats = useMemo(() => {
    // Ambil semua anggota keluarga dari semua data warga
    const allMembers = residents.flatMap(r => r.anggotaKeluarga || []);

    const total = allMembers.length;
    const male = allMembers.filter((m) => m.jenisKelamin === "Laki-laki").length;
    const female = allMembers.filter((m) => m.jenisKelamin === "Perempuan").length;

    const calculateAge = (birthDate: string) => {
      if (!birthDate) return 0;
      const today = new Date();
      const birth = new Date(birthDate);
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      return age;
    };

    const children = allMembers.filter((m) => calculateAge(m.tanggalLahir) < 18).length;

    // Hitung jumlah KK unik
    const uniqueKK = new Set(residents.map((r) => r.nomorKK)).size;

    // Hitung total IPL dan yang lunas
    const totalIPL = residents.reduce((sum, r) => sum + (Number(r.nominalIPL) || 0), 0);
    const iplLunas = residents.filter((r) => r.statusIPL === "Lunas").length;

    return { total, male, female, children, uniqueKK, totalIPL, iplLunas };
  }, [residents]);

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
        {/* Header with Logout and Admin Menu */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-card/50 p-6 rounded-2xl border backdrop-blur-sm">
          <div className="space-y-1 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Sistem Pendataan Warga New Cluster Madani
            </h1>
            <p className="text-muted-foreground">
              {userRole === 'admin' ? 'Digitalisasi Data Warga Cluster Madani' : `Rumah: Blok ${restrictedBlok} No ${restrictedNomorRumah}`}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">Selamat datang,</p>
              <p className="text-xs text-muted-foreground capitalize">{adminName} ({userRole})</p>
            </div>

            {userRole === "admin" && (
              <Button variant="secondary" size="sm" onClick={() => navigate("/admin/users")} className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Kelola User
              </Button>
            )}

            <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center gap-2 hover:bg-destructive hover:text-destructive-foreground transition-all">
              <LogOut className="w-4 h-4" />
              Keluar
            </Button>
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
            title="IPL"
            value={`Rp ${stats.totalIPL.toLocaleString('id-ID')}`}
            icon={Banknote}
            description={userRole === 'admin' ? "Tagihan IPL" : "Tagihan IPL Rumah"}
            variant="primary"
          />
          <StatCard
            title="Status IPL"
            value={userRole === 'admin' ? stats.iplLunas : (residents[0]?.statusIPL || "-")}
            icon={CheckCircle}
            description={userRole === 'admin' ? "Warga yang sudah lunas" : "Status pembayaran Anda"}
            variant="success"
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
