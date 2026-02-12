import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useProfiles, useAddProfile, useDeleteProfile } from "@/hooks/useProfiles";
import { Trash2, UserPlus, ArrowLeft, Loader2 } from "lucide-react";

const AdminUsers = () => {
    const navigate = useNavigate();
    const { data: profiles = [], isLoading } = useProfiles();
    const addProfileMutation = useAddProfile();
    const deleteProfileMutation = useDeleteProfile();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState<"admin" | "user">("user");
    const [restrictedBlok, setRestrictedBlok] = useState("");
    const [restrictedNomorRumah, setRestrictedNomorRumah] = useState("");

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
                                    <Select value={role} onValueChange={(v: any) => setRole(v)}>
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
            </div>
        </div>
    );
};

export default AdminUsers;
