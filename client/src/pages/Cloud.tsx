import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Download, Trash2, Search, Upload, Folder } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Cloud() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolder, setSelectedFolder] = useState("/");

  const { data: files, isLoading: filesLoading } = trpc.cloud.listFiles.useQuery({ folder: selectedFolder });
  const { data: storageUsage } = trpc.cloud.getStorageUsage.useQuery();
  const deleteFileMutation = trpc.cloud.deleteFile.useMutation();

  const handleDelete = async (fileId: number) => {
    try {
      await deleteFileMutation.mutateAsync({ fileId });
      toast.success("Arquivo deletado com sucesso");
    } catch (error: any) {
      toast.error(error.message || "Erro ao deletar arquivo");
    }
  };

  const handleUpload = () => {
    toast.info("Funcionalidade de upload será implementada em breve");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Vya Cloud</h1>
            <p className="text-gray-600 mt-1">Seu armazenamento em nuvem seguro</p>
          </div>
          <Button onClick={handleUpload}>
            <Upload className="w-4 h-4 mr-2" />
            Fazer Upload
          </Button>
        </div>

        {/* Storage Usage */}
        {storageUsage && (
          <Card>
            <CardHeader>
              <CardTitle>Uso de Armazenamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">{storageUsage.usedGb} GB de {storageUsage.limitGb} GB</span>
                  <span className="text-sm text-gray-600">{storageUsage.percentage}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600" style={{ width: `${storageUsage.percentage}%` }} />
                </div>
              </div>
              {storageUsage.percentage > 80 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    Você está usando mais de 80% do seu armazenamento. Considere fazer upgrade do plano.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Search and Filter */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar arquivos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <button onClick={() => setSelectedFolder("/")} className="text-blue-600 hover:underline">
            Raiz
          </button>
          {selectedFolder !== "/" && (
            <>
              <span>/</span>
              <span className="text-gray-600">{selectedFolder}</span>
            </>
          )}
        </div>

        {/* Files List */}
        <Card>
          <CardHeader>
            <CardTitle>Arquivos</CardTitle>
            <CardDescription>{files?.length || 0} arquivo(s)</CardDescription>
          </CardHeader>
          <CardContent>
            {filesLoading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : files && files.length > 0 ? (
              <div className="space-y-2">
                {files.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3 flex-1">
                      <Folder style={{ width: "20px", height: "20px", color: "#2563eb" }} />
                      <div>
                        <p className="font-medium">{file.filename}</p>
                        <p className="text-xs text-gray-600">
                          {(file.fileSize / 1024 / 1024).toFixed(2)} MB • {new Date(file.createdAt).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Download style={{ width: "16px", height: "16px" }} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(file.id)}
                        disabled={deleteFileMutation.isPending}
                      >
                        <Trash2 style={{ width: "16px", height: "16px", color: "#dc2626" }} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-600">
                <div style={{ opacity: 0.5, marginBottom: "12px" }}>
                  <Folder style={{ width: "48px", height: "48px", margin: "0 auto" }} />
                </div>
                <p>Nenhum arquivo encontrado</p>
                <Button variant="outline" className="mt-4" onClick={handleUpload}>
                  Fazer Upload
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
