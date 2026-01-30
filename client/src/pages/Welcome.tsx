import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mail, HardDrive, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { useLocation } from 'wouter';

export default function Welcome() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedMode, setSelectedMode] = useState<'complete' | 'storage_pro' | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const updateOnboarding = trpc.onboarding.completeWelcome.useMutation({
    onSuccess: () => {
      setIsLoading(false);
      setLocation('/cloud');
    },
    onError: (error: any) => {
      setIsLoading(false);
      console.error('Erro ao completar onboarding:', error);
    },
  });

  const handleContinue = async () => {
    if (!selectedMode) return;
    
    setIsLoading(true);
    updateOnboarding.mutate({ mode: selectedMode });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <p className="text-gray-600">Redirecionando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Bem-vindo ao Vya Nexus, {user.name?.split(' ')[0]}!
          </h1>
          <p className="text-lg text-gray-600">
            Escolha como deseja começar sua jornada na plataforma
          </p>
        </div>

        {/* Mode Selection Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Complete Experience */}
          <Card
            className={`p-8 cursor-pointer transition-all duration-200 ${
              selectedMode === 'complete'
                ? 'ring-2 ring-blue-500 bg-blue-50'
                : 'hover:shadow-lg'
            }`}
            onClick={() => setSelectedMode('complete')}
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Experiência Completa Nexus
                  </h3>
                  <p className="text-sm text-gray-500">Recomendado</p>
                </div>
              </div>
              {selectedMode === 'complete' && (
                <CheckCircle2 className="w-6 h-6 text-blue-600" />
              )}
            </div>

            <p className="text-gray-600 mb-6">
              Ative o e-mail profissional + storage do seu plano. Gerenciamento completo em um único lugar.
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>E-mail profissional @vyaconcept.com.br</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>Storage do seu plano (60GB - 1TB)</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>Suporte prioritário incluído</span>
              </div>
            </div>
          </Card>

          {/* Storage Pro Mode */}
          <Card
            className={`p-8 cursor-pointer transition-all duration-200 ${
              selectedMode === 'storage_pro'
                ? 'ring-2 ring-green-500 bg-green-50'
                : 'hover:shadow-lg'
            }`}
            onClick={() => setSelectedMode('storage_pro')}
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <HardDrive className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Modo Storage Pro
                  </h3>
                  <p className="text-sm text-gray-500">Bônus +50%</p>
                </div>
              </div>
              {selectedMode === 'storage_pro' && (
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              )}
            </div>

            <p className="text-gray-600 mb-6">
              Mantenha seu e-mail atual (Gmail/Outlook) e ganhe 50% de bônus em storage.
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>Mantenha seu e-mail atual</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>Storage +50% de bônus</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>Integração com Gmail/Outlook</span>
              </div>
              <div className="mt-4 p-3 bg-green-100 rounded-lg">
                <p className="text-sm font-semibold text-green-900">
                  Exemplo: 60GB → 90GB de storage
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Continue Button */}
        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={handleContinue}
            disabled={!selectedMode || isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold flex items-center gap-2"
          >
            Continuar
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Info Text */}
        <p className="text-center text-sm text-gray-500 mt-8">
          Você pode alterar essa configuração a qualquer momento no painel de configurações
        </p>
      </div>
    </div>
  );
}
