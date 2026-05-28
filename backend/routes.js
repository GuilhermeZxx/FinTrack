import { Router } from 'express';
import bcrypt from 'bcrypt';
import client from './db.js'; // Importa a conexão com o banco

const router = Router();


router.post('/cadastro', async (req, res) => {
    const { nome, email, senha } = req.body;

    try {
        if (!nome || !email || !senha) {
            return res.status(400).json({ error: "Todos os campos são obrigatórios" });
        }

      
        const senhaCriptografada = await bcrypt.hash(senha, 10);

        const result = await client.query(
            `INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3) RETURNING *`,
            [nome, email, senhaCriptografada]
        );

        const novoUsuario = result.rows[0];
        delete novoUsuario.senha; 

        res.status(201).json(novoUsuario);
    } catch (error) {
        console.error(error);
        if (error.code === '23505') {
            return res.status(400).json({ error: "Este e-mail já está cadastrado." });
        }
        res.status(500).json({ error: "Erro interno no servidor." });
    }
});


router.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    try {
        if (!email || !senha) {
            return res.status(400).json({ error: "E-mail e senha são obrigatórios" });
        }

        
        const result = await client.query(
            `SELECT * FROM usuarios WHERE email = $1`,
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: "E-mail ou senha incorretos" });
        }

        const usuario = result.rows[0];

        
        const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

        if (!senhaCorreta) {
            return res.status(401).json({ error: "E-mail ou senha incorretos" });
        }

        delete usuario.senha;

        res.json({
            message: "Login realizado com sucesso!",
            usuario: usuario
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro interno no servidor." });
    }
});

export default router;