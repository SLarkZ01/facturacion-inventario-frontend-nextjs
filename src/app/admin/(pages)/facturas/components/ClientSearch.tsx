"use client";

import { useState, useEffect, useRef } from "react";
import { Search, User, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export type ClientSearchResult = {
  id: string;
  username: string;
  email: string;
  nombreCompleto: string;
};

type ClientSearchProps = {
  onClientSelect: (client: ClientSearchResult | null) => void;
  selectedClient: ClientSearchResult | null;
};

export function ClientSearch({ onClientSelect, selectedClient }: ClientSearchProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [clients, setClients] = useState<ClientSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Búsqueda con debounce
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (searchTerm.length < 2) {
      setClients([]);
      return;
    }

    timeoutRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/auth/search-clients?q=${encodeURIComponent(searchTerm)}`
        );

        if (response.ok) {
          const data = await response.json();
          setClients(data.clients || []);
        } else {
          console.error("Error buscando clientes:", await response.text());
          setClients([]);
        }
      } catch (error) {
        console.error("Error en búsqueda de clientes:", error);
        setClients([]);
      } finally {
        setLoading(false);
      }
    }, 300); // Debounce de 300ms

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [searchTerm]);

  const handleSelectClient = (client: ClientSearchResult) => {
    onClientSelect(client);
    setOpen(false);
    setSearchTerm("");
  };

  const handleClearClient = () => {
    onClientSelect(null);
    setSearchTerm("");
  };

  return (
    <div className="space-y-2">
      <Label>Buscar Cliente</Label>
      
      {selectedClient ? (
        <div className="flex items-center gap-2 p-3 border rounded-lg bg-muted/50">
          <User className="w-4 h-4 text-muted-foreground" />
          <div className="flex-1">
            <p className="font-medium">{selectedClient.nombreCompleto}</p>
            <p className="text-xs text-muted-foreground">
              {selectedClient.email} • @{selectedClient.username}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearClient}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
            >
              <span className="text-muted-foreground">
                Buscar por nombre, email o usuario...
              </span>
              <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command shouldFilter={false}>
              <CommandInput
                placeholder="Escribe al menos 2 caracteres..."
                value={searchTerm}
                onValueChange={setSearchTerm}
              />
              <CommandList>
                {loading ? (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    Buscando...
                  </div>
                ) : searchTerm.length < 2 ? (
                  <CommandEmpty>
                    Escribe al menos 2 caracteres para buscar
                  </CommandEmpty>
                ) : clients.length === 0 ? (
                  <CommandEmpty>
                    No se encontraron clientes
                  </CommandEmpty>
                ) : (
                  <CommandGroup>
                    {clients.map((client) => (
                      <CommandItem
                        key={client.id}
                        value={client.id}
                        onSelect={() => handleSelectClient(client)}
                        className="cursor-pointer"
                      >
                        <User className="mr-2 h-4 w-4" />
                        <div className="flex-1">
                          <p className="font-medium">{client.nombreCompleto}</p>
                          <p className="text-xs text-muted-foreground">
                            {client.email} • @{client.username}
                          </p>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
