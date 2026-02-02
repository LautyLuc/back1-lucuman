import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PRODUCTS_FILE = path.join(__dirname, '../data/products.json')

export class ProductManager {
  async getAll() {
    try {
      const data = await fs.readFile(PRODUCTS_FILE, 'utf-8')
      const json = JSON.parse(data)
      return json.products || []
    } catch (error) {
      return []
    }
  }

  async getById(id) {
    const products = await this.getAll()
    return products.find(p => p.id === Number(id)) || null
  }

  async create(productData) {
    const products = await this.getAll()
    
    // Validar campos requeridos
    const required = ['title', 'description', 'code', 'price', 'stock', 'category']
    for (const field of required) {
      if (!productData[field]) {
        throw new Error(`Campo requerido faltante: ${field}`)
      }
    }

    // Validar que el code no se repita
    if (products.some(p => p.code === productData.code)) {
      throw new Error(`El código ${productData.code} ya existe`)
    }

    // Generar ID automático
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1

    const newProduct = {
      id: newId,
      title: productData.title,
      description: productData.description,
      code: productData.code,
      price: Number(productData.price),
      status: productData.status !== false,
      stock: Number(productData.stock),
      category: productData.category,
      thumbnails: Array.isArray(productData.thumbnails) ? productData.thumbnails : []
    }

    products.push(newProduct)
    await this._save(products)
    return newProduct
  }

  async update(id, updateData) {
    const products = await this.getAll()
    const index = products.findIndex(p => p.id === Number(id))

    if (index === -1) {
      throw new Error(`Producto con ID ${id} no encontrado`)
    }

    const product = products[index]

    // No permitir actualizar el ID
    if (updateData.id) {
      throw new Error('No se puede actualizar el ID del producto')
    }

    // No permitir cambiar el code a uno que ya existe
    if (updateData.code && updateData.code !== product.code) {
      if (products.some(p => p.code === updateData.code && p.id !== product.id)) {
        throw new Error(`El código ${updateData.code} ya existe`)
      }
    }

    // Actualizar solo los campos proporcionados
    const updated = {
      ...product,
      ...(updateData.title && { title: updateData.title }),
      ...(updateData.description && { description: updateData.description }),
      ...(updateData.code && { code: updateData.code }),
      ...(updateData.price && { price: Number(updateData.price) }),
      ...(updateData.status !== undefined && { status: updateData.status }),
      ...(updateData.stock !== undefined && { stock: Number(updateData.stock) }),
      ...(updateData.category && { category: updateData.category }),
      ...(Array.isArray(updateData.thumbnails) && { thumbnails: updateData.thumbnails })
    }

    products[index] = updated
    await this._save(products)
    return updated
  }

  async delete(id) {
    const products = await this.getAll()
    const filtered = products.filter(p => p.id !== Number(id))

    if (filtered.length === products.length) {
      throw new Error(`Producto con ID ${id} no encontrado`)
    }

    await this._save(filtered)
    return true
  }

  async _save(products) {
    const data = { products }
    await fs.writeFile(PRODUCTS_FILE, JSON.stringify(data, null, 2), 'utf-8')
  }
}
