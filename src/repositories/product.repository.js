import ProductDAO from "../dao/product.dao.js";

export default class ProductRepository {
  constructor() {
    this.dao = new ProductDAO();
  }

  getProducts(filter, options) {
    return this.dao.getAll(filter, options);
  }

  countProducts(filter) {
    return this.dao.count(filter);
  }

  getProductById(id) {
    return this.dao.getById(id);
  }

  createProduct(data) {
    return this.dao.create(data);
  }

  updateProduct(id, data) {
    return this.dao.update(id, data);
  }

  deleteProduct(id) {
    return this.dao.delete(id);
  }
}