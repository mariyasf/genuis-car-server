const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

// MiddleWare
app.use(cors());
app.use(express.json());

require('dotenv').config()

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dfacken.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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

        const serviceCollection = client.db('carDoctor').collection('services');
        const bookingCollection = client.db('carDoctor').collection('bookings');

        app.get('/services', async (req, res) => {
            const cursor = serviceCollection.find();
            const reasult = await cursor.toArray();
            res.send(reasult)
        })

        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const option = {
                projection: {
                    title: 1,
                    price: 1,
                    service_id: 1,
                    img: 1
                }

            }
            const reasult = await serviceCollection.findOne(query, option);
            res.send(reasult)
        })

        // Bookings
        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            console.log(booking);

            const reasult = await bookingCollection.insertOne(booking);
            res.send(reasult)
        });

        app.get('/bookings', async (req, res) => {
            let query = {};
            if (req.query?.email) {
                query: { email: req.query.email }
            }
            const cursor = bookingCollection.find();
            const reasult = await cursor.toArray();
            res.send(reasult)
        });
        app.patch('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const updatedBooking = req.body;
            console.log(updatedBooking);

            const filter = { _id: new ObjectId(id) }

            const updateDoc = {
                $set: {
                    status: updatedBooking.status
                }
            }
            const reasult = await bookingCollection.updateOne(filter, updateDoc);
            res.send(reasult)
        });

        app.delete('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const reasult = await bookingCollection.deleteOne(query);
            res.send(reasult)
        });




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
    res.send('car doctor running')
})

app.listen(port, () => {
    console.log(`car doctor running on port: ${port}`);
})