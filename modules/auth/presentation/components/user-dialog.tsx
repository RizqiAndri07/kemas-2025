"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, UserPlus, UserCheck, AlertCircle, ShieldCheck, Lock, Eye, EyeOff } from "lucide-react";
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
      setErrorMessage("Username dan email wajib diisi.");
      return;
    }

    if (!isEdit && (!password || password.length < 8)) {
      setErrorMessage("Kata sandi awal minimal 8 karakter wajib diisi untuk pengguna baru.");
      return;
    }

    if (isEdit && password && password.length < 8) {
      setErrorMessage("Kata sandi baru minimal 8 karakter.");
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
            setErrorMessage(res.error || "Gagal memperbarui pengguna");
            return;
          }
        } else {
          const res = await createUserAction({
            username: username.trim(),
            email: email.trim(),
            role,
            password,
          });

          if (!res.success) {
            setErrorMessage(res.error || "Gagal menambahkan pengguna");
            return;
          }
        }

        onOpenChange(false);
        router.refresh();
      } catch (err) {
        setErrorMessage(
          err instanceof Error ? err.message : "Terjadi kesalahan internal"
        );
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
                  : "Buat akun panitia baru. Pengguna dapat langsung login menggunakan email & kata sandi yang ditentukan."}
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

          {/* Password */}
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-medium">
              {isEdit ? "Kata Sandi Baru (Opsional)" : "Kata Sandi Awal"} {!isEdit && <span className="text-destructive">*</span>}
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder={isEdit ? "Biarkan kosong jika tidak diubah" : "Minimal 8 karakter"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isPending}
                className="pl-9 pr-10 h-9 text-sm"
                required={!isEdit}
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
              {isEdit
                ? "Isi hanya jika ingin mereset kata sandi pengguna ini (min 8 karakter)."
                : "Kata sandi yang akan digunakan pengguna untuk login pertama kali (min 8 karakter)."}
            </p>
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

          {/* Info Status Verified */}
          <div className="flex items-start gap-2.5 rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-primary">
            <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Pengguna yang ditambahkan oleh Superadmin otomatis terverifikasi dan langsung dapat masuk ke dashboard menggunakan Supabase Auth.
            </p>
          </div>

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
              {isEdit ? "Simpan Perubahan" : "Tambah Pengguna"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
