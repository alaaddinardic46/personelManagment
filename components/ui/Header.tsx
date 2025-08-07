"use client";

import React, { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { api } from "@/api";
import { getCookie, removeCookie } from '../../cookies'

export default function Header() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false); // Dialog açma/kapatma durumu
  const [password, setPassword] = useState(""); // Şifre input'u için state
  const [confirmPassword, setConfirmPassword] = useState(""); // Şifre doğrulama input'u
  const router = useRouter();
  const user = getCookie('user');

  useEffect(() => {
    const fullName = user.fullName;
    const email = user.email;
    if (fullName) {
      setFullName(fullName);
    }
    if (email) {
      setEmail(email);
    }
  }, []);

  // Çıkış yapma fonksiyonu
  function quit() {
    removeCookie('user');
    router.push("/login");
  }

  // Şifre güncelleme fonksiyonu
  const handlePasswordChange = async () => {
    if (password !== confirmPassword) {
      alert("Şifreler uyuşmuyor");
      return;
    }

    const personelId = user.id;
    if (!personelId) {
      alert("Personel bilgisi bulunamadı!");
      return;
    }

    try {
      const response = await axios.get(
        api+`personel/PasswordChange?id=${personelId}&password=${password}`
      );
      if (response.data.success) {
        alert(response.data.message);
        setIsDialogOpen(false); // Dialog'u kapat
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Şifre güncellenirken bir hata oluştu:", error);
      alert("Şifre güncellenemedi.");
    }
  };

  return (
    <header className="flex justify-between items-center px-4 py-3 border-b">
      {/* Sol üstte website adı */}
      <div className="text-xl font-bold">
        <a href="/">MyWebsite</a>
      </div>

      {/* Sağda avatar ve dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Avatar className="cursor-pointer">
            <AvatarImage src="/avatar.jpg" alt="User Avatar" />
            <AvatarFallback>{fullName.charAt(0)}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-48">
          {/* Kullanıcı bilgisi */}
          <div className="px-2 py-2 mb-1 border-b">
            <p className="font-semibold">{fullName}</p>
            <p className="text-sm text-gray-500">{email}</p>
          </div>

          {/* Menü seçenekleri */}
          <DropdownMenuItem
            className="cursor-pointer"
            onSelect={() => setIsDialogOpen(true)} // Şifre güncelleme penceresini aç
          >
            Şifreyi Değiştir
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer" onSelect={quit}>
            Çıkış Yap
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Şifre değişiklik dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Şifrenizi Güncelleyin</DialogTitle>
            <DialogClose />
          </DialogHeader>

          {/* Şifre girişi */}
          <div className="space-y-4">
            <Input
              type="password"
              placeholder="Yeni Şifre"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full"
            />
            <Input
              type="password"
              placeholder="Şifreyi Doğrulayın"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              İptal
            </Button>
            <Button onClick={handlePasswordChange}>Güncelle</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
}