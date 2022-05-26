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

        // app.get('/available', async (req, res) => {
        //     const date = req.query.date || '2022-5-26'
        //     const tools = await toolsCollection.find().toArray();
        //     const query = { date: date };
        //     const orders = await ordersCollection.find(query).toArray();
        //     orders.forEach(tool => {
        //         const toolsOrder = orders.filter(order => order.quantity === tool.quantity)
        //     })
        //     res.send(orders);
        // })

        app.get('/order', async (req, res) => {
            const toolBuyer = req.query.toolBuyer;
            const query = { toolBuyer: toolBuyer };
            const orders = await ordersCollection.find(query).toArray();
            res.send(orders);
        })



        app.post('/order', async (req, res) => {
            const order = req.body;
            const query = { toolName: order.toolName, buyerName: order.buyerName, date: order.date }
            const exists = await ordersCollection.findOne(query);
            if (exists) {
                return res.send({ success: false, order: exists })
            }
            const result = await ordersCollection.insertOne(order);
            return res.send({ success: true, result });
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