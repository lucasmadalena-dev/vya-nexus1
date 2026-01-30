import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Globe, Plus, Trash2, Lock, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Hosting() {
  const { user } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [siteName, setSiteName] = useState("");

  const { data: sites, refetch: refetchSites } = trpc.hosting.listSites.useQuery();
  const createSiteMutation = trpc.hosting.createSite.useMutation();
  const enableSSLMutation = trpc.hosting.enableSSL.useMutation();
  const deleteSiteMutation = trpc.hosting.deleteSite.useMutation();

  const handleCreateSite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteName) {
      toast.error("Digite um nome para o site");
      return;
    }

    try {
      const result = await createSiteMutation.mutateAsync({
        siteName,
      });

      toast.success(`Site ${result.subdomain} criado com sucesso!`);
      setSiteName("");
      setShowCreateForm(false);
      refetchSites();
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar site");
    }
  };

  const handleEnableSSL = async (siteId: number) => {
    try {
      await enableSSLMutation.mutateAsync({ siteId });
      toast.success("Certificado SSL ativado com sucesso!");
      refetchSites();
    } catch (error: any) {
      toast.error(error.message || "Erro ao ativar SSL");
    }
  };

  const handleDeleteSite = async (siteId: number) => {
    try {
      await deleteSiteMutation.mutateAsync({ siteId });
      toast.success("Site deletado com sucesso");
      refetchSites();
    } catch (error: any) {
      toast.error(error.message || "Erro ao deletar site");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado para a área de transferência!");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Vya Hosting</h1>
            <p className="text-gray-600 mt-1">Hospede seus sites com SSL automático</p>
          </div>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Site
          </Button>
        </div>

        {/* Sites List */}
        <Card>
          <CardHeader>
            <CardTitle>Meus Sites</CardTitle>
            <CardDescription>Sites hospedados na plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            {sites && sites.length > 0 ? (
              <div className="space-y-4">
                {sites.map((site) => (
                  <div key={site.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Globe className="w-5 h-5 text-blue-600" />
                          <h3 className="font-semibold">{site.siteName}</h3>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600">URL:</span>
                            <code className="bg-gray-100 px-2 py-1 rounded text-xs">{site.siteUrl}</code>
                            <button
                              onClick={() => copyToClipboard(site.siteUrl)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600">Subdomínio:</span>
                            <code className="bg-gray-100 px-2 py-1 rounded text-xs">{site.subdomain}</code>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600">SSL:</span>
                            {site.sslEnabled ? (
                              <span className="flex items-center gap-1 text-green-600">
                                <Lock className="w-4 h-4" />
                                Ativado
                              </span>
                            ) : (
                              <span className="text-yellow-600">Desativado</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        {!site.sslEnabled && (
                          <Button
                            size="sm"
                            onClick={() => handleEnableSSL(site.id)}
                            disabled={enableSSLMutation.isPending}
                          >
                            Ativar SSL
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(site.siteUrl, "_blank")}
                        >
                          Visitar
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteSite(site.id)}
                          disabled={deleteSiteMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-600">
                <Globe className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum site hospedado</p>
                <Button variant="outline" className="mt-4" onClick={() => setShowCreateForm(true)}>
                  Criar Primeiro Site
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Site Form */}
        {showCreateForm && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle>Novo Site</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateSite} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nome do Site</label>
                  <Input
                    type="text"
                    placeholder="Meu Projeto"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    Será criado um subdomínio: nome-do-site-xxxxx.vya-nexus.com
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={createSiteMutation.isPending}>
                    Criar Site
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Upload Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Como fazer upload de arquivos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>
              1. Crie um novo site usando o botão "Novo Site" acima
            </p>
            <p>
              2. Você receberá um subdomínio único para seu site
            </p>
            <p>
              3. Faça upload dos arquivos HTML, CSS e JavaScript
            </p>
            <p>
              4. Ative o certificado SSL para segurança HTTPS
            </p>
            <p>
              5. Seu site estará disponível em poucos minutos
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
