import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const PLAN_DETAILS = {
  starter: {
    name: "Iniciante",
    price: "R$ 29,99",
    description: "Perfeito para começar",
    features: ["1 conta de email", "10 GB de storage", "1 site hospedado"],
  },
  professional: {
    name: "Profissional",
    price: "R$ 99,99",
    description: "Para pequenos negócios",
    features: ["10 contas de email", "100 GB de storage", "5 sites hospedados"],
  },
  enterprise: {
    name: "Empresarial",
    price: "R$ 299,99",
    description: "Para grandes organizações",
    features: ["50 contas de email", "500 GB de storage", "20 sites hospedados"],
  },
};

export default function Onboarding() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState<"info" | "plan" | "review">("info");
  const [tenantName, setTenantName] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<"starter" | "professional" | "enterprise">("starter");
  const [emailSeats, setEmailSeats] = useState(1);
  const [storageGb, setStorageGb] = useState(10);

  const completeOnboarding = trpc.auth.completeOnboarding.useMutation();
  const createCheckout = trpc.payments.createCheckoutSession.useMutation();

  const handleContinue = async () => {
    if (step === "info") {
      if (!tenantName.trim()) {
        toast.error("Por favor, insira o nome da organização");
        return;
      }
      setStep("plan");
    } else if (step === "plan") {
      setStep("review");
    } else if (step === "review") {
      try {
        // Completar onboarding
        const result = await completeOnboarding.mutateAsync({
          tenantName,
          plan: selectedPlan,
          emailSeats,
          storageLimitGb: storageGb,
        });

        if (result.success) {
          toast.success("Onboarding concluído! Redirecionando para pagamento...");

          // Criar sessão de checkout
          const checkout = await createCheckout.mutateAsync({
            plan: selectedPlan,
            emailSeats,
            storageLimitGb: storageGb,
          });

          if (checkout.url) {
            window.location.href = checkout.url;
          }
        }
      } catch (error: any) {
        toast.error(error.message || "Erro ao completar onboarding");
      }
    }
  };

  const handleBack = () => {
    if (step === "plan") setStep("info");
    else if (step === "review") setStep("plan");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex justify-between mb-4">
            <div className={`flex-1 h-1 mx-1 rounded ${step === "info" || step === "plan" || step === "review" ? "bg-blue-600" : "bg-gray-200"}`} />
            <div className={`flex-1 h-1 mx-1 rounded ${step === "plan" || step === "review" ? "bg-blue-600" : "bg-gray-200"}`} />
            <div className={`flex-1 h-1 mx-1 rounded ${step === "review" ? "bg-blue-600" : "bg-gray-200"}`} />
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Informações</span>
            <span>Plano</span>
            <span>Revisão</span>
          </div>
        </div>

        {/* Step 1: Organization Info */}
        {step === "info" && (
          <Card>
            <CardHeader>
              <CardTitle>Bem-vindo ao Vya Nexus</CardTitle>
              <CardDescription>Crie sua organização para começar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="tenant-name">Nome da Organização</Label>
                <Input
                  id="tenant-name"
                  placeholder="Ex: Minha Empresa LTDA"
                  value={tenantName}
                  onChange={(e) => setTenantName(e.target.value)}
                  className="mt-2"
                />
              </div>
              <p className="text-sm text-gray-600">
                Este será o nome da sua organização no Vya Nexus. Você poderá alterá-lo depois.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Plan Selection */}
        {step === "plan" && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Escolha seu Plano</CardTitle>
                <CardDescription>Selecione o plano que melhor se adequa às suas necessidades</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={selectedPlan} onValueChange={(value: any) => setSelectedPlan(value)}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(Object.entries(PLAN_DETAILS) as Array<[keyof typeof PLAN_DETAILS, typeof PLAN_DETAILS.starter]>).map(([planKey, plan]) => (
                      <div key={planKey} className="relative">
                        <label className="flex flex-col p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-400 transition-colors" htmlFor={planKey}>
                          <div className="flex items-center mb-3">
                            <RadioGroupItem value={planKey} id={planKey} className="mr-3" />
                            <div>
                              <div className="font-semibold">{plan.name}</div>
                              <div className="text-sm text-gray-600">{plan.price}/mês</div>
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 mb-3">{plan.description}</p>
                          <ul className="text-xs space-y-1">
                            {plan.features.map((feature) => (
                              <li key={feature} className="text-gray-700">✓ {feature}</li>
                            ))}
                          </ul>
                        </label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Customization */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Personalizar Plano</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="mb-3 block">Contas de Email: {emailSeats}</Label>
                  <Slider
                    value={[emailSeats]}
                    onValueChange={(value) => setEmailSeats(value[0])}
                    min={1}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-600 mt-2">Máximo 100 contas</p>
                </div>

                <div>
                  <Label className="mb-3 block">Armazenamento: {storageGb} GB</Label>
                  <Slider
                    value={[storageGb]}
                    onValueChange={(value) => setStorageGb(value[0])}
                    min={10}
                    max={1000}
                    step={10}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-600 mt-2">Máximo 1000 GB</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Review */}
        {step === "review" && (
          <Card>
            <CardHeader>
              <CardTitle>Revise suas Informações</CardTitle>
              <CardDescription>Confirme os detalhes antes de prosseguir para o pagamento</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Organização</p>
                  <p className="font-semibold">{tenantName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Plano Selecionado</p>
                  <p className="font-semibold">{PLAN_DETAILS[selectedPlan].name} - {PLAN_DETAILS[selectedPlan].price}/mês</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Contas de Email</p>
                  <p className="font-semibold">{emailSeats} contas</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Armazenamento</p>
                  <p className="font-semibold">{storageGb} GB</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  Você será redirecionado para o Stripe para completar o pagamento. Aceitamos cartões de crédito.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          {step !== "info" && (
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={completeOnboarding.isPending || createCheckout.isPending}
            >
              Voltar
            </Button>
          )}
          <Button
            onClick={handleContinue}
            disabled={completeOnboarding.isPending || createCheckout.isPending}
            className="flex-1"
          >
            {(completeOnboarding.isPending || createCheckout.isPending) && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            {step === "review" ? "Ir para Pagamento" : "Continuar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
