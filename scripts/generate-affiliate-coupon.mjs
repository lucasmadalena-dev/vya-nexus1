#!/usr/bin/env node

/**
 * Script para gerar cupons de afiliados no Stripe
 * 
 * Uso: node scripts/generate-affiliate-coupon.mjs --email seu@email.com --name "Seu Nome"
 */

import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

/**
 * Gerar código de cupom único
 */
function generateCouponCode() {
  return `VYA${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
}

/**
 * Criar cupom de afiliado
 */
async function createAffiliateCoupon(email, name, discountPercentage = 10) {
  try {
    const couponCode = generateCouponCode();

    console.log(`\n🎟️  Criando cupom para ${name} (${email})...`);
    console.log(`Código: ${couponCode}`);
    console.log(`Desconto: ${discountPercentage}%\n`);

    const coupon = await stripe.coupons.create({
      percent_off: discountPercentage,
      duration: 'forever',
      id: couponCode,
      metadata: {
        affiliateEmail: email,
        affiliateName: name,
        type: 'affiliate',
      },
    });

    console.log('✅ Cupom criado com sucesso!\n');
    console.log('Detalhes do Cupom:');
    console.log(`- ID: ${coupon.id}`);
    console.log(`- Desconto: ${coupon.percent_off}%`);
    console.log(`- Duração: ${coupon.duration}`);
    console.log(`- Ativo: ${coupon.valid}`);
    console.log(`- Criado em: ${new Date(coupon.created * 1000).toLocaleString()}\n`);

    return coupon;
  } catch (error) {
    console.error('❌ Erro ao criar cupom:', error.message);
    process.exit(1);
  }
}

/**
 * Listar todos os cupons de afiliados
 */
async function listAffiliateCoupons() {
  try {
    console.log('\n📋 Listando cupons de afiliados...\n');

    const coupons = await stripe.coupons.list({ limit: 100 });

    const affiliateCoupons = coupons.data.filter(
      (coupon) => coupon.metadata?.type === 'affiliate'
    );

    if (affiliateCoupons.length === 0) {
      console.log('Nenhum cupom de afiliado encontrado.');
      return;
    }

    console.log(`Total de cupons: ${affiliateCoupons.length}\n`);

    affiliateCoupons.forEach((coupon, index) => {
      console.log(`${index + 1}. ${coupon.id}`);
      console.log(`   Afiliado: ${coupon.metadata?.affiliateName}`);
      console.log(`   Email: ${coupon.metadata?.affiliateEmail}`);
      console.log(`   Desconto: ${coupon.percent_off}%`);
      console.log(`   Ativo: ${coupon.valid ? '✅' : '❌'}\n`);
    });
  } catch (error) {
    console.error('❌ Erro ao listar cupons:', error.message);
    process.exit(1);
  }
}

/**
 * Obter informações de um cupom
 */
async function getCouponInfo(couponId) {
  try {
    console.log(`\n🔍 Obtendo informações do cupom: ${couponId}\n`);

    const coupon = await stripe.coupons.retrieve(couponId);

    console.log('Detalhes do Cupom:');
    console.log(`- ID: ${coupon.id}`);
    console.log(`- Desconto: ${coupon.percent_off}%`);
    console.log(`- Duração: ${coupon.duration}`);
    console.log(`- Ativo: ${coupon.valid ? '✅' : '❌'}`);
    console.log(`- Criado em: ${new Date(coupon.created * 1000).toLocaleString()}`);
    console.log(`- Vezes usado: ${coupon.times_redeemed}`);

    if (coupon.metadata?.affiliateName) {
      console.log(`\nAfiliado:`);
      console.log(`- Nome: ${coupon.metadata.affiliateName}`);
      console.log(`- Email: ${coupon.metadata.affiliateEmail}`);
    }

    console.log('\n');
  } catch (error) {
    console.error('❌ Erro ao obter cupom:', error.message);
    process.exit(1);
  }
}

// Processar argumentos da linha de comando
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log(`
Uso: node scripts/generate-affiliate-coupon.mjs [comando] [opções]

Comandos:
  create --email EMAIL --name "NOME"    Criar novo cupom de afiliado
  list                                   Listar todos os cupons de afiliados
  info COUPON_ID                         Obter informações de um cupom

Exemplos:
  node scripts/generate-affiliate-coupon.mjs create --email joao@instagram.com --name "João Silva"
  node scripts/generate-affiliate-coupon.mjs list
  node scripts/generate-affiliate-coupon.mjs info VYA1A2B3C4D5
  `);
  process.exit(0);
}

const command = args[0];

if (command === 'create') {
  const emailIndex = args.indexOf('--email');
  const nameIndex = args.indexOf('--name');

  if (emailIndex === -1 || nameIndex === -1) {
    console.error('❌ Erro: --email e --name são obrigatórios');
    process.exit(1);
  }

  const email = args[emailIndex + 1];
  const name = args[nameIndex + 1];

  createAffiliateCoupon(email, name);
} else if (command === 'list') {
  listAffiliateCoupons();
} else if (command === 'info') {
  const couponId = args[1];
  if (!couponId) {
    console.error('❌ Erro: ID do cupom é obrigatório');
    process.exit(1);
  }
  getCouponInfo(couponId);
} else {
  console.error(`❌ Comando desconhecido: ${command}`);
  process.exit(1);
}
