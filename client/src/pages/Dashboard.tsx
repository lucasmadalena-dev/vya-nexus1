import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Cloud, Mail, Globe, Settings, LogOut } from "lucide-react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const { data: tenant } = trpc.auth.getTenant.useQuery();
  const { data: subscription } = trpc.payments.getSubscription.useQuery();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const modules = [
    {
      icon: Cloud,
      title: "Vya Cloud",
      description: "Armazenamento em nuvem seguro",
      href: "/cloud",
      color: "bg-blue-100 text-blue-600",
    },
    {
      icon: Mail,
      title: "Vya Email",
      description: "Email profissional com domínio próprio",
      href: "/email",
      color: "bg-green-100 text-green-600",
    },
    {
      icon: Globe,
      title: "Vya Hosting",
      description: "Hospedagem de sites estáticos",
      href: "/hosting",
      color: "bg-purple-100 text-purple-600",
    },
    {
      icon: Settings,
      title: "Configurações",
      description: "Gerenciar conta e assinatura",
      href: "/settings",
      color: "bg-gray-100 text-gray-600",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-8">
          <h1 className="text-3xl font-bold mb-2">Bem-vindo, {user.name || user.email}!</h1>
          <p className="text-blue-100">
            {tenant ? `Organização: ${tenant.name}` : "Configure sua organização para começar"}
          </p>
        </div>

        {/* Subscription Status */}
        {subscription && (
          <Card>
            <CardHeader>
              <CardTitle>Status da Assinatura</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Plano</p>
                  <p className="font-semibold capitalize">{subscription.plan}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="font-semibold">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      subscription.status === "active" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {subscription.status === "active" ? "Ativo" : "Pendente"}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Contas de Email</p>
                  <p className="font-semibold">{subscription.emailSeats}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Armazenamento</p>
                  <p className="font-semibold">{subscription.storageLimitGb} GB</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Modules Grid */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Meus Serviços</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {modules.map((module) => {
              const Icon = module.icon;
              return (
                <Card key={module.href} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(module.href)}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <div className={`p-2 rounded ${module.color}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          {module.title}
                        </CardTitle>
                        <CardDescription>{module.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full">
                      Acessar
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start">
              📧 Adicionar Conta de Email
            </Button>
            <Button variant="outline" className="w-full justify-start">
              📁 Fazer Upload de Arquivo
            </Button>
            <Button variant="outline" className="w-full justify-start">
              🌐 Criar Novo Site
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
