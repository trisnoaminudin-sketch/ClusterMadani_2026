import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Save, CheckCircle, XCircle, FileText } from "lucide-react";
import { useResidents } from "@/hooks/useResidents";
import {
  useIplSettings,
  useUpdateIplSettings,
  usePayIpl,
  useResetIplStatus,
  useIplPayments,
} from "@/hooks/useIpl";
import { AdminMenu } from "@/components/AdminMenu";

const AdminIpl = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [iplAmountInput, setIplAmountInput] = useState("");

  // Hooks
  const { data: residents, isLoading: isLoadingResidents } = useResidents();
  const { data: iplSettings, isLoading: isLoadingSettings } = useIplSettings();
  const { data: paymentHistory, isLoading: isLoadingHistory } = useIplPayments();

  const updateSettingsMutation = useUpdateIplSettings();
  const payMutation = usePayIpl();
  const resetMutation = useResetIplStatus();

  // Initialize input when data loads
  if (iplSettings?.value && !iplAmountInput && iplAmountInput !== "0") {
    setIplAmountInput(iplSettings.value);
  }

  const handleSaveSettings = () => {
    updateSettingsMutation.mutate(iplAmountInput);
  };

  const handlePay = (residentId: string) => {
    const amount = parseInt(iplSettings?.value || "0");
    const period = format(new Date(), "yyyy-MM");
    payMutation.mutate({ residentId, amount, period });
  };

  const handleReset = (residentId: string) => {
    if (confirm("Apakah anda yakin ingin mengubah status menjadi Belum Lunas?")) {
      resetMutation.mutate(residentId);
    }
  };

  const filteredResidents = residents?.filter((resident) =>
    resident.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resident.blokRumah.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resident.nomorRumah.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Manajemen IPL</h1>
          <p className="text-muted-foreground mt-2">
            Kelola pembayaran dan pengaturan Iuran Pemeliharaan Lingkungan
          </p>
        </div>
        <AdminMenu />
      </div>

      <Tabs defaultValue="payment" className="space-y-6">
        <TabsList>
          <TabsTrigger value="payment" className="gap-2">
            <CheckCircle className="w-4 h-4" />
            Pembayaran
          </TabsTrigger>
          <TabsTrigger value="report" className="gap-2">
            <FileText className="w-4 h-4" />
            Laporan Database
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Search className="w-4 h-4" />
            Pengaturan
          </TabsTrigger>
        </TabsList>

        {/* Tab Pembayaran */}
        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>Status Pembayaran Warga</CardTitle>
              <CardDescription>
                Update status pembayaran IPL warga untuk periode ini.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari warga..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama</TableHead>
                      <TableHead>Blok / No</TableHead>
                      <TableHead>Status IPL</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingResidents ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8">
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : filteredResidents?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8">
                          Tidak ada data warga ditemukan
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredResidents?.map((resident) => (
                        <TableRow key={resident.id}>
                          <TableCell className="font-medium">{resident.nama}</TableCell>
                          <TableCell>
                            {resident.blokRumah} / {resident.nomorRumah}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                resident.statusIPL === "Lunas"
                                  ? "default" // or success if available, default is black/primary
                                  : "destructive"
                              }
                              className={
                                resident.statusIPL === "Lunas"
                                  ? "bg-green-600 hover:bg-green-700"
                                  : ""
                              }
                            >
                              {resident.statusIPL || "Belum Lunas"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {resident.statusIPL === "Lunas" ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleReset(resident.id)}
                              >
                                Batal
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => handlePay(resident.id)}
                              >
                                Bayar
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Laporan */}
        <TabsContent value="report">
          <Card>
            <CardHeader>
              <CardTitle>Laporan Transaksi IPL</CardTitle>
              <CardDescription>
                Riwayat pembayaran IPL yang tercatat dalam sistem database.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tanggal Bayar</TableHead>
                      <TableHead>Nama Warga</TableHead>
                      <TableHead>Periode</TableHead>
                      <TableHead>Jumlah</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingHistory ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : paymentHistory?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          Belum ada data transaksi
                        </TableCell>
                      </TableRow>
                    ) : (
                      paymentHistory?.map((payment: {
                        id: string;
                        payment_date: string;
                        residents: { nama: string; blok_rumah: string; nomor_rumah: string } | null;
                        period: string;
                        amount: string;
                        status: string
                      }) => (
                        <TableRow key={payment.id}>
                          <TableCell>
                            {format(new Date(payment.payment_date), "dd MMM yyyy HH:mm", {
                              locale: id,
                            })}
                          </TableCell>
                          <TableCell>
                            {payment.residents?.nama} ({payment.residents?.blok_rumah}/{payment.residents?.nomor_rumah})
                          </TableCell>
                          <TableCell>{payment.period}</TableCell>
                          <TableCell>
                            Rp {parseInt(payment.amount).toLocaleString("id-ID")}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              {payment.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Pengaturan */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Harga IPL</CardTitle>
              <CardDescription>
                Tentukan nilai nominal IPL yang berlaku untuk seluruh warga.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-w-md space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nominal IPL (Rp)</label>
                  <Input
                    type="number"
                    placeholder="Contoh: 50000"
                    value={iplAmountInput}
                    onChange={(e) => setIplAmountInput(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Nilai ini akan muncul di dashboard semua warga.
                  </p>
                </div>
                <Button
                  onClick={handleSaveSettings}
                  disabled={updateSettingsMutation.isPending}
                >
                  {updateSettingsMutation.isPending ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminIpl;
