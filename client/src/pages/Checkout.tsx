import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Check } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";

export default function Checkout() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [hasUpgrade, setHasUpgrade] = useState(false);

  const { data: priceCalculation } = trpc.plans.calculateTotalPrice.useQuery(
    {
      planId: selectedPlan || "vya-solo",
      hasStandard1TbUpgrade: hasUpgrade,
    },
    { enabled: !!selectedPlan }
  );

  const createCheckoutMutation = trpc.checkout.createCheckoutSession.useMutation({
    onSuccess: (data) => {
      toast.success("Redirecionando para pagamento...");
      // Em produção, redirecionar para URL do Stripe
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleCheckout = () => {
    if (!selectedPlan) {
      toast.error("Selecione um plano");
      return;
    }

    createCheckoutMutation.mutate({
      planId: selectedPlan,
      hasStandard1TbUpgrade: hasUpgrade,
      successUrl: window.location.origin + "/dashboard",
      cancelUrl: window.location.origin + "/plans",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/plans")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar aos Planos
          </Button>
          <h1 className="text-3xl font-bold text-slate-900">Finalizar Compra</h1>
          <p className="text-slate-600 mt-2">
            Revise seus dados antes de confirmar o pagamento
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Resumo do Pedido */}
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Plano Selecionado</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedPlan ? (
                  <>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h3 className="font-semibold text-slate-900 capitalize mb-2">
                        {selectedPlan.replace("-", " ")}
                      </h3>
                      <p className="text-sm text-slate-600">
                        {selectedPlan === "vya-solo" &&
                          "1 conta de email com 60GB"}
                        {selectedPlan === "starter-5" &&
                          "5 contas de email com 60GB cada"}
                        {selectedPlan === "starter-10" &&
                          "10 contas de email com 60GB cada + Suporte Humano"}
                        {selectedPlan === "vya-pro" &&
                          "10 contas de email com 100GB cada + Suporte Prioritário"}
                      </p>
                    </div>

                    {/* Upgrade */}
                    <div className="border-t pt-4">
                      <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                        <input
                          type="checkbox"
                          checked={hasUpgrade}
                          onChange={(e) => setHasUpgrade(e.target.checked)}
                          className="w-4 h-4 rounded"
                        />
                        <div>
                          <p className="font-medium text-slate-900">
                            Upgrade Standard 1TB
                          </p>
                          <p className="text-sm text-slate-600">
                            +R$ 149,90/mês - 1024GB de armazenamento
                          </p>
                        </div>
                      </label>
                    </div>
                  </>
                ) : (
                  <p className="text-slate-600">
                    Selecione um plano para continuar
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Informações de Faturamento */}
            <Card>
              <CardHeader>
                <CardTitle>Informações de Faturamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-2">
                    Titular do Cartão
                  </label>
                  <input
                    type="text"
                    placeholder="Nome completo"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-2">
                      Número do Cartão
                    </label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-2">
                      CVV
                    </label>
                    <input
                      type="text"
                      placeholder="123"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resumo de Preços */}
          {selectedPlan && priceCalculation && (
            <div>
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="text-lg">Resumo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Detalhes */}
                  <div className="space-y-3 pb-4 border-b">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Plano Base:</span>
                      <span className="font-medium">
                        R$ {(priceCalculation.basePriceCents / 100).toFixed(2)}
                      </span>
                    </div>

                    {hasUpgrade && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Upgrade 1TB:</span>
                        <span className="font-medium">
                          R$ {(priceCalculation.upgradePriceCents / 100).toFixed(2)}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Subtotal:</span>
                      <span className="font-medium">
                        R$ {(priceCalculation.grossPriceCents / 100).toFixed(2)}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Imposto (15%):</span>
                      <span className="font-medium text-orange-600">
                        R$ {(priceCalculation.taxProvisionCents / 100).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-900">Total:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      R$ {(priceCalculation.netPriceCents / 100).toFixed(2)}
                    </span>
                  </div>

                  {/* Botão */}
                  <Button
                    className="w-full mt-6"
                    onClick={handleCheckout}
                    disabled={createCheckoutMutation.isPending}
                  >
                    {createCheckoutMutation.isPending
                      ? "Processando..."
                      : "Confirmar Pagamento"}
                  </Button>

                  {/* Aviso */}
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-xs text-slate-600">
                    <p className="font-medium mb-1">Modo Teste</p>
                    <p>
                      Este é um ambiente de teste. Nenhum pagamento real será
                      processado.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Seletor de Plano */}
        {!selectedPlan && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Selecione um Plano</CardTitle>
              <CardDescription>
                Escolha o plano que melhor se adequa às suas necessidades
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {["vya-solo", "starter-5", "starter-10", "vya-pro"].map(
                  (plan) => (
                    <button
                      key={plan}
                      onClick={() => setSelectedPlan(plan)}
                      className="p-4 border border-slate-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-left"
                    >
                      <h3 className="font-semibold text-slate-900 capitalize mb-2">
                        {plan.replace("-", " ")}
                      </h3>
                      <p className="text-sm text-slate-600">
                        {plan === "vya-solo" && "R$ 29,90/mês"}
                        {plan === "starter-5" && "R$ 99,90/mês"}
                        {plan === "starter-10" && "R$ 189,90/mês"}
                        {plan === "vya-pro" && "R$ 199,90/mês"}
                      </p>
                    </button>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
