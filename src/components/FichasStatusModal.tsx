import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Clock, CircleDot, Truck, Package } from "lucide-react";

// Definir tipos para as fichas
export interface Ficha {
  id: string;
  codigo: string;
  banca: string;
  dataEntrada: string;
  dataPrevisao: string;
  status: "aguardando_retirada" | "em_producao" | "concluido" | "recebido_parcialmente";
  quantidade: number;
  produto: string;
  descricao: string;
}

interface FichasStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: "aguardando_retirada" | "em_producao" | "concluido" | "recebido_parcialmente";
  fichas: Ficha[];
}

const statusConfig = {
  "aguardando_retirada": {
    title: "Fichas Aguardando Retirada",
    description: "Lista de todas as fichas que aguardam retirada pelas bancas",
    icon: <Clock className="h-5 w-5 text-amber-500" />,
    badgeColor: "bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900 dark:text-amber-200 dark:hover:bg-amber-800",
    label: "Aguardando Retirada"
  },
  "em_producao": {
    title: "Fichas em Produção",
    description: "Lista de todas as fichas que estão em produção nas bancas",
    icon: <CircleDot className="h-5 w-5 text-blue-500" />,
    badgeColor: "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800",
    label: "Em Produção"
  },
  "recebido_parcialmente": {
    title: "Fichas Recebidas Parcialmente",
    description: "Lista de todas as fichas que foram recebidas parcialmente",
    icon: <Package className="h-5 w-5 text-yellow-500" />,
    badgeColor: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200 dark:hover:bg-yellow-800",
    label: "Recebido Parcialmente"
  },
  "concluido": {
    title: "Fichas Concluídas",
    description: "Lista de todas as fichas que foram concluídas",
    icon: <Truck className="h-5 w-5 text-green-500" />,
    badgeColor: "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800",
    label: "Concluído"
  }
};

export const FichasStatusModal: React.FC<FichasStatusModalProps> = ({
  isOpen,
  onClose,
  status,
  fichas
}) => {
  const config = statusConfig[status];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {config.icon}
            {config.title}
          </DialogTitle>
          <DialogDescription>
            {config.description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="max-h-[60vh] overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Banca</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fichas.length > 0 ? (
                fichas.map((ficha) => (
                  <TableRow key={ficha.id}>
                    <TableCell className="font-medium">{ficha.codigo}</TableCell>
                    <TableCell>{ficha.banca}</TableCell>
                    <TableCell>{ficha.quantidade} unid.</TableCell>
                    <TableCell>{ficha.produto}</TableCell>
                    <TableCell>
                      <Badge className={config.badgeColor}>{config.label}</Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    Nenhuma ficha encontrada com este status.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 