const express = require("express");
const MongoClient = require("mongodb").MongoClient;

const app = express();
const port = 3000;

app.use(express.json());
app.set('port', 3000);
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS, POS, PUT");
    res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");

    next();
});

let db;

MongoClient.connect("mongodb+srv://abdurahman:afk@cluster0.jlckz.mongodb.net/", (err, client) => {
    db = client.db("Webstore");
});

// display a message for root path to show that API is working
app.get('/', (req, res, next) => {
    res.send("Select a collection, e.g., /collection/messages");
});

// get the collection name
app.param("collectionName", (req, res, next, collectionName) => {
    req.collection = db.collection(collectionName);

    return next();
});

// retrieve all the objects from a collection
app.get("/collection/:collectionName", (req, res, next) => {
    req.collection.find({}).toArray((e, results) => {
        if (e) return next(e)
        res.send(results);
    });
});

app.post("/collection/:collectionName", (req, res, next) => {
    req.collection.insert(req.body, (e, results) => {
        if (e) return next(e)
        res.send(results.ops);
    });
});

// Return with object id

const ObjectID = require("mongodb").ObjectId;

app.get("/collection/:collectionName/:id", (req, res, next) => {
    req.collection.findOne({_id: new ObjectID(req.params.id)}, (e, result) => {
        if (e) return next(e);
        res.send(result);
    });
}
);

// Update an object

app.put("/collection/:collectionName/:id", (req, res, next) => {
    req.collection.update(
        {_id: new ObjectID(req.params.id)},
        {$set: req.body},
        {safe: true, multi: false},
        (e, result) => {
            if (e) return next(e)
                res.send((result.result.n === 1) ? {msg: "success"} : {msg: "error"});
        }
    );
});

app.delete("/collection/:collectionName/:id", (req, res, next) => {
    req.collection.deleteOne(
        {_id: ObjectID(req.params.id)}, (e, result) => {
            if (e) return next(e)
                res.send((result.result.n === 1) ? {msg: "success"} : {msg: "error"});
        }
    );
});

app.listen(port, () => {
    console.log("Express.js server running at localhost:3000");
});
