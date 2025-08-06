// PersonnelSelector.tsx - Bu kodu mevcut dosyanıza ekleyin
"use client";

import { Search, User, Building, Briefcase } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState } from "react";

// Mevcut component'inizde bu state'i ekleyin
const [isPersonnelSelectorOpen, setIsPersonnelSelectorOpen] = useState(false);
const [personnelSearchTerm, setPersonnelSearchTerm] = useState("");

// Gelişmiş personel seçici komponenti
const PersonnelSelector = ({ 
  selectedPersonelId, 
  onPersonelSelect, 
  personnel 
}: {
  selectedPersonelId: number;
  onPersonelSelect: (personelId: number) => void;
  personnel: Person[];
}) => {
  const selectedPerson = personnel.find(p => p.id === selectedPersonelId);
  
  const filteredPersonnel = personnel.filter(person => {
    const searchLower = personnelSearchTerm.toLowerCase();
    return (
      person.name.toLowerCase().includes(searchLower) ||
      person.surname.toLowerCase().includes(searchLower) ||
      person.email.toLowerCase().includes(searchLower) ||
      person.department.toLowerCase().includes(searchLower) ||
      person.title.toLowerCase().includes(searchLower)
    );
  });

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
          <Command>
            <CommandInput 
              placeholder="Personel ara..." 
              value={personnelSearchTerm}
              onValueChange={setPersonnelSearchTerm}
            />
            <CommandList>
              <CommandEmpty>Personel bulunamadı.</CommandEmpty>
              <CommandGroup>
                {filteredPersonnel.map((person) => (
                  <CommandItem
                    key={person.id}
                    value={person.id.toString()}
                    onSelect={() => {
                      onPersonelSelect(person.id);
                      setIsPersonnelSelectorOpen(false);
                      setPersonnelSearchTerm("");
                    }}
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

// Assignment Dialog'unda mevcut personel seçim kısmını şununla değiştirin:
<PersonnelSelector
  selectedPersonelId={newAssignment.personelId}
  onPersonelSelect={(personelId) => setNewAssignment({ ...newAssignment, personelId })}
  personnel={personnel}
/>