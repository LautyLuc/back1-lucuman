import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CARTS_FILE = path.join(__dirname, '../data/carts.json')

export class CartManager {
  async getAll() {
    try {
      const data = await fs.readFile(CARTS_FILE, 'utf-8')
      const json = JSON.parse(data)
      return json.carts || []
    } catch (error) {
      return []
    }
  }

  async getById(cid) {
    const carts = await this.getAll()
    return carts.find(c => c.id === Number(cid)) || null
  }

  async create() {
    const carts = await this.getAll()
    
    // Generar ID automático
    const newId = carts.length > 0 ? Math.max(...carts.map(c => c.id)) + 1 : 1

    const newCart = {
      id: newId,
      products: []
    }

    carts.push(newCart)
    await this._save(carts)
    return newCart
  }

  async addProduct(cid, pid, quantity = 1) {
    const carts = await this.getAll()
    const cartIndex = carts.findIndex(c => c.id === Number(cid))

    if (cartIndex === -1) {
      throw new Error(`Carrito con ID ${cid} no encontrado`)
    }

    const cart = carts[cartIndex]
    const productIndex = cart.products.findIndex(p => p.product === Number(pid))

    if (productIndex !== -1) {
      // Producto ya existe, incrementar quantity
      cart.products[productIndex].quantity += Number(quantity)
    } else {
      // Agregar nuevo producto
      cart.products.push({
        product: Number(pid),
        quantity: Number(quantity)
      })
    }

    carts[cartIndex] = cart
    await this._save(carts)
    return cart
  }

  async removeProduct(cid, pid) {
    const carts = await this.getAll()
    const cartIndex = carts.findIndex(c => c.id === Number(cid))

    if (cartIndex === -1) {
      throw new Error(`Carrito con ID ${cid} no encontrado`)
    }

    const cart = carts[cartIndex]
    const filtered = cart.products.filter(p => p.product !== Number(pid))

    if (filtered.length === cart.products.length) {
      throw new Error(`Producto ${pid} no encontrado en el carrito`)
    }

    cart.products = filtered
    carts[cartIndex] = cart
    await this._save(carts)
    return cart
  }

  async updateProductQuantity(cid, pid, quantity) {
    const carts = await this.getAll()
    const cartIndex = carts.findIndex(c => c.id === Number(cid))

    if (cartIndex === -1) {
      throw new Error(`Carrito con ID ${cid} no encontrado`)
    }

    const cart = carts[cartIndex]
    const productIndex = cart.products.findIndex(p => p.product === Number(pid))

    if (productIndex === -1) {
      throw new Error(`Producto ${pid} no encontrado en el carrito`)
    }

    const newQty = Number(quantity)
    if (newQty <= 0) {
      cart.products.splice(productIndex, 1)
    } else {
      cart.products[productIndex].quantity = newQty
    }

    carts[cartIndex] = cart
    await this._save(carts)
    return cart
  }

  async clear(cid) {
    const carts = await this.getAll()
    const cartIndex = carts.findIndex(c => c.id === Number(cid))

    if (cartIndex === -1) {
      throw new Error(`Carrito con ID ${cid} no encontrado`)
    }

    carts[cartIndex].products = []
    await this._save(carts)
    return carts[cartIndex]
  }

  async _save(carts) {
    const data = { carts }
    await fs.writeFile(CARTS_FILE, JSON.stringify(data, null, 2), 'utf-8')
  }
}
