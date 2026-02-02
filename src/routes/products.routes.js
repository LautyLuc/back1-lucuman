import express from 'express'
import { ProductManager } from '../ProductManager.js'

const router = express.Router()
const productManager = new ProductManager()

// GET / - Listar todos los productos
router.get('/', async (req, res) => {
  try {
    const products = await productManager.getAll()
    res.json(products)
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener productos', details: error.message })
  }
})

// GET /:pid - Obtener producto por ID
router.get('/:pid', async (req, res) => {
  try {
    const { pid } = req.params
    const product = await productManager.getById(pid)
    
    if (!product) {
      return res.status(404).json({ error: `Producto con ID ${pid} no encontrado` })
    }
    
    res.json(product)
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener producto', details: error.message })
  }
})

// POST / - Crear nuevo producto
router.post('/', async (req, res) => {
  try {
    const { title, description, code, price, status, stock, category, thumbnails } = req.body
    
    // Validar campos requeridos
    if (!title || !description || !code || !price || !stock || !category) {
      return res.status(400).json({ 
        error: 'Faltan campos requeridos',
        required: ['title', 'description', 'code', 'price', 'stock', 'category']
      })
    }

    const newProduct = await productManager.create({
      title,
      description,
      code,
      price,
      status,
      stock,
      category,
      thumbnails
    })

    res.status(201).json(newProduct)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// PUT /:pid - Actualizar producto
router.put('/:pid', async (req, res) => {
  try {
    const { pid } = req.params
    
    if (!await productManager.getById(pid)) {
      return res.status(404).json({ error: `Producto con ID ${pid} no encontrado` })
    }

    const updated = await productManager.update(pid, req.body)
    res.json(updated)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// DELETE /:pid - Eliminar producto
router.delete('/:pid', async (req, res) => {
  try {
    const { pid } = req.params
    
    if (!await productManager.getById(pid)) {
      return res.status(404).json({ error: `Producto con ID ${pid} no encontrado` })
    }

    await productManager.delete(pid)
    res.json({ message: `Producto ${pid} eliminado correctamente` })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

export default router
