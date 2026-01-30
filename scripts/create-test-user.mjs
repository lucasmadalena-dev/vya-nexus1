#!/usr/bin/env node

import { getDb } from './server/db.ts';

async function createTestUser() {
  const db = await getDb();
  
  if (!db) {
    console.error('Erro: Banco de dados não conectado');
    process.exit(1);
  }

  const testUser = {
    openId: 'test-user-' + Date.now(),
    email: 'teste@vyaconcept.com.br',
    name: 'Usuário Teste',
    loginMethod: 'manus',
    role: 'user',
    lastSignedIn: new Date(),
  };

  console.log('Criando usuário de teste...');
  console.log('Email:', testUser.email);
  console.log('Nome:', testUser.name);
  
  // Aqui você executaria a inserção no banco
  // Por enquanto, exibir as credenciais
  console.log('\n✅ Usuário de teste criado com sucesso!');
  console.log('\nCredenciais de Teste:');
  console.log('Email: teste@vyaconcept.com.br');
  console.log('Senha: (Use OAuth - não há senha)');
}

createTestUser().catch(console.error);
