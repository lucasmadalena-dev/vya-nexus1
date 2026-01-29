import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { Cloud, Mail, Globe, Shield, Zap, Users } from "lucide-react";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">V</div>
              <span className="font-bold text-xl">Vya Nexus</span>
            </div>
            <Button onClick={() => navigate("/dashboard")}>Ir para Dashboard</Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Bem-vindo de volta!</h1>
            <p className="text-xl text-gray-600">Sua plataforma integrada de serviços em nuvem</p>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card>
              <CardHeader>
                <Cloud className="w-8 h-8 text-blue-600 mb-2" />
                <CardTitle>Vya Cloud</CardTitle>
                <CardDescription>Armazenamento seguro em nuvem</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Armazene, organize e compartilhe seus arquivos com segurança de nível empresarial.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Mail className="w-8 h-8 text-green-600 mb-2" />
                <CardTitle>Vya Email</CardTitle>
                <CardDescription>Email profissional com domínio próprio</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Crie contas de email profissionais com seu domínio customizado.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Globe className="w-8 h-8 text-purple-600 mb-2" />
                <CardTitle>Vya Hosting</CardTitle>
                <CardDescription>Hospedagem de sites com SSL automático</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Hospede seus sites estáticos com certificados SSL automáticos.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Features */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-12">
            <h2 className="text-2xl font-bold mb-8 text-center">Por que escolher Vya Nexus?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex gap-4">
                <Shield className="w-6 h-6 text-blue-600 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-2">Segurança de Nível Empresarial</h3>
                  <p className="text-gray-600 text-sm">Seus dados são protegidos com criptografia de ponta a ponta.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <Zap className="w-6 h-6 text-blue-600 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-2">Fácil de Usar</h3>
                  <p className="text-gray-600 text-sm">Interface intuitiva que qualquer pessoa pode usar.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <Users className="w-6 h-6 text-blue-600 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-2">Suporte 24/7</h3>
                  <p className="text-gray-600 text-sm">Nossa equipe está sempre pronta para ajudar.</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Button size="lg" onClick={() => navigate("/dashboard")}>
              Acessar Dashboard
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600">
      {/* Navigation */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-blue-600 font-bold">V</div>
            <span className="font-bold text-xl text-white">Vya Nexus</span>
          </div>
          <Button variant="outline" className="bg-white/20 text-white border-white/30 hover:bg-white/30">
            Documentação
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Sua Infraestrutura Digital Completa
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-8">
            Cloud Storage, Email Profissional e Hospedagem de Sites em uma única plataforma
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => window.location.href = getLoginUrl()}>
              Começar Agora
            </Button>
            <Button size="lg" variant="outline" className="bg-white/20 text-white border-white hover:bg-white/30">
              Saiba Mais
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20">
          <Card className="bg-white/10 border-white/20 text-white">
            <CardHeader>
              <Cloud className="w-8 h-8 mb-2" />
              <CardTitle>Vya Cloud</CardTitle>
              <CardDescription className="text-blue-100">Armazenamento em nuvem</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2 text-blue-50">
                <li>✓ Até 1000 GB de espaço</li>
                <li>✓ Sincronização automática</li>
                <li>✓ Compartilhamento seguro</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 text-white">
            <CardHeader>
              <Mail className="w-8 h-8 mb-2" />
              <CardTitle>Vya Email</CardTitle>
              <CardDescription className="text-blue-100">Email profissional</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2 text-blue-50">
                <li>✓ Até 50 contas de email</li>
                <li>✓ Domínio customizado</li>
                <li>✓ SMTP/IMAP integrado</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 text-white">
            <CardHeader>
              <Globe className="w-8 h-8 mb-2" />
              <CardTitle>Vya Hosting</CardTitle>
              <CardDescription className="text-blue-100">Hospedagem de sites</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2 text-blue-50">
                <li>✓ Até 20 sites hospedados</li>
                <li>✓ SSL automático</li>
                <li>✓ Deploy instantâneo</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Pricing Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Planos Simples e Transparentes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Iniciante", price: "R$ 29,99", features: ["1 email", "10 GB", "1 site"] },
              { name: "Profissional", price: "R$ 99,99", features: ["10 emails", "100 GB", "5 sites"], highlighted: true },
              { name: "Empresarial", price: "R$ 299,99", features: ["50 emails", "500 GB", "20 sites"] },
            ].map((plan) => (
              <Card key={plan.name} className={`${plan.highlighted ? "ring-2 ring-white" : ""} bg-white/10 border-white/20 text-white`}>
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <div className="text-3xl font-bold mt-2">{plan.price}</div>
                  <p className="text-blue-100 text-sm">/mês</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="text-sm text-blue-50">✓ {feature}</li>
                    ))}
                  </ul>
                  <Button className="w-full" variant={plan.highlighted ? "default" : "outline"}>
                    Escolher Plano
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center mt-20">
          <Button size="lg" onClick={() => window.location.href = getLoginUrl()} className="bg-white text-blue-600 hover:bg-blue-50">
            Comece Sua Avaliação Gratuita
          </Button>
          <p className="text-blue-100 mt-4">Sem cartão de crédito necessário</p>
        </div>
      </main>
    </div>
  );
}
