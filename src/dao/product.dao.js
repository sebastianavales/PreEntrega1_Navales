import ProductModel from "../models/product.model.js";

export default class ProductDAO {
  async getAll(filter, options) {
    return ProductModel.find(filter)
      .sort(options.sort)
      .skip(options.skip)
      .limit(options.limit);
  }

  count(filter) {
    return ProductModel.countDocuments(filter);
  }

  getById(id) {
    return ProductModel.findById(id);
  }

  create(data) {
    return ProductModel.create(data);
  }

  update(id, data) {
    return ProductModel.findByIdAndUpdate(id, data, { new: true });
  }

  delete(id) {
    return ProductModel.findByIdAndDelete(id);
  }
}