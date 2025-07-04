import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "@/components/ui/sonner";

export interface Terceiro {
  idTerceiro?: string;
  id?: string;
  nome: string;
  cnpj?: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  tipo: 'fornecedor' | 'banca';
  observacoes?: string;
  numero?: string;
  complemento?: string;
  chave_pix?: string;
}

const api = 'http://192.168.100.134:8687';

export function useTerceiros() {
  const [terceiros, setTerceiros] = useState<Terceiro[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTerceiros = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${api}/api/terceiros`);
      const data = Array.isArray(response.data) ? response.data : (response.data.items || []);
      setTerceiros(data);
    } catch (err) {
      setError("Erro ao buscar terceiros");
      toast.error("Erro ao buscar terceiros");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTerceirosByTipo = async (tipo: 'fornecedor' | 'banca') => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${api}/api/terceiros/tipo/${tipo}`);
      const data = Array.isArray(response.data) ? response.data : (response.data.items || []);
      setTerceiros(data);
    } catch (err) {
      setError(`Erro ao buscar terceiros do tipo ${tipo}`);
      toast.error(`Erro ao buscar terceiros do tipo ${tipo}`);
    } finally {
      setIsLoading(false);
    }
  };

  const addTerceiro = async (terceiro: Terceiro) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${api}/api/terceiros`, terceiro);
      const saved = response.data;
      setTerceiros(prev => [...prev, { ...terceiro, idTerceiro: saved.idTerceiro || Math.random().toString() }]);
      toast.success("Terceiro inserido com sucesso!");
      return true;
    } catch (err) {
      setError("Erro ao inserir terceiro");
      toast.error("Erro ao inserir terceiro");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateTerceiro = async (terceiro: Terceiro) => {
    setIsLoading(true);
    setError(null);
    try {
      const id = terceiro.idTerceiro || terceiro.id;
      if (!id) {
        throw new Error("ID do terceiro não encontrado");
      }

      // Remove os campos id e idTerceiro do objeto antes de enviar
      const { idTerceiro, id: _, ...dadosParaAtualizar } = terceiro;

      console.log('Atualizando terceiro:', { id, dadosParaAtualizar });

      const response = await axios.put(`${api}/api/terceiros/${id}`, dadosParaAtualizar, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (response.data && response.data.data) {
        setTerceiros(prev => prev.map(item => 
          (item.idTerceiro || item.id) === id ? { ...response.data.data, idTerceiro: id } : item
        ));
        toast.success(response.data.message || "Terceiro atualizado com sucesso!");
        return true;
      } else {
        throw new Error("Resposta inválida do servidor");
      }
    } catch (err) {
      console.error("Erro ao atualizar terceiro:", err);
      const mensagem = err.response?.data?.error || err.message || "Erro ao atualizar terceiro";
      setError(mensagem);
      toast.error(mensagem);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTerceiro = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await axios.delete(`${api}/api/terceiros/${id}`);
      setTerceiros(prev => prev.filter(item => (item.idTerceiro || item.id) !== id));
      toast.success("Terceiro removido com sucesso");
      return true;
    } catch (err) {
      setError("Erro ao remover terceiro");
      toast.error("Erro ao remover terceiro");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTerceiros();
  }, []);

  return {
    terceiros,
    isLoading,
    error,
    fetchTerceiros,
    fetchTerceirosByTipo,
    addTerceiro,
    updateTerceiro,
    deleteTerceiro
  };
} 