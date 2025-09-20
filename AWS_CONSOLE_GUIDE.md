# 🚀 SmartLabel AI - Guia AWS Console

## 📍 **URLs da Aplicação**

### 🌐 **Frontend (CloudFront)**
- **URL Principal**: `https://E12XL2DUMYY3FZ.cloudfront.net`
- **Status**: ✅ Deployado (pode levar 10-15 min para propagar)

### 🔧 **Backend (API Gateway)**
- **API URL**: `https://2b5m23neo4.execute-api.us-east-1.amazonaws.com/Prod/`
- **Status**: ✅ Funcionando

---

## 🔍 **Como Verificar na AWS Console**

### 1. **CloudFront Distribution**
```
AWS Console → CloudFront → Distributions
- ID: E12XL2DUMYY3FZ
- Status: Deployed
- Domain: E12XL2DUMYY3FZ.cloudfront.net
```

### 2. **S3 Bucket (Frontend)**
```
AWS Console → S3 → Buckets
- Nome: smartlabel-ai-frontend-1758390616
- Região: us-east-1
- Website: Habilitado
```

### 3. **Lambda Function (Backend)**
```
AWS Console → Lambda → Functions
- Nome: smartlabel-ai-stack-SmartLabelApiFunction-jJiFG5IlBdfw
- Runtime: Node.js 18.x
- Status: Ativo
```

### 4. **API Gateway**
```
AWS Console → API Gateway → APIs
- Nome: smartlabel-ai-stack-SmartLabelApi
- URL: https://2b5m23neo4.execute-api.us-east-1.amazonaws.com/Prod/
- Status: Deployed
```

### 5. **CloudFormation Stack**
```
AWS Console → CloudFormation → Stacks
- Nome: smartlabel-ai-stack
- Status: CREATE_COMPLETE
- Região: us-east-1
```

---

## 🧪 **Testes na AWS Console**

### **Testar Lambda Function**
1. Vá para **Lambda → Functions**
2. Selecione `smartlabel-ai-stack-SmartLabelApiFunction-jJiFG5IlBdfw`
3. Clique em **Test**
4. Use este payload:
```json
{
  "httpMethod": "GET",
  "path": "/health",
  "body": null
}
```

### **Testar API Gateway**
1. Vá para **API Gateway → APIs**
2. Selecione `smartlabel-ai-stack-SmartLabelApi`
3. Clique em **Test**
4. Teste o endpoint `/health`

### **Verificar Logs**
1. **Lambda Logs**: CloudWatch → Log Groups → `/aws/lambda/smartlabel-ai-stack-SmartLabelApiFunction-jJiFG5IlBdfw`
2. **API Gateway Logs**: CloudWatch → Log Groups → `/aws/apigateway/smartlabel-ai-stack-SmartLabelApi`

---

## 📊 **Monitoramento**

### **CloudWatch Metrics**
- **Lambda**: Invocações, Duração, Erros
- **API Gateway**: Requests, Latência, 4XX/5XX Errors
- **CloudFront**: Requests, Cache Hit Ratio, Data Transfer

### **Alertas Recomendados**
- Lambda errors > 5%
- API Gateway 5XX errors > 1%
- CloudFront cache hit ratio < 80%

---

## 🔧 **Configurações Importantes**

### **Environment Variables (Lambda)**
```
BEDROCK_REGION: us-east-1
BEDROCK_MODEL_ID: anthropic.claude-3-sonnet-20240229-v1:0
NODE_ENV: production
```

### **IAM Permissions**
- **Lambda**: Bedrock access, CloudWatch logs
- **CloudFront**: S3 bucket access
- **API Gateway**: Lambda invoke permissions

---

## 🚨 **Troubleshooting**

### **Se o Frontend não carregar:**
1. Verifique CloudFront status
2. Confirme S3 bucket policy
3. Verifique se arquivos foram uploadados

### **Se a API não responder:**
1. Verifique Lambda function status
2. Confirme API Gateway deployment
3. Verifique CloudWatch logs

### **Se Bedrock não funcionar:**
1. Verifique IAM permissions
2. Confirme região do Bedrock
3. Verifique model ID

---

## 📱 **Acessar a Aplicação**

### **URLs Finais:**
- **Frontend**: `https://E12XL2DUMYY3FZ.cloudfront.net`
- **API**: `https://2b5m23neo4.execute-api.us-east-1.amazonaws.com/Prod/`

### **Teste Completo:**
1. Acesse o frontend
2. Preencha o formulário de produto
3. Gere um label nutricional
4. Verifique se a IA do Bedrock está funcionando

---

## 💰 **Custos Estimados**

### **Recursos Criados:**
- **Lambda**: ~$0.20/milhão de requests
- **API Gateway**: ~$3.50/milhão de requests
- **CloudFront**: ~$0.085/GB transferido
- **S3**: ~$0.023/GB armazenado
- **Bedrock**: ~$0.003/1K tokens

### **Custo Mensal Estimado:**
- **Baixo tráfego**: $5-10
- **Médio tráfego**: $20-50
- **Alto tráfego**: $100+

---

## 🎯 **Próximos Passos**

1. **Monitorar** a aplicação por alguns dias
2. **Configurar** alertas no CloudWatch
3. **Otimizar** cache do CloudFront
4. **Implementar** autenticação se necessário
5. **Adicionar** mais funcionalidades

---

## 📞 **Suporte**

Se precisar de ajuda:
1. Verifique os logs no CloudWatch
2. Teste cada componente individualmente
3. Confirme as configurações de IAM
4. Verifique se todos os recursos estão na mesma região (us-east-1)
