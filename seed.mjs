#!/usr/bin/env node
/**
 * Vya Nexus - Database Seed Script
 * Popula dados iniciais no banco de dados (planos, configurações, etc)
 * 
 * Uso:
 *   pnpm exec node seed.mjs
 *   ou
 *   node seed.mjs
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Carregar variáveis de ambiente
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ Erro: DATABASE_URL não está configurado no arquivo .env');
  process.exit(1);
}

// Parsear DATABASE_URL
function parseDatabaseUrl(url) {
  const match = url.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
  if (!match) {
    throw new Error(`Formato inválido de DATABASE_URL: ${url}`);
  }
  return {
    user: match[1],
    password: match[2],
    host: match[3],
    port: parseInt(match[4]),
    database: match[5],
  };
}

async function seed() {
  let connection;
  try {
    const config = parseDatabaseUrl(DATABASE_URL);
    console.log(`🔗 Conectando ao banco de dados: ${config.host}:${config.port}/${config.database}`);
    
    connection = await mysql.createConnection(config);
    console.log('✅ Conectado ao banco de dados\n');

    // ========== VERIFICAR SE JÁ EXISTEM DADOS ==========
    const [existingPlans] = await connection.query('SELECT COUNT(*) as count FROM plans');
    if (existingPlans[0].count > 0) {
      console.log('⚠️  Planos já existem no banco. Pulando seed...');
      await connection.end();
      return;
    }

    // ========== INSERIR PLANOS ==========
    console.log('📋 Inserindo planos comerciais...');
    const plans = [
      {
        name: 'Vya Solo',
        description: 'Plano individual com 1 conta de email e 60GB de storage',
        priceMonthCents: 2990,
        emailSeats: 1,
        storagePerAccountGb: 60,
        humanSupport: 0,
      },
      {
        name: 'Starter 5',
        description: 'Plano para pequenas equipes com 5 contas de email e 60GB cada',
        priceMonthCents: 9990,
        emailSeats: 5,
        storagePerAccountGb: 60,
        humanSupport: 0,
      },
      {
        name: 'Starter 10',
        description: 'Plano para equipes médias com 10 contas de email e 60GB cada',
        priceMonthCents: 18990,
        emailSeats: 10,
        storagePerAccountGb: 60,
        humanSupport: 1,
      },
      {
        name: 'Vya Pro',
        description: 'Plano profissional com 10 contas de email e 100GB cada + Suporte Humano',
        priceMonthCents: 19990,
        emailSeats: 10,
        storagePerAccountGb: 100,
        humanSupport: 1,
      },
      {
        name: 'Standard 1TB',
        description: 'Upgrade para 1TB de storage adicional',
        priceMonthCents: 14990,
        emailSeats: 0,
        storagePerAccountGb: 1024,
        humanSupport: 0,
      },
    ];

    for (const plan of plans) {
      await connection.query(
        'INSERT INTO plans (name, description, priceMonthCents, emailSeats, storagePerAccountGb, humanSupport, active) VALUES (?, ?, ?, ?, ?, ?, 1)',
        [
          plan.name,
          plan.description,
          plan.priceMonthCents,
          plan.emailSeats,
          plan.storagePerAccountGb,
          plan.humanSupport,
        ]
      );
      console.log(`  ✓ ${plan.name} - R$ ${(plan.priceMonthCents / 100).toFixed(2)}`);
    }

    console.log('\n✅ Seed concluído com sucesso!\n');
    console.log('📊 Resumo:');
    console.log('  - 5 planos comerciais inseridos');
    console.log('  - Banco de dados pronto para uso\n');

    await connection.end();
  } catch (error) {
    console.error('❌ Erro durante seed:', error.message);
    if (connection) {
      await connection.end();
    }
    process.exit(1);
  }
}

// Executar seed
seed().then(() => {
  console.log('🎉 Pronto para começar!\n');
  console.log('Próximos passos:');
  console.log('  1. Abra http://localhost:3000 no navegador');
  console.log('  2. Clique em "Entrar com Manus"');
  console.log('  3. Complete o onboarding\n');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
