const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors())
app.use(express.json())

// mongodb

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster1.yhec9tq.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    //db
    const toysCollection = client.db('toyCarsDB').collection('toys');

    app.post('/getAllToys', async(req, res) => {
        if(req.query.limit){
            const result = await toysCollection.find().limit(20).toArray();
            return res.send(result)
        }
        const result = await toysCollection.find().toArray();
        res.send(result)
    })

    // find by category
    app.post('/category', async(req, res) => {
        const category = req.body.category;
        // console.log('from category',category);
        const query = { sub_category: category};
        const result = await toysCollection.find(query).toArray();
        res.send(result)
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Toyland Junction Server is running')
})

app.listen(port, () => {
    console.log("Toyland Junction running on port: ", port);
})