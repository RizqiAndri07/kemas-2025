"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  UserPlus,
  UserCheck,
  AlertCircle,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Clock,
  Sparkles,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserRole } from "../../domain/role.enum";
import { UserSelect } from "../../infrastructure/user.table";
import { createUserAction, updateUserAction } from "../../application/user.actions";
import { toast } from "@/components/ui/sonner";

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userToEdit?: UserSelect | null;
}

export function UserDialog({ open, onOpenChange, userToEdit }: UserDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isEdit = Boolean(userToEdit);

  // Form State
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>(UserRole.ADMIN);

  // Sync form state when dialog opens or edit user changes
  useEffect(() => {
    if (userToEdit) {
      setUsername(userToEdit.username);
      setEmail(userToEdit.email);
      setPassword("");
      setRole(userToEdit.role as UserRole);
    } else {
      setUsername("");
      setEmail("");
      setPassword("");
      setRole(UserRole.ADMIN);
    }
    setShowPassword(false);
    setErrorMessage(null);
  }, [userToEdit, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!username.trim() || !email.trim()) {
      const msg = "Username dan email wajib diisi.";
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    if (isEdit && password && password.length < 8) {
      const msg = "Kata sandi baru minimal 8 karakter.";
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    startTransition(async () => {
      try {
        if (isEdit && userToEdit) {
          const res = await updateUserAction(userToEdit.id, {
            username: username.trim(),
            email: email.trim(),
            role,
            password: password ? password : undefined,
          });

          if (!res.success) {
            const msg = res.error || "Gagal memperbarui pengguna";
            setErrorMessage(msg);
            toast.error(msg);
            return;
          }
          toast.success(res.message || "Data pengguna berhasil diperbarui!");
        } else {
          const res = await createUserAction({
            username: username.trim(),
            email: email.trim(),
            role,
          });

          if (!res.success) {
            const msg = res.error || "Gagal menambahkan pengguna";
            setErrorMessage(msg);
            toast.error(msg);
            return;
          }
          toast.success(res.message || "Pengguna baru berhasil ditambahkan!");
        }

        onOpenChange(false);
        router.refresh();
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Terjadi kesalahan internal";
        setErrorMessage(msg);
        toast.error(msg);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              {isEdit ? (
                <UserCheck className="h-4 w-4" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
            </div>
            <div>
              <DialogTitle>
                {isEdit ? "Edit Data Pengguna" : "Tambah Pengguna Baru"}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {isEdit
                  ? "Perbarui informasi akun dan hak akses peran sistem."
                  : "Daftarkan akun panitia baru. Pengguna akan menerima email verifikasi dan kata sandi acak."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {errorMessage && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <p className="leading-relaxed font-medium">{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Username */}
          <div className="space-y-1.5">
            <Label htmlFor="username" className="text-xs font-medium">
              Username <span className="text-destructive">*</span>
            </Label>
            <Input
              id="username"
              placeholder="contoh: johan_admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isPending}
              className="h-9 text-sm"
              required
            />
            <p className="text-[11px] text-muted-foreground">
              Huruf, angka, strip, underscore, atau titik (min 3 karakter).
            </p>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-medium">
              Alamat Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@kemasprasasti.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isPending}
              className="h-9 text-sm"
              required
            />
          </div>

          {/* Role */}
          <div className="space-y-1.5">
            <Label htmlFor="role" className="text-xs font-medium">
              Peran (Role) <span className="text-destructive">*</span>
            </Label>
            <Select
              value={role}
              onValueChange={(val) => {
                if (val) setRole(val as UserRole);
              }}
              disabled={isPending}
            >
              <SelectTrigger id="role" className="h-9 text-sm w-full">
                <SelectValue placeholder="Pilih Peran" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UserRole.SUPERADMIN}>
                  Superadmin
                </SelectItem>
                <SelectItem value={UserRole.ADMIN}>
                  Admin
                </SelectItem>
                <SelectItem value={UserRole.CMS_WRITER}>
                  CMS Writer
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Password (Hanya ditampilkan pada Mode Edit Pengguna) */}
          {isEdit ? (
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-medium">
                Kata Sandi Baru (Opsional)
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Biarkan kosong jika tidak diubah"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isPending}
                  className="pl-9 pr-10 h-9 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Isi hanya jika ingin mengubah langsung kata sandi pengguna ini (min 8 karakter).
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3.5 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-semibold text-primary">
                <Mail className="h-4 w-4" />
                <span>Alur Otomatisasi Verifikasi & Kata Sandi</span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Superadmin tidak perlu menginput kata sandi secara manual. Sistem akan secara otomatis:
              </p>
              <ul className="space-y-1 text-muted-foreground list-disc pl-4">
                <li>Mengirim tautan verifikasi email ke alamat di atas (berlaku <strong>12 jam</strong>).</li>
                <li>Setelah tautan diklik, status akun menjadi <strong>Verified</strong>.</li>
                <li>Sistem men-generate <strong>kata sandi acak</strong> dan membuka form pembaruan kata sandi mandiri bagi pengguna.</li>
              </ul>
              <div className="flex items-center gap-1.5 pt-1 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                <Clock className="h-3.5 w-3.5" />
                <span>Tautan verifikasi kedaluwarsa dalam 12 jam.</span>
              </div>
            </div>
          )}

          <DialogFooter className="pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
              {isEdit ? "Simpan Perubahan" : "Daftarkan Pengguna"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
