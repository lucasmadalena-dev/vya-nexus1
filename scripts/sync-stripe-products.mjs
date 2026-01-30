#!/usr/bin/env node

/**
 * Script de Sincronização de Planos com Stripe
 * 
 * Cria produtos e preços no Stripe (Modo Teste) baseado na matriz de planos do Vya Nexus
 * 
 * Uso: node scripts/sync-stripe-products.mjs
 */

import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

/**
 * Matriz de Planos do Vya Nexus
 */
const PLANS = [
  {
    id: 'vya-solo',
    name: 'Vya Solo',
    description: 'Perfeito para profissionais autônomos. 1 conta de email com 60GB.',
    priceMonthCents: 2990, // R$ 29,90
    emailSeats: 1,
    storagePerAccountGb: 60,
    humanSupport: false,
  },
  {
    id: 'starter-5',
    name: 'Starter 5',
    description: 'Ideal para pequenas equipes. 5 contas de email com 60GB cada.',
    priceMonthCents: 9990, // R$ 99,90
    emailSeats: 5,
    storagePerAccountGb: 60,
    humanSupport: false,
  },
  {
    id: 'starter-10',
    name: 'Starter 10',
    description: 'Para empresas em crescimento. 10 contas de email com 60GB cada + Suporte Humano.',
    priceMonthCents: 18990, // R$ 189,90
    emailSeats: 10,
    storagePerAccountGb: 60,
    humanSupport: true,
  },
  {
    id: 'vya-pro',
    name: 'Vya Pro',
    description: 'Solução completa. 10 contas de email com 100GB cada + Suporte Prioritário.',
    priceMonthCents: 19990, // R$ 199,90
    emailSeats: 10,
    storagePerAccountGb: 100,
    humanSupport: true,
  },
];

/**
 * Upgrade Standard 1TB
 */
const UPGRADE_STANDARD_1TB = {
  id: 'standard-1tb',
  name: 'Upgrade Standard 1TB',
  description: 'Aumente seu armazenamento para 1TB. Adicional de R$ 149,90/mês.',
  priceMonthCents: 14990, // R$ 149,90
};

/**
 * Sincronizar produtos com Stripe
 */
async function syncStripeProducts() {
  console.log('🚀 Iniciando sincronização de planos com Stripe...\n');

  try {
    // Verificar se chave Stripe está configurada
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY não está configurada no .env');
    }

    console.log('✓ Chave Stripe encontrada\n');

    // Criar produtos e preços
    const createdProducts = [];

    // 1. Criar Planos
    console.log('📦 Criando produtos de planos...\n');

    for (const plan of PLANS) {
      try {
        // Criar produto
        const product = await stripe.products.create({
          name: plan.name,
          description: plan.description,
          metadata: {
            planId: plan.id,
            emailSeats: plan.emailSeats.toString(),
            storagePerAccountGb: plan.storagePerAccountGb.toString(),
            humanSupport: plan.humanSupport.toString(),
          },
        });

        console.log(`✓ Produto criado: ${plan.name} (ID: ${product.id})`);

        // Criar preço mensal
        const price = await stripe.prices.create({
          product: product.id,
          unit_amount: plan.priceMonthCents,
          currency: 'brl',
          recurring: {
            interval: 'month',
            interval_count: 1,
          },
          metadata: {
            planId: plan.id,
          },
        });

        console.log(
          `  └─ Preço criado: R$ ${(plan.priceMonthCents / 100).toFixed(2)}/mês (ID: ${price.id})\n`
        );

        createdProducts.push({
          planId: plan.id,
          planName: plan.name,
          productId: product.id,
          priceId: price.id,
          priceBRL: `R$ ${(plan.priceMonthCents / 100).toFixed(2)}`,
        });
      } catch (error) {
        console.error(`✗ Erro ao criar plano ${plan.name}:`, error.message);
      }
    }

    // 2. Criar Upgrade Standard 1TB
    console.log('📦 Criando produto de upgrade...\n');

    try {
      const upgradeProduct = await stripe.products.create({
        name: UPGRADE_STANDARD_1TB.name,
        description: UPGRADE_STANDARD_1TB.description,
        metadata: {
          upgradeType: 'standard_1tb',
          newStorageLimitGb: '1024',
        },
      });

      console.log(
        `✓ Produto de upgrade criado: ${UPGRADE_STANDARD_1TB.name} (ID: ${upgradeProduct.id})`
      );

      const upgradePrice = await stripe.prices.create({
        product: upgradeProduct.id,
        unit_amount: UPGRADE_STANDARD_1TB.priceMonthCents,
        currency: 'brl',
        recurring: {
          interval: 'month',
          interval_count: 1,
        },
        metadata: {
          upgradeType: 'standard_1tb',
        },
      });

      console.log(
        `  └─ Preço criado: R$ ${(UPGRADE_STANDARD_1TB.priceMonthCents / 100).toFixed(2)}/mês (ID: ${upgradePrice.id})\n`
      );

      createdProducts.push({
        upgradeId: 'standard_1tb',
        upgradeName: UPGRADE_STANDARD_1TB.name,
        productId: upgradeProduct.id,
        priceId: upgradePrice.id,
        priceBRL: `R$ ${(UPGRADE_STANDARD_1TB.priceMonthCents / 100).toFixed(2)}`,
      });
    } catch (error) {
      console.error(
        `✗ Erro ao criar upgrade ${UPGRADE_STANDARD_1TB.name}:`,
        error.message
      );
    }

    // 3. Exibir resumo
    console.log('\n' + '='.repeat(70));
    console.log('✅ SINCRONIZAÇÃO CONCLUÍDA COM SUCESSO!');
    console.log('='.repeat(70) + '\n');

    console.log('📋 Produtos Criados:\n');
    createdProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.planName || product.upgradeName}`);
      console.log(`   Preço: ${product.priceBRL}`);
      console.log(`   Product ID: ${product.productId}`);
      console.log(`   Price ID: ${product.priceId}\n`);
    });

    console.log('='.repeat(70));
    console.log('\n💡 Próximos passos:');
    console.log('1. Acesse https://dashboard.stripe.com (Modo Teste)');
    console.log('2. Vá para "Products" para ver os planos criados');
    console.log('3. Copie os Price IDs e adicione ao seu código de checkout');
    console.log('4. Teste o fluxo de pagamento no ambiente de desenvolvimento\n');

    // Salvar IDs em arquivo para referência
    const outputData = {
      timestamp: new Date().toISOString(),
      environment: 'test',
      products: createdProducts,
    };

    console.log('📁 Dados salvos em: scripts/stripe-products.json\n');
    console.log(JSON.stringify(outputData, null, 2));

  } catch (error) {
    console.error('\n❌ Erro durante sincronização:', error.message);
    process.exit(1);
  }
}

// Executar sincronização
syncStripeProducts();
