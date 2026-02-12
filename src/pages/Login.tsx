import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Lock, User, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Redirect if already logged in
        if (localStorage.getItem("isAuthenticated") === "true") {
            navigate("/", { replace: true });
        }
    }, [navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('username', username)
                .eq('password', password) // In a real app, use hashing!
                .single();

            if (error || !data) {
                toast.error("Username atau Password salah.");
                setIsLoading(false);
                return;
            }

            localStorage.setItem("isAuthenticated", "true");
            localStorage.setItem("userRole", data.role);
            localStorage.setItem("adminUser", data.username);

            if (data.restricted_blok) {
                localStorage.setItem("restrictedBlok", data.restricted_blok);
            } else {
                localStorage.removeItem("restrictedBlok");
            }

            if (data.restricted_nomor_rumah) {
                localStorage.setItem("restrictedNomorRumah", data.restricted_nomor_rumah);
            } else {
                localStorage.removeItem("restrictedNomorRumah");
            }

            localStorage.removeItem("restrictedKK"); // Cleanup old key

            toast.success(`Login Berhasil! Selamat datang, ${data.username}.`);
            navigate("/", { replace: true });
        } catch (err) {
            console.error("Login error:", err);
            toast.error("Terjadi kesalahan saat login.");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold text-foreground bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        Admin Login
                    </h1>
                    <p className="text-muted-foreground">
                        Sistem Pendataan Warga New Cluster Madani
                    </p>
                </div>

                <Card className="border-2 shadow-xl backdrop-blur-sm bg-card/80">
                    <CardHeader>
                        <CardTitle className="text-xl flex items-center gap-2">
                            <Lock className="w-5 h-5 text-primary" />
                            Masuk ke Dashboard
                        </CardTitle>
                        <CardDescription>
                            Gunakan akun admin Anda untuk mengelola data warga.
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleLogin}>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="username">Username</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="username"
                                        placeholder="Masukkan username"
                                        className="pl-10"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="Masukkan password"
                                        className="pl-10"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Menghubungkan...
                                    </>
                                ) : (
                                    "Masuk Sekarang"
                                )}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>

                <p className="text-center text-sm text-muted-foreground">
                    &copy; 2026 New Cluster Madani Digitalization
                </p>
            </div>
        </div>
    );
};

export default Login;
