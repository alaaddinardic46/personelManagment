"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search, User, Building, Briefcase } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Title } from "@radix-ui/react-dialog";
import axios from 'axios';
import { format } from 'date-fns';
import { api } from '../api';
import { useRouter } from 'next/navigation'
import Header from "@/components/ui/Header";

type Gender = "Male" | "Female";
type Department = "Software" | "Accounting" | "HumanResources" | "Marketing" | "Sales" | "TechnicalSupport";
type Title = "Intern" | "Specialist" | "SeniorSpecialist" | "TeamLeader" | "Manager" | "Director";
type AssignmentStatus = "Pending" | "InProgress" | "Completed" | "Cancelled";

type Person = {
  id: number;
  name: string;
  surname: string;
  email: string;
  password: string;
  gender: Gender;
  birthday: string;
  startingWork: string;
  leavingWork?: string;
  department: Department;
  title: Title;
};

type Assignment = {
  id: number;
  title: string;
  description: string;
  personelId: number;
  assignedDate: string;
  dueDate?: string;
  status: AssignmentStatus;
  personName?: string;
};

const genderOptions: Gender[] = ["Male", "Female"];
const departmentOptions: Department[] = [
  "Software", "Accounting", "HumanResources", "Marketing", "Sales", "TechnicalSupport"
];
const titleOptions: Title[] = [
  "Intern", "Specialist", "SeniorSpecialist", "TeamLeader", "Manager", "Director"
];
const statusOptions: AssignmentStatus[] = ["Pending", "InProgress", "Completed", "Cancelled"];

const statusLabels = {
  Pending: "Bekliyor",
  InProgress: "Devam Ediyor",
  Completed: "Tamamlandı",
  Cancelled: "İptal Edildi"
};

const genderLabels: Record<Gender, string> = {
  Male: "Erkek",
  Female: "Kadın",
};

const departmentLabels: Record<Department, string> = {
  Software: "Yazılım",
  Accounting: "Muhasebe",
  HumanResources: "İnsan Kaynakları",
  Marketing: "Pazarlama",
  Sales: "Satış",
  TechnicalSupport: "Teknik Destek",
};

const titleLabels: Record<Title, string> = {
  Intern: "Stajyer",
  Specialist: "Uzman",
  SeniorSpecialist: "Kıdemli Uzman",
  TeamLeader: "Takım Lideri",
  Manager: "Yönetici",
  Director: "Direktör",
};

const statusColors = {
  Pending: "bg-yellow-100 text-yellow-800",
  InProgress: "bg-blue-100 text-blue-800",
  Completed: "bg-green-100 text-green-800",
  Cancelled: "bg-red-100 text-red-800"
};

