#!/usr/bin/env node

/**
 * Script para gerenciar usuários do SmartLabel AI
 * 
 * Uso:
 * node scripts/manage-users.js create <username> <email> <password> [role]
 * node scripts/manage-users.js list
 * node scripts/manage-users.js delete <username>
 * node scripts/manage-users.js update <username> <field> <value>
 * 
 * Exemplos:
 * node scripts/manage-users.js create admin admin@smartlabel.ai admin123 admin
 * node scripts/manage-users.js create user1 user1@example.com password123 user
 * node scripts/manage-users.js list
 * node scripts/manage-users.js delete user1
 * node scripts/manage-users.js update admin role superadmin
 */

const { DynamoDB } = require('aws-sdk');

// Configuração do DynamoDB
const dynamodb = new DynamoDB.DocumentClient({
  region: process.env.AWS_REGION || 'us-east-1'
});

const USERS_TABLE = process.env.USERS_TABLE || 'SmartLabel-Users-dev';

async function createUser(username, email, password, role = 'user') {
  try {
    // Verificar se usuário já existe
    const existingUser = await dynamodb.get({
      TableName: USERS_TABLE,
      Key: { username }
    }).promise();

    if (existingUser.Item) {
      console.log(`❌ Usuário '${username}' já existe!`);
      return;
    }

    // Verificar se email já existe
    const emailResult = await dynamodb.query({
      TableName: USERS_TABLE,
      IndexName: 'by-email',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': email
      }
    }).promise();

    if (emailResult.Items && emailResult.Items.length > 0) {
      console.log(`❌ Email '${email}' já está em uso!`);
      return;
    }

    // Criar usuário
    const user = {
      username,
      email,
      password, // Em produção, hash a senha
      role,
      createdAt: new Date().toISOString()
    };

    await dynamodb.put({
      TableName: USERS_TABLE,
      Item: user
    }).promise();

    console.log(`✅ Usuário '${username}' criado com sucesso!`);
    console.log(`   Email: ${email}`);
    console.log(`   Role: ${role}`);
    console.log(`   Criado em: ${user.createdAt}`);
  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error.message);
  }
}

async function listUsers() {
  try {
    const result = await dynamodb.scan({
      TableName: USERS_TABLE,
      ProjectionExpression: 'username, email, role, createdAt, lastLogin'
    }).promise();

    if (!result.Items || result.Items.length === 0) {
      console.log('📝 Nenhum usuário encontrado.');
      return;
    }

    console.log(`📝 Lista de usuários (${result.Items.length} total):`);
    console.log('─'.repeat(80));
    
    result.Items.forEach((user, index) => {
      console.log(`${index + 1}. ${user.username}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Criado: ${user.createdAt}`);
      if (user.lastLogin) {
        console.log(`   Último login: ${user.lastLogin}`);
      }
      console.log('');
    });
  } catch (error) {
    console.error('❌ Erro ao listar usuários:', error.message);
  }
}

async function deleteUser(username) {
  try {
    // Verificar se usuário existe
    const existingUser = await dynamodb.get({
      TableName: USERS_TABLE,
      Key: { username }
    }).promise();

    if (!existingUser.Item) {
      console.log(`❌ Usuário '${username}' não encontrado!`);
      return;
    }

    await dynamodb.delete({
      TableName: USERS_TABLE,
      Key: { username }
    }).promise();

    console.log(`✅ Usuário '${username}' deletado com sucesso!`);
  } catch (error) {
    console.error('❌ Erro ao deletar usuário:', error.message);
  }
}

async function updateUser(username, field, value) {
  try {
    // Verificar se usuário existe
    const existingUser = await dynamodb.get({
      TableName: USERS_TABLE,
      Key: { username }
    }).promise();

    if (!existingUser.Item) {
      console.log(`❌ Usuário '${username}' não encontrado!`);
      return;
    }

    // Validar campo
    const allowedFields = ['email', 'password', 'role'];
    if (!allowedFields.includes(field)) {
      console.log(`❌ Campo '${field}' não é válido. Campos permitidos: ${allowedFields.join(', ')}`);
      return;
    }

    await dynamodb.update({
      TableName: USERS_TABLE,
      Key: { username },
      UpdateExpression: `SET ${field} = :value`,
      ExpressionAttributeValues: {
        ':value': value
      }
    }).promise();

    console.log(`✅ Usuário '${username}' atualizado com sucesso!`);
    console.log(`   ${field}: ${value}`);
  } catch (error) {
    console.error('❌ Erro ao atualizar usuário:', error.message);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command) {
    console.log(`
🔐 SmartLabel AI - Gerenciador de Usuários

Uso:
  node scripts/manage-users.js <comando> [argumentos]

Comandos:
  create <username> <email> <password> [role]  - Criar novo usuário
  list                                        - Listar todos os usuários
  delete <username>                           - Deletar usuário
  update <username> <field> <value>           - Atualizar usuário

Exemplos:
  node scripts/manage-users.js create admin admin@smartlabel.ai admin123 admin
  node scripts/manage-users.js create user1 user1@example.com password123 user
  node scripts/manage-users.js list
  node scripts/manage-users.js delete user1
  node scripts/manage-users.js update admin role superadmin

Variáveis de ambiente:
  AWS_REGION     - Região AWS (padrão: us-east-1)
  USERS_TABLE    - Nome da tabela DynamoDB (padrão: SmartLabel-Users-dev)
    `);
    return;
  }

  switch (command) {
    case 'create':
      if (args.length < 4) {
        console.log('❌ Uso: create <username> <email> <password> [role]');
        return;
      }
      await createUser(args[1], args[2], args[3], args[4] || 'user');
      break;

    case 'list':
      await listUsers();
      break;

    case 'delete':
      if (args.length < 2) {
        console.log('❌ Uso: delete <username>');
        return;
      }
      await deleteUser(args[1]);
      break;

    case 'update':
      if (args.length < 4) {
        console.log('❌ Uso: update <username> <field> <value>');
        return;
      }
      await updateUser(args[1], args[2], args[3]);
      break;

    default:
      console.log(`❌ Comando '${command}' não reconhecido.`);
      console.log('Comandos disponíveis: create, list, delete, update');
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  createUser,
  listUsers,
  deleteUser,
  updateUser
};
