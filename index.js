const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const cors = require("cors");
app.use(express.json());
const port = process.env.PORT || 5000;
app.use(cors());
app.get("/", (req, res) => {
  res.send("Crud server practice");
});

// ----------------------------------------------------------------

const uri =
  "mongodb+srv://<username>:<password>@cluster0.d0cidbu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
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
    const postCollection = client.db("usersDB").collection("posts");

    app.get("/posts", async (req, res) => {
      const posts = await postCollection.find().toArray();
      res.send(posts);
    });
    app.get("/posts/:id", async (req, res) => {
      const id = req.params.id;
      const post = await postCollection.findOne({ _id: new ObjectId(id) });
      res.send(post);
    });

    app.post("/posts", async (req, res) => {
      const post = req.body;
      const result = await postCollection.insertOne(post);
      console.log("new post:", post);
      res.send(result);
    });
    app.put("/posts/:id", async (req, res) => {
      const id = req.params.id;
      const post = req.body;
      const options = { upsert: true };
      const updatedPost = {
        $set: {
          title: post.title,
          image: post.image,
          description: post.description,
        },
      };
      const result = await postCollection.updateOne(
        {
          _id: new ObjectId(id),
        },
        updatedPost,
        options
      );
      res.send(result);
    });
    app.delete("/posts/:id", async (req, res) => {
      const id = req.params.id;
      console.log("this id will be deleted", id);
      const query = { _id: new ObjectId(id) };
      const result = await postCollection.deleteOne(query);
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

// ----------------------------------------------------------------

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
