const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000;
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);


app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://final_admin:P3UxAGvoIKoGk78a@cluster0.lr5az.mongodb.net/?retryWrites=true&w=majority`;


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });




function verifyJwt(req, res, next) {
    const authHeader = req.haeders?.authorization
    if (!authHeader) {
        return res.status(401).send({ message: 'Unauthorized access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden Access' })
        }
        req.decoded = decoded;
        next()
    })
}






async function run() {

    try {
        await client.connect();
        const toolsCollection = client.db('final_project').collection('tools');
        const ordersCollection = client.db('final_project').collection('orders');
        const usersCollection = client.db('final_project').collection('users');


        app.get('/tools', async (req, res) => {
            const query = {};
            const cursor = toolsCollection.find(query);
            const tools = await cursor.toArray();
            res.send(tools);
        });


        app.post('/tools', async (req, res) => {
            const newTool = req.body;
            const result = await toolsCollection.insertOne(newTool);
            res.send(result)
        })


        app.post('/create-payment-intent', async (req, res) => {
            const tools = req.body;
            const price = tools.price;
            const amount = price * 100;
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount,
                currency: 'usd',
                payment_method_types: ['card']
            });
            res.send({ clientSecret: paymentIntent.client_secret })
        });



        app.get('/users', async (req, res) => {
            const users = await usersCollection.find().toArray()
            res.send(users);
        });


        app.put('/user/admin/:email', async (req, res) => {
            const email = req.params.email;
            const filter = { email: email };
            const updateDoc = {
                $set: { role: 'admin' },
            };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.send(result)
        })


        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: user,
            };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '8h' })
            res.send({ result, token })
        })




        app.get('/tools/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const tools = await toolsCollection.findOne(query);
            res.send(tools);
        });

        /* app.get('/available', async (req, res) => {
            const date = req.query.date || '2022-5-26'
            const tools = await toolsCollection.find().toArray();
            const query = { date: date };
            const orders = await ordersCollection.find(query).toArray();
            orders.forEach(tool => {
                const toolsOrder = orders.filter(order => order.quantity === tool.quantity)
            })
            res.send(orders);
        }) */

        app.get('/order', async (req, res) => {
            const toolBuyer = req.query.toolBuyer;
            const query = { toolBuyer: toolBuyer };
            const orders = await ordersCollection.find(query).toArray();
            res.send(orders);
        })


        app.get('/order/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const orders = await ordersCollection.findOne(query);
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


        app.delete('/order/:toolId', async (req, res) => {
            const toolId = req.params.toolId;
            const query = { toolId: toolId }
            const result = await ordersCollection.deleteOne(query);
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