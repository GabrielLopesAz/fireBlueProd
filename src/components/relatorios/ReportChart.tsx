import { useMemo, useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { fichasService } from "@/services/fichasService";


interface ReportChartProps {
  type: "pecas-cortadas" | "pecas-perdidas" | "pecas-recebidas";
  dateRange?: DateRange;
}

export function ReportChart({ type, dateRange }: ReportChartProps) {
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Formatar as datas para a API no formato MySQL (YYYY-MM-DD) - mesmo padrão do Fechamento Semanal
        const dataInicio = dateRange?.from ? dateRange.from.toISOString().split('T')[0] : '';
        const dataFim = dateRange?.to ? dateRange.to.toISOString().split('T')[0] : '';
        
        console.log('ReportChart - Buscando dados para período:', dataInicio, 'a', dataFim);
        
        let data;
        
        if (type === "pecas-cortadas") {
          data = await fichasService.buscarCortadasUltimosMeses(dataInicio, dataFim);
          console.log('ReportChart - Dados cortadas recebidos:', data);
          setChartData(data.map(item => ({ 
            name: item.mes, 
            quantidade: Number(item.total_cortada) || 0,
            bancas: item.bancas || 'N/A',
            total_bancas: Number(item.total_bancas) || 0
          })));
        } else if (type === "pecas-recebidas") {
          data = await fichasService.buscarRecebidosUltimosMeses(dataInicio, dataFim);
          console.log('ReportChart - Dados recebidas recebidos:', data);
          setChartData(data.map(item => ({ 
            name: item.mes, 
            quantidade: Number(item.total_recebido) || 0,
            bancas: item.bancas || 'N/A',
            total_bancas: Number(item.total_bancas) || 0
          })));
        } else if (type === "pecas-perdidas") {
          data = await fichasService.buscarPerdidasUltimosMeses(dataInicio, dataFim);
          console.log('ReportChart - Dados perdidas recebidos:', data);
          setChartData(data.map(item => ({ 
            name: item.mes, 
            quantidade: Number(item.total_perdido) || 0,
            bancas: item.bancas || 'N/A',
            total_bancas: Number(item.total_bancas) || 0
          })));
        }
      } catch (e) {
        console.error('ReportChart - Erro ao buscar dados do gráfico:', e);
        setChartData([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [type, dateRange]);

  const getChartData = useMemo(() => {
    if ((type === "pecas-cortadas" || type === "pecas-recebidas" || type === "pecas-perdidas") && chartData.length > 0) {
      return chartData;
    }
    return [];
  }, [type, chartData]);
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const renderChart = () => {
    if (loading && (type === "pecas-cortadas" || type === "pecas-recebidas" || type === "pecas-perdidas")) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Carregando dados do relatório...</p>
          </div>
        </div>
      );
    }

    if (!loading && chartData.length === 0) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Nenhum dado disponível para o período selecionado</p>
            <p className="text-xs text-muted-foreground">Tente selecionar um período diferente</p>
          </div>
        </div>
      );
    }
    
    switch (type) {
      case "pecas-cortadas":
        return (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={getChartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="quantidade" name="Quantidade" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        );
      case "pecas-perdidas":
        return (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={getChartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="quantidade" name="Quantidade" fill="#ff4d4d" />
            </BarChart>
          </ResponsiveContainer>
        );
      case "pecas-recebidas":
        return (
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart
              data={getChartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="quantidade" name="Quantidade" stroke="#8884d8" fill="#8884d8" />
            </AreaChart>
          </ResponsiveContainer>
        );
      default:
        return <p>Selecione um tipo de relatório</p>;
    }
  };

  // Informações adicionais baseadas no tipo de relatório
  const getAdditionalInfo = () => {
    switch (type) {
      case "pecas-cortadas": {
        // Cálculos baseados em chartData
        const totalCortadas = chartData.reduce((acc, item) => acc + (item.quantidade || 0), 0);
        const mediaCortadas = chartData.length > 0 ? Math.round(totalCortadas / chartData.length) : 0;
        const maiorCorte = chartData.reduce((max, item) => item.quantidade > max ? item.quantidade : max, 0);
        
        // Calcular bancas únicas
        const bancasUnicas = new Set();
        chartData.forEach(item => {
          if (item.bancas && item.bancas !== 'N/A') {
            item.bancas.split(', ').forEach(banca => bancasUnicas.add(banca.trim()));
          }
        });
        
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 hover:shadow-sm transition-all dark:bg-blue-950/50 dark:border-blue-800/50 dark:hover:shadow-md dark:hover:shadow-black/10">
              <p className="text-sm text-blue-700 dark:text-blue-300">Total de Peças Cortadas</p>
              <p className="text-xl font-bold text-blue-800 dark:text-blue-200">{totalCortadas} unid.</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200 hover:shadow-sm transition-all dark:bg-green-950/50 dark:border-green-800/50 dark:hover:shadow-md dark:hover:shadow-black/10">
              <p className="text-sm text-green-700 dark:text-green-300">Média Mensal</p>
              <p className="text-xl font-bold text-green-800 dark:text-green-200">{mediaCortadas} unid.</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200 hover:shadow-sm transition-all dark:bg-purple-950/50 dark:border-purple-800/50 dark:hover:shadow-md dark:hover:shadow-black/10">
              <p className="text-sm text-purple-700 dark:text-purple-300">Maior Quantidade</p>
              <p className="text-xl font-bold text-purple-800 dark:text-purple-200">{maiorCorte} unid.</p>
            </div>
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 hover:shadow-sm transition-all dark:bg-amber-950/50 dark:border-amber-800/50 dark:hover:shadow-md dark:hover:shadow-black/10">
              <p className="text-sm text-amber-700 dark:text-amber-300">Bancas Envolvidas</p>
              <p className="text-lg font-bold text-amber-800 dark:text-amber-200">{bancasUnicas.size}</p>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                {Array.from(bancasUnicas).slice(0, 3).join(', ')}
                {bancasUnicas.size > 3 && '...'}
              </p>
            </div>
          </div>
        );
      }
      case "pecas-perdidas": {
        // Cálculos baseados em chartData
        const totalPerdidas = chartData.reduce((acc, item) => acc + (item.quantidade || 0), 0);
        const mediaPerdidas = chartData.length > 0 ? Math.round(totalPerdidas / chartData.length) : 0;
        const maiorPerda = chartData.reduce((max, item) => item.quantidade > max ? item.quantidade : max, 0);
        
        // Calcular bancas únicas
        const bancasUnicas = new Set();
        chartData.forEach(item => {
          if (item.bancas && item.bancas !== 'N/A') {
            item.bancas.split(', ').forEach(banca => bancasUnicas.add(banca.trim()));
          }
        });
        
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <div className="p-4 bg-red-50 rounded-lg border border-red-200 hover:shadow-sm transition-all dark:bg-red-950/50 dark:border-red-800/50 dark:hover:shadow-md dark:hover:shadow-black/10">
              <p className="text-sm text-red-700 dark:text-red-300">Total de Peças Perdidas</p>
              <p className="text-xl font-bold text-red-800 dark:text-red-200">{totalPerdidas} unid.</p>
            </div>
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 hover:shadow-sm transition-all dark:bg-amber-950/50 dark:border-amber-800/50 dark:hover:shadow-md dark:hover:shadow-black/10">
              <p className="text-sm text-amber-700 dark:text-amber-300">Média Mensal</p>
              <p className="text-xl font-bold text-amber-800 dark:text-amber-200">{mediaPerdidas} unid.</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 hover:shadow-sm transition-all dark:bg-blue-950/50 dark:border-blue-800/50 dark:hover:shadow-md dark:hover:shadow-black/10">
              <p className="text-sm text-blue-700 dark:text-blue-300">Maior Perda</p>
              <p className="text-xl font-bold text-blue-800 dark:text-blue-200">{maiorPerda} unid.</p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200 hover:shadow-sm transition-all dark:bg-orange-950/50 dark:border-orange-800/50 dark:hover:shadow-md dark:hover:shadow-black/10">
              <p className="text-sm text-orange-700 dark:text-orange-300">Bancas Envolvidas</p>
              <p className="text-lg font-bold text-orange-800 dark:text-orange-200">{bancasUnicas.size}</p>
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                {Array.from(bancasUnicas).slice(0, 3).join(', ')}
                {bancasUnicas.size > 3 && '...'}
              </p>
            </div>
          </div>
        );
      }
      case "pecas-recebidas": {
        // Cálculos baseados em chartData
        const totalRecebidas = chartData.reduce((acc, item) => acc + (item.quantidade || 0), 0);
        const mediaRecebidas = chartData.length > 0 ? Math.round(totalRecebidas / chartData.length) : 0;
        const maiorRecebimento = chartData.reduce((max, item) => item.quantidade > max ? item.quantidade : max, 0);
        
        // Calcular bancas únicas
        const bancasUnicas = new Set();
        chartData.forEach(item => {
          if (item.bancas && item.bancas !== 'N/A') {
            item.bancas.split(', ').forEach(banca => bancasUnicas.add(banca.trim()));
          }
        });
        
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200 hover:shadow-sm transition-all dark:bg-green-950/50 dark:border-green-800/50 dark:hover:shadow-md dark:hover:shadow-black/10">
              <p className="text-sm text-green-700 dark:text-green-300">Total de Peças Recebidas</p>
              <p className="text-xl font-bold text-green-800 dark:text-green-200">{totalRecebidas} unid.</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 hover:shadow-sm transition-all dark:bg-blue-950/50 dark:border-blue-800/50 dark:hover:shadow-md dark:hover:shadow-black/10">
              <p className="text-sm text-blue-700 dark:text-blue-300">Média Mensal</p>
              <p className="text-xl font-bold text-blue-800 dark:text-blue-200">{mediaRecebidas} unid.</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200 hover:shadow-sm transition-all dark:bg-purple-950/50 dark:border-purple-800/50 dark:hover:shadow-md dark:hover:shadow-black/10">
              <p className="text-sm text-purple-700 dark:text-purple-300">Maior Recebimento</p>
              <p className="text-xl font-bold text-purple-800 dark:text-purple-200">{maiorRecebimento} unid.</p>
            </div>
            <div className="p-4 bg-teal-50 rounded-lg border border-teal-200 hover:shadow-sm transition-all dark:bg-teal-950/50 dark:border-teal-800/50 dark:hover:shadow-md dark:hover:shadow-black/10">
              <p className="text-sm text-teal-700 dark:text-teal-300">Bancas Envolvidas</p>
              <p className="text-lg font-bold text-teal-800 dark:text-teal-200">{bancasUnicas.size}</p>
              <p className="text-xs text-teal-600 dark:text-teal-400 mt-1">
                {Array.from(bancasUnicas).slice(0, 3).join(', ')}
                {bancasUnicas.size > 3 && '...'}
              </p>
            </div>
          </div>
        );
      }
      default:
        return null;
    }
  };

  return (
    <div>
      {renderChart()}
      {getAdditionalInfo()}
    </div>
  );
}
