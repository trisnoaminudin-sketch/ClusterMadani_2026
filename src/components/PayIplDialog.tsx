import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Upload, Loader2, Mail, CheckCircle2 } from "lucide-react";
import { Resident } from "@/hooks/useResidents";
import { useResidentUnpaidPeriods, useSubmitResidentPayment } from "@/hooks/useIpl";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";

interface PayIplDialogProps {
  resident: Resident;
  monthlyAmount: number;
}

export const PayIplDialog = ({ resident, monthlyAmount }: PayIplDialogProps) => {
  const [open, setOpen] = useState(false);
  const [selectedPeriods, setSelectedPeriods] = useState<string[]>([]);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const { data: unpaidPeriods = [], isLoading: isLoadingUnpaid } = useResidentUnpaidPeriods(resident);
  const submitPayment = useSubmitResidentPayment();

  const handleTogglePeriod = (period: string) => {
    setSelectedPeriods(prev => 
      prev.includes(period) 
        ? prev.filter(p => p !== period)
        : [...prev, period]
    );
  };

  const totalAmount = selectedPeriods.length * monthlyAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPeriods.length === 0) {
      toast.error("Pilih minimal satu bulan pembayaran");
      return;
    }
    if (!proofFile) {
      toast.error("Harap upload bukti transfer");
      return;
    }

    submitPayment.mutate({
      residentId: resident.id,
      amount: totalAmount,
      periods: selectedPeriods,
      proofFile: proofFile
    }, {
      onSuccess: (data) => {
        // Generate mailto link
        const subject = encodeURIComponent(`Konfirmasi Pembayaran IPL - ${resident.nama} - ${resident.blokRumah}/${resident.nomorRumah}`);
        const body = encodeURIComponent(
          `Halo Admin Cluster Madani,\n\n` +
          `Saya ingin mengonfirmasi pembayaran IPL dengan rincian sebagai berikut:\n` +
          `- Nama: ${resident.nama}\n` +
          `- Blok/No: ${resident.blokRumah}/${resident.nomorRumah}\n` +
          `- Periode: ${data.periods.join(", ")}\n` +
          `- Total Bayar: Rp ${totalAmount.toLocaleString('id-ID')}\n` +
          `- Link Bukti: ${data.proofUrl}\n\n` +
          `Mohon segera diproses. Terima kasih.`
        );
        
        const mailtoUrl = `mailto:clustermadani16.06@gmail.com?subject=${subject}&body=${body}`;
        
        // Open email client
        window.location.href = mailtoUrl;
        
        // Reset and close
        setSelectedPeriods([]);
        setProofFile(null);
        setOpen(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 h-9 rounded-full bg-green-600 hover:bg-green-700">
          <CreditCard className="w-4 h-4" />
          <span>Bayar IPL</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Konfirmasi Pembayaran IPL</DialogTitle>
          <DialogDescription>
            Silakan pilih bulan yang akan dibayar dan upload bukti transfer.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Pilih Bulan (Belum Lunas)</Label>
            {isLoadingUnpaid ? (
              <div className="flex items-center gap-2 py-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-xs text-muted-foreground">Memuat tagihan...</span>
              </div>
            ) : unpaidPeriods.length === 0 ? (
              <div className="flex items-center gap-2 py-2 text-green-600 italic text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>Semua tagihan sudah lunas!</span>
              </div>
            ) : (
              <ScrollArea className="h-40 border rounded-md p-3">
                <div className="space-y-2">
                  {unpaidPeriods.map((period) => (
                    <div key={period} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`period-${period}`} 
                        checked={selectedPeriods.includes(period)}
                        onCheckedChange={() => handleTogglePeriod(period)}
                      />
                      <label 
                        htmlFor={`period-${period}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {period}
                      </label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-muted rounded-lg space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase font-bold">Biaya per Bulan</span>
              <p className="font-bold text-sm">Rp {monthlyAmount.toLocaleString('id-ID')}</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg space-y-1">
              <span className="text-[10px] text-primary uppercase font-bold">Total Pembayaran</span>
              <p className="font-bold text-sm text-primary">Rp {totalAmount.toLocaleString('id-ID')}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="proof" className="text-sm font-semibold">Upload Bukti Transfer (Image/PDF)</Label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-muted-foreground/25 rounded-lg hover:border-primary/50 transition-colors cursor-pointer relative">
              <div className="space-y-1 text-center">
                {proofFile ? (
                  <div className="flex flex-col items-center">
                    <CheckCircle2 className="mx-auto h-10 w-10 text-green-500" />
                    <p className="mt-2 text-sm font-medium text-foreground">{proofFile.name}</p>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={(e) => { e.stopPropagation(); setProofFile(null); }}
                      className="text-destructive mt-1 h-7 h-auto py-1"
                    >
                      Ganti File
                    </Button>
                  </div>
                ) : (
                  <>
                    <Upload className="mx-auto h-10 w-10 text-muted-foreground" />
                    <div className="flex text-sm text-muted-foreground">
                      <span className="relative cursor-pointer font-medium text-primary hover:text-primary/80">
                        Klik untuk upload
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">PNG, JPG, PDF up to 5MB</p>
                  </>
                )}
                <input 
                  id="proof" 
                  name="proof" 
                  type="file" 
                  accept="image/*,.pdf" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                  onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="sm:justify-start">
            <Button 
              type="submit" 
              className="w-full gap-2" 
              disabled={submitPayment.isPending || selectedPeriods.length === 0}
            >
              {submitPayment.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Mengirim...</span>
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  <span>Kirim & Konfirmasi Email</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
