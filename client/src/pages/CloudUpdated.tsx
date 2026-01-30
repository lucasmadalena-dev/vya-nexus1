import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Upload, Download, Trash2, Search, AlertTriangle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { StorageLimitModal } from "@/components/StorageLimitModal";

export default function Cloud() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [currentUsageGb, setCurrentUsageGb] = useState(58); // Simulado: 58GB de 60GB
  const [storageLimit, setStorageLimit] = useState(60); // Padrão: 60GB

  // Simular verificação de limite
  useEffect(() => {
    // Se uso >= 95% do limite, mostrar modal
    if (currentUsageGb >= storageLimit * 0.95) {
      setShowLimitModal(true);
    }
  }, [currentUsageGb, storageLimit]);

  // Dados simulados de arquivos
  const files = [
    {
      id: 1,
      name: "Documento_Importante.pdf",
      size: "2.5 MB",
      sizeGb: 0.0025,
      type: "PDF",
      uploadedAt: "2026-01-30",
    },
    {
      id: 2,
      name: "Apresentacao_Q1.pptx",
      size: "8.3 MB",
      sizeGb: 0.0083,
      type: "PowerPoint",
      uploadedAt: "2026-01-29",
    },
    {
      id: 3,
      name: "Planilha_Vendas.xlsx",
      size: "1.2 MB",
      sizeGb: 0.0012,
      type: "Excel",
      uploadedAt: "2026-01-28",
    },
    {
      id: 4,
      name: "Imagem_Campanha.jpg",
      size: "4.7 MB",
      sizeGb: 0.0047,
      type: "Imagem",
      uploadedAt: "2026-01-27",
    },
  ];

  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const usagePercentage = (currentUsageGb / storageLimit) * 100;
  const isNearLimit = usagePercentage >= 90;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Vya Cloud</h1>
          <p className="text-slate-600">
            Armazene, organize e compartilhe seus arquivos com segurança
          </p>
        </div>

        {/* Alerta de Limite */}
        {isNearLimit && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-600 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-orange-900 mb-1">
                    Limite de Armazenamento Próximo
                  </h3>
                  <p className="text-sm text-orange-800 mb-3">
                    Você está usando {currentUsageGb}GB de {storageLimit}GB
                    ({usagePercentage.toFixed(0)}%). Considere fazer upgrade
                    para Standard 1TB.
                  </p>
                  <Button
                    size="sm"
                    onClick={() => setShowLimitModal(true)}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    Fazer Upgrade Agora
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Estatísticas */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">
                Espaço Usado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">
                {currentUsageGb}GB
              </div>
              <p className="text-xs text-slate-600 mt-1">
                de {storageLimit}GB disponíveis
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">
                Arquivos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">
                {files.length}
              </div>
              <p className="text-xs text-slate-600 mt-1">
                {filteredFiles.length} correspondendo à busca
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">
                Espaço Livre
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {(storageLimit - currentUsageGb).toFixed(1)}GB
              </div>
              <p className="text-xs text-slate-600 mt-1">
                {((1 - usagePercentage / 100) * 100).toFixed(0)}% disponível
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">
                Plano Atual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className="bg-blue-100 text-blue-800 mb-2">
                {storageLimit === 60 ? "Padrão (60GB)" : "Standard 1TB"}
              </Badge>
              <p className="text-xs text-slate-600">
                {storageLimit === 60
                  ? "Upgrade para 1TB disponível"
                  : "Máximo de armazenamento"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Barra de Progresso */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-sm">Uso de Armazenamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${
                    isNearLimit ? "bg-orange-500" : "bg-blue-500"
                  }`}
                  style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-slate-600">
                <span>{usagePercentage.toFixed(0)}% utilizado</span>
                <span>{(storageLimit - currentUsageGb).toFixed(1)}GB livre</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upload e Ações */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Gerenciar Arquivos</CardTitle>
            <CardDescription>
              Upload, download e organize seus arquivos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Botões de Ação */}
            <div className="flex gap-3">
              <Button
                disabled={isNearLimit}
                className="flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Upload de Arquivo
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Criar Pasta
              </Button>
            </div>

            {/* Barra de Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Buscar arquivos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Lista de Arquivos */}
        <Card>
          <CardHeader>
            <CardTitle>Meus Arquivos</CardTitle>
            <CardDescription>
              {filteredFiles.length} arquivo(s) encontrado(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-3 px-4">Nome</th>
                    <th className="text-left py-3 px-4">Tipo</th>
                    <th className="text-right py-3 px-4">Tamanho</th>
                    <th className="text-left py-3 px-4">Data de Upload</th>
                    <th className="text-center py-3 px-4">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFiles.map((file) => (
                    <tr key={file.id} className="border-b hover:bg-slate-50">
                      <td className="py-3 px-4 font-medium">{file.name}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">{file.type}</Badge>
                      </td>
                      <td className="text-right py-3 px-4">{file.size}</td>
                      <td className="py-3 px-4 text-slate-600">
                        {file.uploadedAt}
                      </td>
                      <td className="text-center py-3 px-4">
                        <div className="flex gap-2 justify-center">
                          <Button
                            size="sm"
                            variant="ghost"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            title="Deletar"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Limite */}
      <StorageLimitModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        currentUsageGb={currentUsageGb}
        limitGb={storageLimit}
        tenantId={user?.tenantId || 0}
      />
    </div>
  );
}
