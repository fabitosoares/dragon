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
        res.setHeader('Access-Control-Allow-Origin', '*'); // Permite qualquer origem (pra teste)
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
    },
    onProxyReq: (proxyReq, req, res) => {
        // Garante que o cabeçalho Authorization seja enviado
        if (req.headers.authorization) {
            proxyReq.setHeader('Authorization', req.headers.authorization);
        }
    },
    onError: (err, req, res) => {
        console.error('Erro no proxy:', err);
        res.status(500).send(`Erro no proxy: ${err.message}`);
    }
}));

// Lida com requisições OPTIONS (preflight)
app.options('/api/*', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
    res.sendStatus(204);
});

// Rota padrão pra confirmar que o servidor tá rodando
app.get('/', (req, res) => {
    res.send('Proxy server está rodando!');
});

// Inicia o servidor na porta definida pelo Render
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Proxy server rodando na porta ${PORT}`);
});
