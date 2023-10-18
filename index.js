require("dotenv").config();
const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(process.env.MONGO_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const database = client.db("insertDB");
    const ProductCollection = database.collection("products");
    const CartCollection = database.collection("cart");

    app.get("/allProducts", async (req, res) => {
      const data = ProductCollection.find();
      const result = await data.toArray();
      res.send(result);
    });

    app.get("/product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await ProductCollection.findOne(query);
      res.send(result);
    });

    app.get("/brand/:brand", async (req, res) => {
      const brand = req.params.brand;
      const data = ProductCollection.find({ brand: brand });
      const result = await data.toArray();
      res.send(result);
    });

    app.post("/addProduct", async (req, res) => {
      const product = req.body;
      const result = await ProductCollection.insertOne(product);
      res.send(result);
    });

    app.put("/update/:id", async (req, res) => {
      const id = req.params.id;
      const updatedProduct = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          image: updatedProduct.image,
          name: updatedProduct.name,
          brand: updatedProduct.brand,
          type: updatedProduct.type,
          price: updatedProduct.price,
          description: updatedProduct.description,
          rating: updatedProduct.rating,
        },
      };
      const result = await ProductCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });

    app.get("/cart/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const cursor = CartCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/cart", async (req, res) => {
      const user = req.body;
      const result = await CartCollection.insertOne(user);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Server is running on post ${port}`);
});