export default function Page() {
  const [activeTab, setActiveTab] = useState("personnel");

  // Personnel states
  const [personnel, setPersonnel] = useState<Person[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10); // sabit 10 gösterim
  const [totalPages, setTotalPages] = useState(1);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newPerson, setNewPerson] = useState<Omit<Person, "id" | "startingWork">>({
    name: "",
    surname: "",
    email: "",
    password: "",
    gender: "Male",
    birthday: "",
    department: "Software",
    title: "Intern",
  });
  const [isPersonnelDialogOpen, setIsPersonnelDialogOpen] = useState(false);

  // Assignment states
  const [assignmentSearch, setAssignmentSearch] = useState("");
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [editingAssignmentId, setEditingAssignmentId] = useState<number | null>(null);
  const [newAssignment, setNewAssignment] = useState<Omit<Assignment, "id" | "assignedDate">>({
    title: "",
    description: "",
    personelId: 0,
    dueDate: "",
    status: "Pending",
  });
  const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false);
  const isFirstRender = useRef(true);
  const router = useRouter()

  useEffect(() => {
      const id = sessionStorage.getItem('id');
      const statu = sessionStorage.getItem('status');
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
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return; // İlk renderda hiçbir şey yapma
    }

    // Sadece activeTab değiştiğinde (ilk render HARİÇ) çalışır
    setPage(1);
    setTotalPages(1);
  }, [activeTab]);

  useEffect(() => {
    async function fetchPersonnel() {
      const res = await axios.get(api + "personel", {
        params: { page, pageSize, search }
      });
      const data = res.data;

      const mapped = data.items.map((p: any) => ({
        ...p,
        gender: genderOptions[p.gender] ?? genderOptions[0],
        department: departmentOptions[p.department] ?? departmentOptions[0],
        title: titleOptions[p.title] ?? titleOptions[0],
      }));

      setPersonnel(mapped);
      setTotalPages(data.totalCount);
    }

    async function fetchAssignment() {
      const res = await axios.get(api + "assignment", {
        params: { page, search: assignmentSearch }
      });
      const data = res.data;

      const transformed = data.items.map(transformAssignment);
      setAssignments(transformed);
      setTotalPages(data.totalCount);
    }

    // Sadece aktif sekmeye göre fetch çağır
    if (activeTab === 'personnel') {
      fetchPersonnel();
    } else if (activeTab === 'assignments') {
      fetchAssignment();
    }
  }, [page, pageSize, search, assignmentSearch, activeTab]);

  // Personnel functions
  const resetPersonnelForm = () => {
    setNewPerson({
      name: "",
      surname: "",
      email: "",
      password: "",
      gender: "Male",
      birthday: "",
      department: "Software",
      title: "Intern",
    });
    setEditingId(null);
    setIsPersonnelDialogOpen(false);
  };

  const handleAddOrUpdatePersonnel = async () => {
    // Temel validation kontrolü
    const { name, surname, email, password, birthday, gender, department, title } = newPerson;

    if (!name || !surname || !email || !password || !birthday || !gender || !department || !title) {
      alert("Lütfen tüm alanları doldurun.");
      return;
    }

    // Email formatı kontrolü (opsiyonel ama önerilir)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Geçerli bir email adresi giriniz.");
      return;
    }

    if (editingId === null) {
      const res = await axios.post(api + "personel", transformData(newPerson));
      const data = res.data;
      console.log(data);
      const now = new Date(data.startingWork).toISOString();
      const id = data.id;
      setPersonnel((prev) => [...prev, { id, ...newPerson, startingWork: now }]);
    } else {
      const update = await updatePersonel(editingId, newPerson);
      if (update) {
        setPersonnel((prev) =>
          prev.map((p) =>
            p.id === editingId ? { ...p, ...newPerson } : p
          )
        );
      } else {
        alert("Güncelleme işleminde hata");
      }
    }
    resetPersonnelForm();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bu personeli silmek istediğinize emin misiniz?")) return;

    try {
      await axios.delete(`${api}personel/${id}`);
      return true;
    } catch (error) {
      console.error("Silme işlemi başarısız:", error);
      return false;
    }
  };

  const updatePersonel = async (id: number, newPerson: any) => {
    // Backend formatına çevir
    const backendData = transformData(newPerson);
    backendData.Id = id;  // Id'yi de eklemeyi unutma

    try {
      await axios.put(api + "personel", backendData);
      return true;
    } catch (error) {
      console.error("Güncelleme hatası:", error);
      return false;
    }
  };

  const transformData = (data: any) => {
    return {
      "Id": data.id,
      "Name": data.name,
      "Surname": data.surname,
      "Email": data.email,
      "Password": data.password,
      "Gender": genderOptions.indexOf(data.gender),  // gender'ın index'ini alıyoruz
      "Birthday": data.birthday,
      "Department": departmentOptions.indexOf(data.department),  // department'ın index'ini alıyoruz
      "Title": titleOptions.indexOf(data.title)  // title'ın index'ini alıyoruz
    };
  };

  function transformAssignment(raw: any) {
    return {
      id: raw.id,
      title: raw.title,
      description: raw.description,
      personelId: raw.personelId,
      assignedDate: raw.assignedDate,
      dueDate: raw.dueDate,
      status: statusOptions[raw.status] ?? "Pending",
      personName: raw.assignedPersonel
        ? `${raw.assignedPersonel.name} ${raw.assignedPersonel.surname}`
        : "Bilinmeyen"
    };
  }

  const handleEditPersonnel = (person: Person) => {
    setEditingId(person.id);
    setNewPerson({
      name: person.name,
      surname: person.surname,
      email: person.email,
      password: person.password,
      gender: person.gender,
      birthday: person.birthday,
      department: person.department,
      title: person.title,
    });
    setIsPersonnelDialogOpen(true);
  };

  const handleDeletePersonnel = async (id: number) => {
    const delPerson = await handleDelete(id);
    if (delPerson) {
      setPersonnel((prev) => prev.filter((p) => p.id !== id));
      resetPersonnelForm();
    } else {
      alert("Silme işleminde bir hata oluştu");
    }
  };

  // Assignment functions
  const resetAssignmentForm = () => {
    setNewAssignment({
      title: "",
      description: "",
      personelId: 0,
      dueDate: "",
      status: "Pending",
    });
    setEditingAssignmentId(null);
    setIsAssignmentDialogOpen(false);
  };

  const handleAddOrUpdateAssignment = async () => {
    if (editingAssignmentId === null) {
      // YENİ GÖREV EKLEME
      const res = await axios.post(api + "assignment", {
        title: newAssignment.title,
        description: newAssignment.description,
        personelId: newAssignment.personelId,
        dueDate: newAssignment.dueDate,
        Status: statusOptions.indexOf(newAssignment.status)
      });

      const data = res.data;
      const fixedDateStr = data.assignedDate.replace(" ", "T");
      const now = new Date(fixedDateStr).toISOString();
      const id = data.id;

      const resPerson = await axios.get(`${api}personel/${newAssignment.personelId}`);
      const selectedPerson = resPerson.data;
      const personName = `${selectedPerson.name} ${selectedPerson.surname}`;

      setAssignments((prev) => [
        ...prev,
        {
          id,
          ...newAssignment,
          assignedDate: now,
          personName
        }
      ]);
    } else {
      // GÜNCELLEME YAPILIYOR
      const updatedAssignment = {
        id: editingAssignmentId,
        title: newAssignment.title,
        description: newAssignment.description,
        personelId: newAssignment.personelId,
        dueDate: newAssignment.dueDate,
        status: statusOptions.indexOf(newAssignment.status)
      };

      const res = await axios.put(api + "assignment", updatedAssignment);

      const resPerson = await axios.get(`${api}personel/${newAssignment.personelId}`);
      const selectedPerson = resPerson.data;
      const personName = `${selectedPerson.name} ${selectedPerson.surname}`;

      setAssignments((prev) =>
        prev.map((a) =>
          a.id === editingAssignmentId
            ? {
              ...a,
              ...newAssignment,
              personName,
              status: newAssignment.status
            }
            : a
        )
      );
    }

    resetAssignmentForm();
  };

  const handleEditAssignment = (assignment: Assignment) => {
    setEditingAssignmentId(assignment.id);
    setNewAssignment({
      title: assignment.title,
      description: assignment.description,
      personelId: assignment.personelId,
      dueDate: assignment.dueDate ? format(new Date(assignment.dueDate), 'yyyy-MM-dd') : undefined,
      status: assignment.status
    });
    setIsAssignmentDialogOpen(true);
  };

  const handleDeleteAssignment = async (id: number) => {
    const confirmDelete = window.confirm('Bu görevi silmek istediğinize emin misiniz?');
    if (!confirmDelete) return;

    try {
      await axios.delete(api + `assignment/${id}`);
      setAssignments((prev) => prev.filter((a) => a.id !== id));
      resetAssignmentForm();
    } catch (error) {
      console.error('Silme işlemi sırasında hata oluştu:', error);
      alert('Görev silinemedi. Lütfen tekrar deneyin.');
    }
  };

  const filteredPersonnel = personnel;

  const filteredAssignments = assignments;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const PersonnelSelector = ({
    selectedPersonelId,
    onPersonelSelect
  }: {
    selectedPersonelId: number;
    onPersonelSelect: (personelId: number) => void;
    personnel: Person[];
  }) => {
    const [isPersonnelSelectorOpen, setIsPersonnelSelectorOpen] = useState(false);
    const [localSearchTerm, setLocalSearchTerm] = useState("");
    const [personnelList, setPersonnelList] = useState<Person[]>([]);

    const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

    useEffect(() => {
      if (selectedPersonelId != null && selectedPersonelId != 0) {
        axios
          .get(api + `personel/${selectedPersonelId}`)
          .then((res) => setSelectedPerson(res.data))
          .catch(() => setSelectedPerson(null));
      }
    }, [selectedPersonelId]);

    const filteredPersonnel = personnelList;

    useEffect(() => {
      const fetchPersonnel = async () => {
        try {
          const res = await axios.get(api + "personel", {
            params: {
              search: localSearchTerm.trim() || undefined, // boşsa göndermiyoruz
            },
          });
          setPersonnelList(res.data.items); // Eğer API'den PagedResult dönüyorsa `.items` kullanılır
        } catch (error) {
          console.error("Personel verisi alınamadı", error);
          setPersonnelList([]);
        }
      };

      fetchPersonnel();
    }, [localSearchTerm]);


    const getDepartmentDisplayName = (dept: Department) => {
      const deptNames = {
        Software: "Yazılım",
        Accounting: "Muhasebe",
        HumanResources: "İK",
        Marketing: "Pazarlama",
        Sales: "Satış",
        TechnicalSupport: "Teknik Destek"
      };
      return deptNames[dept] || dept;
    };

    const getTitleDisplayName = (title: Title) => {
      const titleNames = {
        Intern: "Stajyer",
        Specialist: "Uzman",
        SeniorSpecialist: "Kıdemli Uzman",
        TeamLeader: "Takım Lideri",
        Manager: "Müdür",
        Director: "Direktör"
      };
      return titleNames[title] || title;
    };

    const handlePersonelSelect = (personId: number) => {
      onPersonelSelect(personId);
      setIsPersonnelSelectorOpen(false);
      setLocalSearchTerm("");
    };

    return (
      <div className="grid gap-2">
        <Label>Atanacak Personel</Label>
        <Popover open={isPersonnelSelectorOpen} onOpenChange={setIsPersonnelSelectorOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={isPersonnelSelectorOpen}
              className="w-full justify-between h-auto p-3"
            >
              {selectedPerson ? (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">{selectedPerson.name} {selectedPerson.surname}</div>
                    <div className="text-sm text-muted-foreground">
                      {getDepartmentDisplayName(selectedPerson.department)} • {getTitleDisplayName(selectedPerson.title)}
                    </div>
                  </div>
                </div>
              ) : (
                <span className="text-muted-foreground">Personel seçin...</span>
              )}
              <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="start">
            <Command shouldFilter={false}>
              <CommandInput
                placeholder="Personel ara..."
                value={localSearchTerm}
                onValueChange={setLocalSearchTerm}
                autoFocus
              />
              <CommandList>
                <CommandEmpty>Personel bulunamadı.</CommandEmpty>
                <CommandGroup>
                  {filteredPersonnel.map((person) => (
                    <CommandItem
                      key={person.id}
                      value={person.id.toString()}
                      onSelect={() => handlePersonelSelect(person.id)}
                      className="p-3"
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">
                              {person.name} {person.surname}
                            </span>
                            {person.gender === "Female" && (
                              <span className="w-2 h-2 bg-pink-400 rounded-full"></span>
                            )}
                            {person.gender === "Male" && (
                              <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {person.email}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-1">
                              <Building className="w-3 h-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {getDepartmentDisplayName(person.department)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Briefcase className="w-3 h-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {getTitleDisplayName(person.title)}
                              </span>
                            </div>
                          </div>
                        </div>
                        {selectedPersonelId === person.id && (
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    );
  };

  return (
    <>
    <Header />
    <div className="p-6 max-w-7xl mx-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="personnel">Personel Yönetimi</TabsTrigger>
          <TabsTrigger value="assignments">Görev Yönetimi</TabsTrigger>
        </TabsList>

        <TabsContent value="personnel">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle>Personel Yönetimi</CardTitle>
              <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                <Input
                  placeholder="İsim ara..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full sm:w-64"
                />
                <Button onClick={() => {
                  resetPersonnelForm();
                  setIsPersonnelDialogOpen(true);
                }}>
                  Yeni Personel
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>İsim</TableHead>
                    <TableHead>Soyisim</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Cinsiyet</TableHead>
                    <TableHead>Departman</TableHead>
                    <TableHead>Ünvan</TableHead>
                    <TableHead>İşlem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPersonnel.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>{p.name}</TableCell>
                      <TableCell>{p.surname}</TableCell>
                      <TableCell>{p.email}</TableCell>
                      <TableCell>{genderLabels[p.gender]}</TableCell>
                      <TableCell>{departmentLabels[p.department]}</TableCell>
                      <TableCell>{titleLabels[p.title]}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditPersonnel(p)}
                        >
                          Düzenle
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredPersonnel.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        Kayıt bulunamadı.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <div className="flex justify-end items-center gap-2 mt-4">
                <Button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  variant="outline"
                  size="sm"
                >
                  Önceki
                </Button>
                <span>{page} / {totalPages}</span>
                <Button
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                  variant="outline"
                  size="sm"
                >
                  Sonraki
                </Button>
              </div>

            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle>Görev Yönetimi</CardTitle>
              <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                <Input
                  placeholder="Görev veya personel ara..."
                  value={assignmentSearch}
                  onChange={(e) => setAssignmentSearch(e.target.value)}
                  className="w-full sm:w-64"
                />
                <Button onClick={() => {
                  resetAssignmentForm();
                  setIsAssignmentDialogOpen(true);
                }}>
                  Yeni Görev
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {filteredAssignments.map((assignment) => (
                  <div key={assignment.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{assignment.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{assignment.description}</p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditAssignment(assignment)}
                        >
                          Düzenle
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Atanan:</span>
                        <p>{assignment.personName}</p>
                      </div>
                      <div>
                        <span className="font-medium">Atanma Tarihi:</span>
                        <p>{formatDate(assignment.assignedDate)}</p>
                      </div>
                      <div>
                        <span className="font-medium">Teslim Tarihi:</span>
                        <p>{assignment.dueDate ? formatDate(assignment.dueDate) : "Belirtilmemiş"}</p>
                      </div>
                      <div>
                        <span className="font-medium mr-1">Durum:</span>
                        <Badge className={`mt-1 ${statusColors[assignment.status]}`}>
                          {statusLabels[assignment.status]}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredAssignments.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    Görev bulunamadı.
                  </div>
                )}
              </div>
              <div className="flex justify-end items-center gap-2 mt-4">
                <Button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  variant="outline"
                  size="sm"
                >
                  Önceki
                </Button>
                <span>{page} / {totalPages}</span>
                <Button
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                  variant="outline"
                  size="sm"
                >
                  Sonraki
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Personnel Dialog */}
      <Dialog open={isPersonnelDialogOpen} onOpenChange={setIsPersonnelDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId === null ? "Yeni Personel Ekle" : "Personel Düzenle"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>İsim</Label>
              <Input
                value={newPerson.name}
                onChange={(e) => setNewPerson({ ...newPerson, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Soyisim</Label>
              <Input
                value={newPerson.surname}
                onChange={(e) => setNewPerson({ ...newPerson, surname: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input
                value={newPerson.email}
                onChange={(e) => setNewPerson({ ...newPerson, email: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Password</Label>
              <Input
                value={newPerson.password}
                onChange={(e) => setNewPerson({ ...newPerson, password: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Doğum Tarihi</Label>
              <Input
                type="date"
                value={newPerson.birthday}
                onChange={(e) => setNewPerson({ ...newPerson, birthday: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="grid gap-2">
                <Label>Cinsiyet</Label>
                <Select
                  value={newPerson.gender}
                  onValueChange={(value: Gender) => setNewPerson({ ...newPerson, gender: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {genderOptions.map((g) => (
                      <SelectItem key={g} value={g}>
                        {genderLabels[g]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Departman</Label>
                <Select
                  value={newPerson.department}
                  onValueChange={(value: Department) =>
                    setNewPerson({ ...newPerson, department: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {departmentOptions.map((d) => (
                      <SelectItem key={d} value={d}>
                        {departmentLabels[d]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Ünvan</Label>
                <Select
                  value={newPerson.title}
                  onValueChange={(value: Title) =>
                    setNewPerson({ ...newPerson, title: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {titleOptions.map((t) => (
                      <SelectItem key={t} value={t}>
                        {titleLabels[t]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={handleAddOrUpdatePersonnel} className="flex-1">
                {editingId === null ? "Kaydet" : "Güncelle"}
              </Button>
              {editingId !== null && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-full"
                  onClick={() => handleDeletePersonnel(editingId)}
                >
                  Sil
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assignment Dialog */}
      <Dialog open={isAssignmentDialogOpen} onOpenChange={setIsAssignmentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingAssignmentId === null ? "Yeni Görev Ekle" : "Görev Düzenle"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>Görev Başlığı</Label>
              <Input
                value={newAssignment.title}
                onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                placeholder="Görev başlığını girin"
              />
            </div>
            <div className="grid gap-2">
              <Label>Açıklama</Label>
              <Textarea
                value={newAssignment.description}
                onChange={(e: { target: { value: any; }; }) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                placeholder="Görev açıklamasını girin"
                rows={3}
              />
            </div>
            <PersonnelSelector
              selectedPersonelId={newAssignment.personelId}
              onPersonelSelect={(personelId) => setNewAssignment({ ...newAssignment, personelId })}
              personnel={personnel}
            />
            <div className="grid gap-2">
              <Label>Teslim Tarihi</Label>
              <Input
                type="date"
                value={newAssignment.dueDate}
                onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Durum</Label>
              <Select
                value={newAssignment.status}
                onValueChange={(value: AssignmentStatus) => setNewAssignment({ ...newAssignment, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {statusLabels[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={handleAddOrUpdateAssignment} className="flex-1">
                {editingAssignmentId === null ? "Kaydet" : "Güncelle"}
              </Button>
              {editingAssignmentId !== null && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-full"
                  onClick={() => handleDeleteAssignment(editingAssignmentId)}
                >
                  Sil
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div></>
  );
}