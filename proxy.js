const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Configura o proxy pra API do Hugging Face
app.use('/api', createProxyMiddleware({
    target: 'https://api-inference.huggingface.co',
    changeOrigin: true,
    pathRewrite: {
        '^/api': '', // Remove o prefixo /api da URL
    },
    onProxyRes: (proxyRes, req, res) => {
        // Adiciona os cabeçalhos CORS necessários
        res.setHeader('Access-Control-Allow-Origin', 'https://support.fs-cursos.com.br');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
    },
    onProxyReq: (proxyReq, req, res) => {
        // Garante que o cabeçalho Authorization seja enviado
        if (req.headers.authorization) {
            proxyReq.setHeader('Authorization', req.headers.authorization);
        }
    }
}));

// Lida com requisições OPTIONS (preflight)
app.options('/api/*', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', 'https://support.fs-cursos.com.br');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
    res.sendStatus(204);
});

// Inicia o servidor na porta definida pelo Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Proxy server rodando na porta ${PORT}`);
});
