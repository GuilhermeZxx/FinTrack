import express from 'express'
import client from '../db.js'

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const result = await client.query('SELECT NOW()')
    res.json(result.rows)
  } catch (error) {
    console.error(error)
    res.status(500).send('Erro no banco')
  }
})

router.post('/cadastro', async (req, res)=>{
    const{ nome, email, senha} = req.body

        const result = await client.query( `INSERT INTO usuarios (nome, email, senha)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [nome, email, senha]
    )

        res.json(result.rows[0])

    })
  



export default router
