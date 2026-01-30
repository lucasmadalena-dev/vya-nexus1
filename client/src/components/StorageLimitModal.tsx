import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface StorageLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUsageGb: number;
  limitGb: number;
  tenantId: number;
}

export function StorageLimitModal({
  isOpen,
  onClose,
  currentUsageGb,
  limitGb,
  tenantId,
}: StorageLimitModalProps) {
  const [, navigate] = useLocation();
  const [isUpgrading, setIsUpgrading] = useState(false);

  const activateUpgradeMutation = trpc.plans.activateUpgrade.useMutation({
    onSuccess: () => {
      toast.success("Upgrade ativado com sucesso!");
      onClose();
      navigate("/checkout");
    },
    onError: (error) => {
      toast.error(error.message);
      setIsUpgrading(false);
    },
  });

  const handleUpgrade = () => {
    setIsUpgrading(true);
    activateUpgradeMutation.mutate({
      upgradeType: "standard_1tb",
    });
  };

  const usagePercentage = (currentUsageGb / limitGb) * 100;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-6 h-6 text-orange-600" />
            <AlertDialogTitle>Limite de Armazenamento Atingido</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-left">
            <div className="space-y-4 mt-4">
              <p>
                Você atingiu o limite de armazenamento do seu plano atual.
              </p>

              {/* Barra de Progresso */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">
                    {currentUsageGb.toFixed(1)}GB / {limitGb}GB
                  </span>
                  <span className="text-sm font-medium text-orange-600">
                    {usagePercentage.toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-orange-600 h-2 rounded-full"
                    style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Opções */}
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">
                  Solução: Upgrade Standard 1TB
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>✓ Aumente para 1024GB de armazenamento</li>
                  <li>✓ Apenas +R$ 149,90/mês</li>
                  <li>✓ Suporte humano incluído</li>
                  <li>✓ Sem interrupção de serviço</li>
                </ul>
              </div>

              <p className="text-xs text-slate-600">
                Você pode fazer upgrade a qualquer momento. O novo limite
                entrará em vigor imediatamente.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex gap-3 mt-4">
          <AlertDialogCancel>Fechar</AlertDialogCancel>
          <Button
            onClick={handleUpgrade}
            disabled={isUpgrading || activateUpgradeMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isUpgrading ? "Processando..." : "Fazer Upgrade"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
