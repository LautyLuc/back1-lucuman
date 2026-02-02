import express from 'express'
import { CartManager } from '../CartManager.js'
import { ProductManager } from '../ProductManager.js'

const router = express.Router()
const cartManager = new CartManager()
const productManager = new ProductManager()

// POST / - Crear nuevo carrito
router.post('/', async (req, res) => {
  try {
    const newCart = await cartManager.create()
    res.status(201).json(newCart)
  } catch (error) {
    res.status(500).json({ error: 'Error al crear carrito', details: error.message })
  }
})

// GET /:cid - Obtener productos del carrito
router.get('/:cid', async (req, res) => {
  try {
    const { cid } = req.params
    const cart = await cartManager.getById(cid)

    if (!cart) {
      return res.status(404).json({ error: `Carrito con ID ${cid} no encontrado` })
    }

    // Enriquecer con datos del producto (opcional, pero útil para el frontend)
    const enrichedProducts = await Promise.all(
      cart.products.map(async (item) => {
        const product = await productManager.getById(item.product)
        return {
          product: item.product,
          quantity: item.quantity,
          ...(product && { productData: product })
        }
      })
    )

    res.json({
      id: cart.id,
      products: enrichedProducts
    })
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener carrito', details: error.message })
  }
})

// POST /:cid/product/:pid - Agregar producto al carrito
router.post('/:cid/product/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params
    const { quantity = 1 } = req.body

    // Validar que el carrito existe
    const cart = await cartManager.getById(cid)
    if (!cart) {
      return res.status(404).json({ error: `Carrito con ID ${cid} no encontrado` })
    }

    // Validar que el producto existe
    const product = await productManager.getById(pid)
    if (!product) {
      return res.status(404).json({ error: `Producto con ID ${pid} no encontrado` })
    }

    // Agregar producto al carrito
    const updatedCart = await cartManager.addProduct(cid, pid, quantity)
    res.json(updatedCart)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// DELETE /:cid/product/:pid - Eliminar producto del carrito
router.delete('/:cid/product/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params

    const cart = await cartManager.getById(cid)
    if (!cart) {
      return res.status(404).json({ error: `Carrito con ID ${cid} no encontrado` })
    }

    const updatedCart = await cartManager.removeProduct(cid, pid)
    res.json(updatedCart)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// PUT /:cid/product/:pid - Actualizar cantidad del producto en carrito
router.put('/:cid/product/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params
    const { quantity } = req.body

    if (quantity === undefined) {
      return res.status(400).json({ error: 'Debe proporcionar la cantidad' })
    }

    const cart = await cartManager.getById(cid)
    if (!cart) {
      return res.status(404).json({ error: `Carrito con ID ${cid} no encontrado` })
    }

    const updatedCart = await cartManager.updateProductQuantity(cid, pid, quantity)
    res.json(updatedCart)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// DELETE /:cid - Vaciar carrito
router.delete('/:cid', async (req, res) => {
  try {
    const { cid } = req.params

    const cart = await cartManager.getById(cid)
    if (!cart) {
      return res.status(404).json({ error: `Carrito con ID ${cid} no encontrado` })
    }

    const clearedCart = await cartManager.clear(cid)
    res.json(clearedCart)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

export default router
