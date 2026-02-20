import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useProfiles, useAddProfile, useDeleteProfile, useBulkAddProfiles } from "@/hooks/useProfiles";
import { Trash2, UserPlus, ArrowLeft, Loader2, Download, Upload, Eye, EyeOff, Save } from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const AdminUsers = () => {
    const navigate = useNavigate();
    const { data: profiles = [], isLoading } = useProfiles();
    const addProfileMutation = useAddProfile();
    const deleteProfileMutation = useDeleteProfile();
    const bulkAddMutation = useBulkAddProfiles();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState<"admin" | "user">("user");
    const [restrictedBlok, setRestrictedBlok] = useState("");
    const [restrictedNomorRumah, setRestrictedNomorRumah] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [uploadResults, setUploadResults] = useState<{ username: string; password: string; role: string }[] | null>(null);
    const [isResultsOpen, setIsResultsOpen] = useState(false);

    const generatePassword = () => {
        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let pass = "";
        for (let i = 0; i < 8; i++) {
            pass += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return pass;
    };

    const handleDownloadTemplate = () => {
        const headers = [["username", "role", "blok", "no_rumah"]];
        const data = [
            ["admin_test", "admin", "", ""],
            ["warga_A01", "user", "A", "01"]
        ];
        const ws = XLSX.utils.aoa_to_sheet([...headers, ...data]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template User");
        XLSX.writeFile(wb, "Template_Upload_User.xlsx");
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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

                interface ExcelUser {
                    username?: string;
                    role?: string;
                    blok?: string;
                    no_rumah?: string;
                }

                const data = XLSX.utils.sheet_to_json<ExcelUser>(ws);

                const newProfiles = data.map((item) => ({
                    username: item.username || `user_${Math.random().toString(36).substr(2, 5)}`,
                    password: generatePassword(),
                    role: (item.role || "user") as "admin" | "user",
                    restricted_blok: item.role === "user" ? (item.blok || null) : null,
                    restricted_nomor_rumah: item.role === "user" ? (item.no_rumah || null) : null,
                }));

                bulkAddMutation.mutate(newProfiles, {
                    onSuccess: () => {
                        setIsUploading(false);
                        setUploadResults(newProfiles);
                        setIsResultsOpen(true);
                        e.target.value = ""; // clear input
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

    const handleExportResults = () => {
        if (!uploadResults) return;
        const ws = XLSX.utils.json_to_sheet(uploadResults);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Hasil Upload");
        XLSX.writeFile(wb, "Hasil_Upload_Password.xlsx");
    };

    const handleAddUser = (e: React.FormEvent) => {
        e.preventDefault();
        addProfileMutation.mutate({
            username,
            password,
            role,
            restricted_blok: role === "user" ? restrictedBlok : null,
            restricted_nomor_rumah: role === "user" ? restrictedNomorRumah : null,
        }, {
            onSuccess: () => {
                setUsername("");
                setPassword("");
                setRestrictedBlok("");
                setRestrictedNomorRumah("");
            }
        });
    };

    const currentRole = localStorage.getItem("userRole");
    if (currentRole !== "admin") {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4">
                    <h1 className="text-2xl font-bold text-destructive">Akses Ditolak</h1>
                    <p>Hanya admin yang dapat mengakses halaman ini.</p>
                    <Button onClick={() => navigate("/")}>Kembali ke Beranda</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-8">
            <div className="container mx-auto space-y-8">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => navigate("/")}>
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <h1 className="text-3xl font-bold">Kelola User</h1>
                </div>

                <div className="flex flex-wrap gap-4 mb-4">
                    <Button variant="outline" onClick={handleDownloadTemplate} className="gap-2">
                        <Download className="w-4 h-4" />
                        Download Template
                    </Button>
                    <div className="relative">
                        <input
                            type="file"
                            accept=".xlsx, .xls"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={handleFileUpload}
                            disabled={isUploading}
                        />
                        <Button variant="secondary" className="gap-2" disabled={isUploading}>
                            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                            Upload Data User (Excel)
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Form Add User */}
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <UserPlus className="w-5 h-5" />
                                Tambah User Baru
                            </CardTitle>
                            <CardDescription>Buat akun untuk admin atau warga.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleAddUser} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="username">Username</Label>
                                    <Input
                                        id="username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="role">Role</Label>
                                    <Select value={role} onValueChange={(v: "admin" | "user") => setRole(v)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih Role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="admin">Admin</SelectItem>
                                            <SelectItem value="user">User (Warga)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                {role === "user" && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="blok">Blok</Label>
                                            <Input
                                                id="blok"
                                                placeholder="Contoh: A"
                                                value={restrictedBlok}
                                                onChange={(e) => setRestrictedBlok(e.target.value)}
                                                required={role === "user"}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="noRumah">No Rumah</Label>
                                            <Input
                                                id="noRumah"
                                                placeholder="Contoh: 12"
                                                value={restrictedNomorRumah}
                                                onChange={(e) => setRestrictedNomorRumah(e.target.value)}
                                                required={role === "user"}
                                            />
                                        </div>
                                    </div>
                                )}
                                <Button type="submit" className="w-full" disabled={addProfileMutation.isPending}>
                                    {addProfileMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                    Simpan User
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* User List */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Daftar User</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Username</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Rumah (Blok/No)</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-8">
                                                <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
                                            </TableCell>
                                        </TableRow>
                                    ) : profiles.map((profile) => (
                                        <TableRow key={profile.id}>
                                            <TableCell className="font-medium">{profile.username}</TableCell>
                                            <TableCell className="capitalize">{profile.role}</TableCell>
                                            <TableCell>
                                                {profile.role === 'admin' ? "-" : `${profile.restricted_blok || '?'}/${profile.restricted_nomor_rumah || '?'}`}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="hover:text-destructive"
                                                    onClick={() => {
                                                        if (confirm("Hapus user ini?")) {
                                                            deleteProfileMutation.mutate(profile.id);
                                                        }
                                                    }}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                {/* Results Dialog */}
                <Dialog open={isResultsOpen} onOpenChange={setIsResultsOpen}>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Save className="w-5 h-5 text-success" />
                                Hasil Upload & Password
                            </DialogTitle>
                            <DialogDescription>
                                Berikut adalah daftar user yang baru saja dibuat beserta password mereka.
                                <span className="block font-bold mt-1 text-destructive">
                                    PENTING: Segera simpan atau download daftar ini karena password tidak akan ditampilkan lagi demi keamanan.
                                </span>
                            </DialogDescription>
                        </DialogHeader>

                        <div className="flex-1 overflow-auto my-4 border rounded-md">
                            <Table>
                                <TableHeader className="sticky top-0 bg-background">
                                    <TableRow>
                                        <TableHead>Username</TableHead>
                                        <TableHead>Password</TableHead>
                                        <TableHead>Role</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {uploadResults?.map((res, i) => (
                                        <TableRow key={i}>
                                            <TableCell className="font-mono">{res.username}</TableCell>
                                            <TableCell className="font-mono font-bold text-primary">{res.password}</TableCell>
                                            <TableCell className="capitalize">{res.role}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        <DialogFooter className="gap-2">
                            <Button variant="outline" onClick={handleExportResults} className="gap-2">
                                <Download className="w-4 h-4" />
                                Download Hail (Excel)
                            </Button>
                            <Button onClick={() => setIsResultsOpen(false)}>
                                Selesai
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};

export default AdminUsers;
