import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Mail, Instagram, Youtube, CheckCircle } from "lucide-react";

export default function Partners() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    instagramHandle: "",
    youtubeChannel: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const registerMutation = trpc.affiliates.register.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setSubmitted(true);
      setFormData({ name: "", email: "", instagramHandle: "", youtubeChannel: "" });
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao registrar");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Seja um Parceiro Vya Nexus</h1>
          <p className="text-xl text-blue-100">
            Ganhe comissões promovendo a plataforma de infraestrutura digital mais completa
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          {/* Benefícios */}
          <div>
            <h2 className="text-3xl font-bold mb-8">Por que se tornar um parceiro?</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Comissão de 30%</h3>
                  <p className="text-gray-600">
                    Ganhe 30% de comissão em cada cliente que você referencia
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Cupom Exclusivo</h3>
                  <p className="text-gray-600">
                    Seu próprio cupom com 10% de desconto para seus seguidores
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Suporte Dedicado</h3>
                  <p className="text-gray-600">
                    Time dedicado para ajudar você e seus clientes
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Pagamentos Mensais</h3>
                  <p className="text-gray-600">
                    Receba suas comissões todo mês via transferência bancária
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Formulário */}
          <div>
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-6">Cadastre-se Agora</h2>

              {submitted ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Cadastro Recebido!</h3>
                  <p className="text-gray-600 mb-4">
                    Obrigado pelo interesse! Nossa equipe analisará sua candidatura e entrará em contato em breve.
                  </p>
                  <Button
                    onClick={() => setSubmitted(false)}
                    variant="outline"
                  >
                    Fazer Novo Cadastro
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome Completo *
                    </label>
                    <Input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Seu nome"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="seu@email.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center gap-2">
                        <Instagram className="w-4 h-4" />
                        Instagram (sem @)
                      </div>
                    </label>
                    <Input
                      type="text"
                      name="instagramHandle"
                      value={formData.instagramHandle}
                      onChange={handleChange}
                      placeholder="seu_usuario"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center gap-2">
                        <Youtube className="w-4 h-4" />
                        Canal YouTube
                      </div>
                    </label>
                    <Input
                      type="url"
                      name="youtubeChannel"
                      value={formData.youtubeChannel}
                      onChange={handleChange}
                      placeholder="https://youtube.com/c/seu_canal"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? "Enviando..." : "Enviar Candidatura"}
                  </Button>

                  <p className="text-xs text-gray-500 text-center mt-4">
                    Seus dados serão analisados por nossa equipe. Você receberá um email de confirmação.
                  </p>
                </form>
              )}
            </Card>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-lg p-8 border border-gray-200">
          <h2 className="text-2xl font-bold mb-8">Perguntas Frequentes</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold mb-2">Como funciona a comissão?</h3>
              <p className="text-gray-600 text-sm">
                Você recebe 30% do valor da assinatura de cada cliente que se cadastra usando seu cupom exclusivo. As comissões são calculadas mensalmente e pagas via transferência bancária.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Qual é o cupom de desconto?</h3>
              <p className="text-gray-600 text-sm">
                Cada parceiro recebe um cupom único com 10% de desconto. Você pode compartilhar esse cupom com seus seguidores e comunidade.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Como recebo os pagamentos?</h3>
              <p className="text-gray-600 text-sm">
                As comissões são pagas mensalmente via transferência bancária. Você pode acompanhar suas comissões no painel de parceiros.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Há limite de clientes?</h3>
              <p className="text-gray-600 text-sm">
                Não! Quanto mais clientes você referencia, mais você ganha. Não há limite de comissões ou clientes referenciados.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
