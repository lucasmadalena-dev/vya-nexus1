import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Mail, Clock } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";

export default function Support() {
  const { user } = useAuth();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "critical">("medium");

  const { data: supportAccess } = trpc.support.checkHumanSupportAccess.useQuery();
  const { data: tickets } = trpc.support.listTickets.useQuery();
  const createTicketMutation = trpc.support.createTicket.useMutation({
    onSuccess: () => {
      toast.success("Ticket criado com sucesso!");
      setSubject("");
      setMessage("");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleCreateTicket = () => {
    if (!subject || !message) {
      toast.error("Preencha todos os campos");
      return;
    }

    createTicketMutation.mutate({
      subject,
      description: message,
      priority,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Central de Suporte
          </h1>
          <p className="text-xl text-slate-600">
            Estamos aqui para ajudar você
          </p>
        </div>

        {/* Opções de Suporte */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Chat IA */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <MessageCircle className="w-5 h-5 text-blue-600" />
                <CardTitle>Chat IA 24/7</CardTitle>
              </div>
              <CardDescription>
                Suporte instantâneo com inteligência artificial
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600">
                Disponível 24 horas por dia, 7 dias por semana. Respostas
                instantâneas para dúvidas comuns sobre DNS, configuração de
                email e hospedagem.
              </p>
              <Button className="w-full">Iniciar Chat</Button>
            </CardContent>
          </Card>

          {/* Suporte Humano */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-green-600" />
                <CardTitle>Suporte Humano</CardTitle>
              </div>
              <CardDescription>
                Atendimento em horário comercial
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {supportAccess?.hasAccess ? (
                <>
                  <Badge className="bg-green-100 text-green-800">
                    Ativado para seu plano
                  </Badge>
                  <p className="text-sm text-slate-600">
                    Seg-Sex: 09:00 - 18:00 (Brasília)
                  </p>
                  <Button className="w-full" variant="outline">
                    Criar Ticket
                  </Button>
                </>
              ) : (
                <>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    Requer upgrade
                  </Badge>
                  <p className="text-sm text-slate-600">
                    Disponível em planos Starter 10, Vya Pro ou com upgrade
                    Standard 1TB.
                  </p>
                  <Button className="w-full" variant="outline">
                    Fazer Upgrade
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Email de Suporte */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Mail className="w-5 h-5 text-purple-600" />
                <CardTitle>Suporte por Email</CardTitle>
              </div>
              <CardDescription>
                Disponível para todos os planos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600">
                Envie suas dúvidas para suporte@vyaconcept.com.br e receba
                resposta em até 24 horas.
              </p>
              <Button className="w-full" variant="outline">
                Enviar Email
              </Button>
            </CardContent>
          </Card>

          {/* FAQ */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Perguntas Frequentes</CardTitle>
              <CardDescription>
                Respostas rápidas para dúvidas comuns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600">
                Consulte nossa base de conhecimento com tutoriais e guias sobre
                configuração de domínios, email e hospedagem.
              </p>
              <Button className="w-full" variant="outline">
                Acessar FAQ
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Criar Ticket */}
        {supportAccess?.hasAccess && (
          <Card className="mb-12">
            <CardHeader>
              <CardTitle>Criar Novo Ticket de Suporte</CardTitle>
              <CardDescription>
                Descreva seu problema e entraremos em contato em breve
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Assunto
                </label>
                <Input
                  placeholder="Descreva brevemente seu problema"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Descrição
                </label>
                <Textarea
                  placeholder="Forneça detalhes sobre seu problema"
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Prioridade
                </label>
                <select
                  value={priority}
                  onChange={(e) =>
                    setPriority(
                      e.target.value as "low" | "medium" | "high" | "critical"
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                  <option value="critical">Crítica</option>
                </select>
              </div>

              <Button
                className="w-full"
                onClick={handleCreateTicket}
                disabled={createTicketMutation.isPending}
              >
                {createTicketMutation.isPending
                  ? "Criando..."
                  : "Criar Ticket"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Meus Tickets */}
        {tickets && tickets.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Meus Tickets</CardTitle>
              <CardDescription>
                Acompanhe o status de seus tickets de suporte
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tickets.map((ticket: any) => (
                  <div
                    key={ticket.id}
                    className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {ticket.subject}
                        </h3>
                        <p className="text-sm text-slate-600 mt-1">
                          {ticket.description}
                        </p>
                      </div>
                      <Badge
                        className={
                          ticket.status === "open"
                            ? "bg-blue-100 text-blue-800"
                            : ticket.status === "in_progress"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                        }
                      >
                        {ticket.status === "open"
                          ? "Aberto"
                          : ticket.status === "in_progress"
                            ? "Em Progresso"
                            : "Resolvido"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500 mt-3">
                      <span>
                        Criado em{" "}
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </span>
                      <span>Prioridade: {ticket.priority}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
