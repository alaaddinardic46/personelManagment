"use client";

import React, { useState, useEffect } from "react";

import {
  Card,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

import { InfoIcon, ChevronLeft, ChevronRight } from "lucide-react";
import axios from "axios";
import Header from "@/components/ui/Header";
import { useRouter } from "next/navigation";
import { api } from "@/api";
import { getCookie } from '../../cookies'

enum AssignmentStatus {
  Beklemede = 0,
  DevamEdiyor = 1,
  Tamamlandı = 2,
  İptalEdildi = 3,
}

const statusLabels: Record<AssignmentStatus, string> = {
  [AssignmentStatus.Beklemede]: "Beklemede",
  [AssignmentStatus.DevamEdiyor]: "Devam Ediyor",
  [AssignmentStatus.Tamamlandı]: "Tamamlandı",
  [AssignmentStatus.İptalEdildi]: "İptal Edildi",
};

interface Assignment {
  id: number;
  title: string;
  description: string;
  personelId: number;
  assignedDate: string;
  dueDate?: string | null;
  status: AssignmentStatus;
}

function formatDate(dateString: string) {
  const d = new Date(dateString);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy}`;
}

const PAGE_SIZE = 8;

const getStatusBgColor = (status: AssignmentStatus) => {
  switch (status) {
    case AssignmentStatus.Beklemede:
      return "bg-gray-300 text-gray-800";  // Hafif gri-sarımsı, net ve soluk
    case AssignmentStatus.DevamEdiyor:
      return "bg-blue-300 text-gray-800";  // Soluk mavi, belirgin ama soft
    case AssignmentStatus.Tamamlandı:
      return "bg-green-300 text-gray-800";  // Soluk yeşil, ama hala belirgin
    case AssignmentStatus.İptalEdildi:
      return "bg-red-300 text-gray-800";  // Soluk kırmızı, dikkat çekici ama rahatsız etmeyen
    default:
      return "";
  }
};

export default function HomePage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const router = useRouter()
  const user = getCookie('user');

  useEffect(() => {
        const id = user.id;
        const statu = user.status;
        if(id){
            let status = "/user";
            if(statu == "1"){
                status = "/";
            }
            router.push(status);
        }else{
          router.push("/login");
        }
      }, [])


  useEffect(() => {
    async function fetchAssignments() {
      const personelId = user.id;
      if (!personelId) {
        console.warn("Personel ID bulunamadı!");
        return;
      }
      try {
        const response = await axios.get(api+"assignment/GetByIdAll", {
          params: {
            id: Number(personelId),
            page: page,
            pageSize: PAGE_SIZE,
            search: searchTerm || undefined,
          },
        });

        const data = response.data;
        setAssignments(data.items);
        setTotalCount(data.totalCount); // totalCount: toplam kayıt sayısı olmalı.
        console.log(data.totalCount);
      } catch (error) {
        console.error("Görev verisi alınırken hata:", error);
      }
    }

    fetchAssignments();
  }, [page, searchTerm]);

  const totalPages = totalCount;

  const handleStatusChange = async (id: number, newStatus: AssignmentStatus) => {
    try {
      const response = await axios.post(api+"assignment/UpdateAssignment", {
        Id: id,
        Status: newStatus,
      });
      console.log(response.data);
      if (response.data.success) {
        // Burada küçük harfle 'status' kullanıyoruz
        setAssignments((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, status: newStatus } : item
          )
        );
      } else {
        alert(response.data.message || "Güncelleme başarısız oldu.");
      }
    } catch (error) {
      console.error("Güncelleme hatası:", error);
      alert("Güncelleme sırasında bir hata oluştu.");
    }
  };

  return (
    <>
    <Header />
    <main className="max-w-3xl mx-auto p-4 space-y-4">
      <h1 className="text-3xl font-semibold">Görev Listesi</h1>

      <input
        type="text"
        placeholder="Görevde ara..."
        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
        value={searchTerm}
        onChange={(e) => {
          setPage(1);
          setSearchTerm(e.target.value);
        }}
      />

      {assignments.length === 0 && (
        <p className="text-center text-muted-foreground mt-8">Görev bulunamadı.</p>
      )}

      {assignments.map((assignment) => (
        <Card
          key={assignment.id}
          className={`grid grid-cols-[1fr_auto_auto] items-center p-2 w-full shadow-sm border border-border rounded-md ${getStatusBgColor(assignment.status)}`}
        >
          <CardHeader className="p-0">
            <CardTitle className="text-sm font-medium truncate">
              {assignment.title}
            </CardTitle>
            <p className="text-xs">
              Atama Tarihi: {formatDate(assignment.assignedDate)}
            </p>
          </CardHeader>

          <Select
            value={assignment.status.toString()}
            onValueChange={(value) =>
              handleStatusChange(assignment.id, Number(value))
            }
          >
            <SelectTrigger className="w-[130px] h-8 border border-gray-800/30">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {Object.entries(statusLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Açıklamayı göster"
                className="p-0"
              >
                <InfoIcon className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
              <DialogHeader>
                <DialogTitle>{assignment.title} - Açıklama</DialogTitle>
                <DialogClose className="absolute right-4 top-4" />
              </DialogHeader>
              <DialogDescription className="whitespace-pre-wrap">
                {assignment.description}
              </DialogDescription>
            </DialogContent>
          </Dialog>
        </Card>
      ))}

      {totalPages > 1 && (
        <nav className="flex justify-center items-center space-x-4 mt-4 select-none">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
          >
            <ChevronLeft className="mr-1 h-4 w-4" /> Geri
          </Button>

          <span>
            Sayfa {page} / {totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          >
            İleri <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </nav>
      )}
    </main>
    </>
  );
}