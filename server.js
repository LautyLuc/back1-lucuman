import express from 'express'
import cors from 'cors'
import productsRoutes from './src/routes/products.routes.js'
import cartsRoutes from './src/routes/carts.routes.js'

const app = express()
const PORT = 8080


app.use(cors())
app.use(express.json())


app.use('/api/products', productsRoutes)
app.use('/api/carts', cartsRoutes)


app.get('/', (req, res) => {
  res.json({
    message: 'Servidor de E-commerce en funcionamiento',
    endpoints: {
      products: '/api/products',
      carts: '/api/carts'
    }
  })
})

// Error 404
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' })
})

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✓ Servidor corriendo en http://localhost:${PORT}`)
})
