// By default jest does not work with the new import syntax
// We should add NODE_OPTIONS=--experimental-vm-modules to the test script in package.json to enable the usage of import syntax
// On Windows you cannot use NODE_OPTIONS (and all env vars) from command line --> YOU HAVE TO USE CROSS-ENV PACKAGE TO BE ABLE TO PASS
// ENV VARS TO COMMAND LINE SCRIPTS ON ALL OPERATIVE SYSTEMS!!!

import supertest from "supertest";
import dotenv from "dotenv";
import mongoose from "mongoose";
import server from "../src/server.js";
import ProductsModel from "../src/api/products/model.js";

dotenv.config(); // This command forces .env vars to be loaded into process.env. This is the way to do it whenever you can't use -r dotenv/config

// supertest is capable of executing server.listen of our Express app if we pass the Express server to it
// It will give us back a client that can be used to run http requests on that server

const client = supertest(server);

/* describe("Test APIs", () => {
  it("Should test that GET /test endpoint returns 200 and a body containing a message", async () => {
    const response = await client.get("/test")
    expect(response.status).toBe(200)
    expect(response.body.message).toEqual("Test successfull")
  })
})
 */

const validProduct = {
  name: "A valid product",
  description: "balllablalblabl",
  price: 100,
};

const notValidProduct = {
  name: "A not valid product",
  price: 100,
};

let ID;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URL_TEST);
  const product = new ProductsModel({
    name: "test",
    description: "blalblabla",
    price: 20,
  });
  const prod = await product.save();
  ID = prod._id;
});
// beforeAll is a Jest hook ran before all the tests, usually it is used to connect to the db and to do some initial setup (like inserting some mock data in the db)

// afterAll hook could be used to clean up the situation (close the connection to Mongo gently and clean up db/collections)

afterAll(async () => {
  await ProductsModel.deleteMany();
  await mongoose.connection.close();
});

describe("Test APIs", () => {
  it("Should test that the env vars are set correctly", () => {
    expect(process.env.MONGO_URL_TEST).toBeDefined();
  });

  it("Should test that POST /products returns a valid _id and 201", async () => {
    const response = await client
      .post("/products")
      .send(validProduct)
      .expect(201);
    expect(response.body._id).toBeDefined();
  });

  it("Should test that GET /products returns a success status and a body", async () => {
    const response = await client.get("/products").expect(200);
    expect(response.body).toBeDefined();
  });

  it("Should test that POST /products with a not valid product returns a 400", async () => {
    await client.post("/products").send(notValidProduct).expect(400);
  });

  it("Should test that GET /products/:id with a non-existing id to return a 404 error", async () => {
    await client.get("/products/123456123456123456123456").expect(404);
  });

  it("Should test that GET /products/:id with an EXISTING ID returns product with matching _id", async () => {
    const response = await client.get(`/products/${ID}`).expect(200);
    expect(response.body._id).toEqual(ID.toString());
  });

  it("Should test that PUT requests are accepted, that the body has changed", async () => {
    const originalResp = await client.get(`/products/${ID}`);
    const response = await client
      .put(`/products/${ID}`)
      .send({ name: "Changed Name" })
      .expect(200);
    expect(response.body.name !== originalResp.body.name);
    expect(typeof response.body.name).toBe("string");
  });

  //test if request has authorization headers

  //test if authorization headers are valid

  //test if user is authorized to access endpoint

  it("Should test that DELETEing /products/:id returns a 204 on success", async () => {
    await client.delete(`/products/${ID}`).expect(204);
  });

  it("Should test that DELETEing /products/:id returns a 404 when an invalid ID is used", async () => {
    await client.delete("/products/123456123456123456123456").expect(404);
  });
});
