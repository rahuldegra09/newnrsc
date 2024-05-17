const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const mongoose = require('mongoose');
const app = express();
const PORT =process.env.PORT || 3001;
app.use(cors());
app.use(express.json());
// MongoDB Connection URI
const uri = "mongodb://rahuldegra09:Rd%40975892@ac-isfkosi-shard-00-00.gvejzfp.mongodb.net:27017,ac-isfkosi-shard-00-01.gvejzfp.mongodb.net:27017,ac-isfkosi-shard-00-02.gvejzfp.mongodb.net:27017/?ssl=true&replicaSet=atlas-26h9gk-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0";

// Create a new MongoClient
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Connect to the MongoDB cluster
client.connect()
    .then(() => {
        console.log("Connected to MongoDB");

        // MongoDB database and collection
        const database = client.db("NRSE");
        const collection = database.collection("2mTemp");
        // API endpoint for fetching aggregated temperature data
       

        // API endpoint for fetching data based on coordinates
        app.get('/api/data', async (req, res) => {
            const { lat, lng } = req.query;

            try {
                // Coordinates to search near
                const longitude = parseFloat(lng);
                const latitude = parseFloat(lat);

                // Maximum distance in meters
                const maxDistanceInMeters = 10000;

                // Execute the MongoDB query
                // Execute the MongoDB query
                const cursor = await collection.aggregate([
                    {
                        $geoNear: {
                            near: {
                                type: "Point",
                                coordinates: [longitude, latitude]
                            },
                            distanceField: "dist.calculated",
                            spherical: true,
                            maxDistance: maxDistanceInMeters,
                            key: "location" // Specify the index to use
                        }
                    },
                    { $limit: 1 } // Limit the result to one document
                ]);


                // Convert cursor to array of documents
                const result = await cursor.toArray();

                // Send the result as JSON response
                res.json(result);
            } catch (error) {
                console.error("Error fetching data from MongoDB:", error);
                res.status(500).json({ error: "Internal server error" });
            }
        });

        // Start the server
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    })
    .catch(error => {
        console.error("Error connecting to MongoDB:", error);
        client.close();
    });
