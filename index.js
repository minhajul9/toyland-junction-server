const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

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
     client.connect();

    //db
    const toysCollection = client.db('toyCarsDB').collection('toys');

    // show on all toys page 
    app.get('/getAllToys', async(req, res) => {
        // console.log(req.query);
        if(req.query.limit){
            const result = await toysCollection.find().limit(20).toArray();
            return res.send(result)
        }
        const result = await toysCollection.find().toArray();
        res.send(result)
    })

    //add item to db
    app.post('/addToy', async(req, res) => {
        const toy = req.body;
        console.log(toy);

        const result = await toysCollection.insertOne(toy);
        res.send(result)
    })


    // search item
    app.get('/search', async(req, res) => {
        const search = req.query.search;
        // console.log(search);
        const query = { name: { $regex: search, $options: 'i'}}
        const result = await toysCollection.find(query).toArray();
        res.send(result)
    })

    // find by id 
    app.get('/toy/:id', async(req, res) => {
        const id = req.params.id;
        console.log(id);
        const query = { _id : new ObjectId(id)};
        const result = await toysCollection.findOne(query);
        res.send(result)
    })


    // find by email 
    app.get('/myToys/:email', async(req, res) => {
        const email = req.params.email;
        console.log(email);
        const query = { seller_email : email};
        const result = await toysCollection.find(query).toArray();
        res.send(result)
    })

    // delete operation
    app.delete('/toy/:id', async(req, res) => {
        const id = req.params.id;
        // console.log(id);
        const query = { _id: new ObjectId(id)}
        const result = await toysCollection.deleteOne(query)
        res.send(result)
    })

    //update toy
    app.patch('/toy/:id', async(req, res) =>{
        const id = req.params.id;
        const updatedToy = req.body;
        // console.log(id, updates);
        const updateDoc = { $set: {
            price: updatedToy.price,
            available_quantity: updatedToy.available_quantity,
            description: updatedToy.description
        }}

        const filter = {_id: new ObjectId(id)};
        const result = await toysCollection.updateOne(filter, updateDoc);
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