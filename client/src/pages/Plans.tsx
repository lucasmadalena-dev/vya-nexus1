import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

export default function Plans() {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [hasUpgrade, setHasUpgrade] = useState(false);

  const { data: plans, isLoading } = trpc.plans.listPlans.useQuery();
  const { data: currentPlan } = trpc.plans.getCurrentPlan.useQuery();
  const { data: priceCalculation } = trpc.plans.calculateTotalPrice.useQuery(
    {
      planId: selectedPlan || "vya-solo",
      hasStandard1TbUpgrade: hasUpgrade,
    },
    { enabled: !!selectedPlan }
  );

  if (isLoading) {
    return <div className="text-center py-12">Carregando planos...</div>;
  }

  const plansArray = Array.isArray(plans) ? plans : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Planos e Preços
          </h1>
          <p className="text-xl text-slate-600">
            Escolha o plano perfeito para sua empresa
          </p>
        </div>

        {/* Planos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          {plansArray.map((plan: any) => {
            const isCurrentPlan =
              currentPlan?.plan === plan.name.toLowerCase().replace(/\s+/g, "-");
            const price = (plan.priceMonthCents / 100).toFixed(2);

            return (
              <Card
                key={plan.name}
                className={`relative transition-all ${
                  isCurrentPlan
                    ? "ring-2 ring-blue-500 shadow-lg"
                    : "hover:shadow-lg"
                }`}
              >
                {isCurrentPlan && (
                  <Badge className="absolute top-4 right-4 bg-blue-500">
                    Seu Plano
                  </Badge>
                )}

                <CardHeader>
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {plan.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Preço */}
                  <div className="mb-4">
                    <div className="text-3xl font-bold text-slate-900">
                      R$ {price}
                    </div>
                    <p className="text-sm text-slate-600">/mês</p>
                  </div>

                  {/* Features */}
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>
                        {plan.emailSeats} conta{plan.emailSeats > 1 ? "s" : ""} de
                        email
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>{plan.storagePerAccountGb}GB por conta</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>
                        {plan.humanSupport ? "Suporte Humano" : "Suporte IA"}
                      </span>
                    </li>
                  </ul>

                  {/* Botão */}
                  <Button
                    className="w-full"
                    variant={isCurrentPlan ? "outline" : "default"}
                    disabled={isCurrentPlan}
                    onClick={() => setSelectedPlan(plan.name)}
                  >
                    {isCurrentPlan ? "Plano Atual" : "Selecionar"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Upgrade Standard 1TB */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Upgrade Standard 1TB
              </h2>
              <p className="text-slate-600 mt-2">
                Aumente seu armazenamento para 1TB por apenas R$ 149,90/mês
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-slate-900">
                R$ 149,90
              </div>
              <p className="text-sm text-slate-600">/mês adicional</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <input
              type="checkbox"
              id="upgrade-1tb"
              checked={hasUpgrade}
              onChange={(e) => setHasUpgrade(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300"
            />
            <label htmlFor="upgrade-1tb" className="text-slate-700">
              Adicionar upgrade Standard 1TB ao meu plano
            </label>
          </div>
        </div>

        {/* Cálculo de Preço */}
        {selectedPlan && priceCalculation && (
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle>Resumo de Preços</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Plano Base:</span>
                <span className="font-semibold">
                  R$ {(priceCalculation.basePriceCents / 100).toFixed(2)}
                </span>
              </div>
              {hasUpgrade && (
                <div className="flex justify-between">
                  <span>Upgrade 1TB:</span>
                  <span className="font-semibold">
                    R$ {(priceCalculation.upgradePriceCents / 100).toFixed(2)}
                  </span>
                </div>
              )}
              <div className="border-t border-blue-200 pt-3 flex justify-between">
                <span>Subtotal:</span>
                <span className="font-semibold">
                  R$ {(priceCalculation.grossPriceCents / 100).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>Imposto (15%):</span>
                <span>
                  R$ {(priceCalculation.taxProvisionCents / 100).toFixed(2)}
                </span>
              </div>
              <div className="border-t border-blue-200 pt-3 flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>
                  R$ {(priceCalculation.netPriceCents / 100).toFixed(2)}
                </span>
              </div>

              <Button className="w-full mt-6">
                Prosseguir para Checkout
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Informações Adicionais */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Faturamento Mensal</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Todos os planos são cobrados mensalmente. Você pode cancelar a
                qualquer momento.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Suporte</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Planos Starter 10 e Pro incluem suporte humano em horário
                comercial.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sem Compromisso</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Cancele sua assinatura a qualquer momento. Sem taxas ocultas.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
