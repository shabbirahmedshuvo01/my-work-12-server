const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lr5az.mongodb.net/?retryWrites=true&w=majority`;


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {

    try {
        await client.connect();
        const toolsCollection = client.db('final_project').collection('tools');
        const ordersCollection = client.db('final_project').collection('orders');


        app.get('/tools', async (req, res) => {
            const query = {};
            const cursor = toolsCollection.find(query);
            const tools = await cursor.toArray();
            res.send(tools);
        });

        app.get('/tools/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const tools = await toolsCollection.findOne(query);
            res.send(tools);
        });

        app.post('/order', async (req, res) => {
            const order = req.body;
            const query = { tools: order.toolName }
            const result = await ordersCollection.insertOne(order);
            res.send(result);
        })

    }
    finally {

    }


}



run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello from final project and here')
})

app.listen(port, () => {
    console.log(`Final project app listening on port ${port}`)
})