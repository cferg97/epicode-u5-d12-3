import express from "express";
import ProductsModel from "./model.js";

const productsRouter = express.Router();

productsRouter.get("/", async (req, res, next) => {
  try {
    const products = await ProductsModel.find();
    res.send(products);
  } catch (error) {
    next(error);
  }
});

productsRouter.get("/:id", async (req, res, next) => {
  try {
    const product = await ProductsModel.findOne({ _id: req.params.id });
    if (product) {
      res.send(product);
    } else {
      res.status(404).send();
    }
  } catch (err) {
    next(err);
  }
});

productsRouter.post("/", async (req, res, next) => {
  try {
    const newProduct = new ProductsModel(req.body);
    const { _id } = await newProduct.save();
    res.status(201).send({ _id });
  } catch (error) {
    next(error);
  }
});

productsRouter.put("/:id", async (req, res, next) => {
  try {
    const updated = await ProductsModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if(updated){
      res.send(updated)
    }
    else{
      res.status(404).send()
    }
  } catch (err) {
    next(err)
  }
});

productsRouter.delete("/:id", async (req, res, next) => {
  try {
    const deleted = await ProductsModel.findByIdAndDelete(req.params.id);
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).send();
    }
  } catch (err) {
    next(err);
  }
});

export default productsRouter;
