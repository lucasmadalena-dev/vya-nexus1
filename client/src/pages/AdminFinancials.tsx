import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { DollarSign, TrendingUp, AlertCircle, Download } from "lucide-react";

// Dados simulados para gráficos
const revenueData = [
  { month: "Jan", bruto: 15000, imposto: 2250, lucro: 12750 },
  { month: "Fev", bruto: 18000, imposto: 2700, lucro: 15300 },
  { month: "Mar", bruto: 22000, imposto: 3300, lucro: 18700 },
  { month: "Abr", bruto: 25000, imposto: 3750, lucro: 21250 },
  { month: "Mai", bruto: 28000, imposto: 4200, lucro: 23800 },
  { month: "Jun", bruto: 32000, imposto: 4800, lucro: 27200 },
];

const costBreakdown = [
  { name: "Stripe (2.9%)", value: 928, color: "#3b82f6" },
  { name: "Impostos (15%)", value: 4800, color: "#f97316" },
  { name: "Comissões Afiliados (30%)", value: 9600, color: "#06b6d4" },
  { name: "S3 Storage", value: 1200, color: "#8b5cf6" },
  { name: "Servidor", value: 2000, color: "#ec4899" },
];

const profitMargin = [
  { name: "Lucro Líquido", value: 27200, fill: "#10b981" },
  { name: "Custos", value: 8928, fill: "#ef4444" },
];

export default function AdminFinancials() {
  const { user } = useAuth();

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-900">Acesso Negado</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-800">
                Você não tem permissão para acessar o dashboard financeiro.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Dashboard Financeiro
          </h1>
          <p className="text-slate-600">
            Análise completa de receitas, custos e lucro
          </p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">
                Receita Bruta (Jun)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">
                R$ 32.000
              </div>
              <p className="text-xs text-green-600 mt-2">+14% vs mês anterior</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">
                Impostos (15%)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">
                R$ 4.800
              </div>
              <p className="text-xs text-slate-600 mt-2">Provisão automática</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">
                Custos Operacionais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">R$ 8.928</div>
              <p className="text-xs text-slate-600 mt-2">
                Stripe + S3 + Servidor
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">
                Lucro Líquido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                R$ 27.200
              </div>
              <p className="text-xs text-slate-600 mt-2">85% de margem</p>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Evolução de Receita */}
          <Card>
            <CardHeader>
              <CardTitle>Evolução de Receita (6 meses)</CardTitle>
              <CardDescription>
                Receita bruta, impostos e lucro líquido
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `R$ ${value}`} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="bruto"
                    stroke="#3b82f6"
                    name="Receita Bruta"
                  />
                  <Line
                    type="monotone"
                    dataKey="imposto"
                    stroke="#f97316"
                    name="Impostos (15%)"
                  />
                  <Line
                    type="monotone"
                    dataKey="lucro"
                    stroke="#10b981"
                    name="Lucro Líquido"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Distribuição de Custos */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuição de Custos (Jun)</CardTitle>
              <CardDescription>
                Breakdown de todos os custos operacionais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={costBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) =>
                      `${name}: R$ ${value.toLocaleString()}`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {costBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `R$ ${value}`} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Detalhamento de Custos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Custos Detalhados */}
          <Card>
            <CardHeader>
              <CardTitle>Custos Detalhados (Junho)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                  <span className="text-sm font-medium">Taxa Stripe (2.9%)</span>
                  <span className="font-semibold">R$ 928</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-orange-50 rounded">
                  <span className="text-sm font-medium">Provisão Impostos (15%)</span>
                  <span className="font-semibold">R$ 4.800</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
                  <span className="text-sm font-medium">S3 Storage ($0,023/GB)</span>
                  <span className="font-semibold">R$ 1.200</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-pink-50 rounded">
                  <span className="text-sm font-medium">Servidor (VPS)</span>
                  <span className="font-semibold">R$ 2.000</span>
                </div>
              </div>
              <div className="border-t pt-3 flex justify-between font-bold">
                <span>Total de Custos:</span>
                <span className="text-red-600">R$ 8.928</span>
              </div>
            </CardContent>
          </Card>

          {/* Margem de Lucro */}
          <Card>
            <CardHeader>
              <CardTitle>Margem de Lucro (Junho)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={profitMargin}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `R$ ${value}`} />
                  <Bar dataKey="value" fill="#8884d8">
                    {profitMargin.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 p-3 bg-green-50 rounded border border-green-200">
                <p className="text-sm font-medium text-green-900">
                  Margem de Lucro: 85%
                </p>
                <p className="text-xs text-green-800 mt-1">
                  Lucro Líquido / Receita Bruta
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Relatório de Faturamento */}
        <Card>
          <CardHeader>
            <CardTitle>Relatório de Faturamento</CardTitle>
            <CardDescription>
              Histórico de faturas e transações
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-2 px-4">Período</th>
                    <th className="text-right py-2 px-4">Receita Bruta</th>
                    <th className="text-right py-2 px-4">Impostos</th>
                    <th className="text-right py-2 px-4">Custos</th>
                    <th className="text-right py-2 px-4">Lucro Líquido</th>
                    <th className="text-center py-2 px-4">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {revenueData.map((row, idx) => (
                    <tr key={idx} className="border-b hover:bg-slate-50">
                      <td className="py-3 px-4">{row.month}/2026</td>
                      <td className="text-right py-3 px-4 font-medium">
                        R$ {row.bruto.toLocaleString()}
                      </td>
                      <td className="text-right py-3 px-4 text-orange-600">
                        R$ {row.imposto.toLocaleString()}
                      </td>
                      <td className="text-right py-3 px-4 text-red-600">
                        R$ {(row.bruto * 0.029 + 1200 + 2000).toLocaleString()}
                      </td>
                      <td className="text-right py-3 px-4 font-semibold text-green-600">
                        R$ {row.lucro.toLocaleString()}
                      </td>
                      <td className="text-center py-3 px-4">
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Alertas */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <CardTitle className="text-yellow-900">Atenção</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-yellow-800">
                Custo de S3 aumentou 15% este mês. Considere otimizar política
                de retenção de arquivos.
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <CardTitle className="text-green-900">Crescimento</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-green-800">
                Receita cresceu 14% em relação ao mês anterior. Tendência
                positiva mantida.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
