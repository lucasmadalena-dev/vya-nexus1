import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Mail, Plus, Trash2, CheckCircle, AlertCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Email() {
  const { user } = useAuth();
  const [showDomainForm, setShowDomainForm] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [domainName, setDomainName] = useState("");
  const [emailLocal, setEmailLocal] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [selectedDomainId, setSelectedDomainId] = useState<number | null>(null);

  const { data: domains, refetch: refetchDomains } = trpc.email.listDomains.useQuery();
  const { data: emailAccounts, refetch: refetchEmails } = trpc.email.listEmailAccounts.useQuery();

  const createDomainMutation = trpc.email.createDomain.useMutation();
  const verifyDomainMutation = trpc.email.verifyDomain.useMutation();
  const createEmailMutation = trpc.email.createEmailAccount.useMutation();
  const deleteEmailMutation = trpc.email.deleteEmailAccount.useMutation();

  const handleCreateDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domainName) {
      toast.error("Digite um domínio válido");
      return;
    }

    try {
      const result = await createDomainMutation.mutateAsync({
        domainName,
        purpose: "both",
      });

      toast.success("Domínio criado! Configure os registros DNS:");
      console.log("DNS Records:", result.dnsRecords);

      setDomainName("");
      setShowDomainForm(false);
      refetchDomains();
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar domínio");
    }
  };

  const handleVerifyDomain = async (domainId: number) => {
    try {
      await verifyDomainMutation.mutateAsync({ domainId });
      toast.success("Domínio verificado com sucesso!");
      refetchDomains();
    } catch (error: any) {
      toast.error(error.message || "Erro ao verificar domínio");
    }
  };

  const handleCreateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDomainId || !emailLocal || !emailPassword) {
      toast.error("Preencha todos os campos");
      return;
    }

    try {
      const result = await createEmailMutation.mutateAsync({
        domainId: selectedDomainId,
        localPart: emailLocal,
        password: emailPassword,
      });

      toast.success(`Conta ${result.emailAddress} criada com sucesso!`);
      setEmailLocal("");
      setEmailPassword("");
      setShowEmailForm(false);
      refetchEmails();
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar conta de email");
    }
  };

  const handleDeleteEmail = async (accountId: number) => {
    try {
      await deleteEmailMutation.mutateAsync({ accountId });
      toast.success("Conta de email deletada");
      refetchEmails();
    } catch (error: any) {
      toast.error(error.message || "Erro ao deletar conta");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Vya Email</h1>
            <p className="text-gray-600 mt-1">Gerenciar domínios e contas de email profissionais</p>
          </div>
          <Button onClick={() => setShowDomainForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Domínio
          </Button>
        </div>

        {/* Domains Section */}
        <Card>
          <CardHeader>
            <CardTitle>Meus Domínios</CardTitle>
            <CardDescription>Domínios cadastrados para email profissional</CardDescription>
          </CardHeader>
          <CardContent>
            {domains && domains.length > 0 ? (
              <div className="space-y-3">
                {domains.map((domain) => (
                  <div key={domain.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {domain.verified ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-yellow-600" />
                      )}
                      <div>
                        <p className="font-medium">{domain.domainName}</p>
                        <p className="text-xs text-gray-600">{domain.verified ? "Verificado" : "Pendente verificação"}</p>
                      </div>
                    </div>
                    {!domain.verified && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleVerifyDomain(domain.id)}
                        disabled={verifyDomainMutation.isPending}
                      >
                        Verificar
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-4">Nenhum domínio cadastrado</p>
            )}
          </CardContent>
        </Card>

        {/* Email Accounts Section */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Contas de Email</CardTitle>
                <CardDescription>Contas de email profissionais criadas</CardDescription>
              </div>
              <Button
                size="sm"
                onClick={() => setShowEmailForm(true)}
                disabled={!domains || domains.length === 0 || !domains.some((d) => d.verified)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Conta
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {emailAccounts && emailAccounts.length > 0 ? (
              <div className="space-y-3">
                {emailAccounts.map((account) => (
                  <div key={account.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium">{account.emailAddress}</p>
                        <p className="text-xs text-gray-600">{account.isExternal ? "Conta externa" : "Conta profissional"}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteEmail(account.id)}
                      disabled={deleteEmailMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-4">Nenhuma conta de email criada</p>
            )}
          </CardContent>
        </Card>

        {/* Create Domain Form */}
        {showDomainForm && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle>Novo Domínio</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateDomain} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nome do Domínio</label>
                  <Input
                    type="text"
                    placeholder="exemplo.com.br"
                    value={domainName}
                    onChange={(e) => setDomainName(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={createDomainMutation.isPending}>
                    Criar Domínio
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowDomainForm(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Create Email Form */}
        {showEmailForm && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle>Nova Conta de Email</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateEmail} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Domínio</label>
                  <select
                    value={selectedDomainId || ""}
                    onChange={(e) => setSelectedDomainId(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">Selecione um domínio</option>
                    {domains
                      ?.filter((d) => d.verified)
                      .map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.domainName}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Parte Local (antes do @)</label>
                  <Input
                    type="text"
                    placeholder="contato"
                    value={emailLocal}
                    onChange={(e) => setEmailLocal(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Senha</label>
                  <Input
                    type="password"
                    placeholder="Mínimo 8 caracteres"
                    value={emailPassword}
                    onChange={(e) => setEmailPassword(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={createEmailMutation.isPending}>
                    Criar Conta
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowEmailForm(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
