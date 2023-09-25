const functions = require('firebase-functions')
const admin = require('firebase-admin')

var serviceAccount = require("./permissions.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://ecommerce-47c0d-default-rtdb.firebaseio.com"
});


const express = require('express')
const db = admin.firestore();
const app = express();
const cors = require('cors')
const {error} = require("firebase-functions/logger");
app.use(cors({origin :true}))
//routes
app.get('/hello-world' , (req, res) => {
    return res.status(200).send("hello world");
})

//create
app.post('/api/create' , (req, res) => {
    (async ()=>{
        try {
            await db.collection('products').doc('/' +req.body.id +'/')
                .create({
                    name:req.body.name,
                    description:req.body.description,
                    price:req.body.price,
                })
            return res.status(200).send();
        }catch (e) {
            console.log(e)
            return res.status(500).send(e)
        }
    })();
})

//read
app.get('/api/read/:id' , (req, res) => {
    (async ()=>{
        try {
           const document =db.collection('products').doc(req.params.id);
            let product = await document.get();
            let response = product.data();
            console.log(response);
            return res.status(200).send(response);
        }catch (e) {
            console.log(e)
            return res.status(500).send(e)
        }
    })();
})

app.get('/api/read/' , (req, res) => {
    (async ()=>{
        try {
            let query = db.collection('products');
            let responce = [];

            await query.get().then(value => {
                let docs = value.docs;
                for (let doc of docs){
                    const selectedItem = {
                        id: doc.id,
                        name: doc.data().name,
                        description: doc.data().description,
                        price: doc.data().price,
                    };
                    responce.push(selectedItem);
                }
                return responce
            })
            return res.status(200).send(responce);
        }catch (e) {
            console.log(e)
            return res.status(500).send(e)
        }
    })();
})

app.get('/api/getProduct?:q' , (req, res) => {
    (async ()=>{
        try {
            let query = db.collection('products');
            let responce = [];
            let q = req.query.q;

            await query.get().then(value => {
                let docs = value.docs;
                for (let doc of docs){
                    if (doc.data().name.toString().includes(q)){
                        const selectedItem = {
                            id: doc.id,
                            name: doc.data().name,
                            description: doc.data().description,
                            price: doc.data().price,
                        };
                        responce.push(selectedItem);
                    }
                }
                return responce
            })
            return res.status(200).send(responce);
        }catch (e) {
            console.log(e)
            return res.status(500).send(e)
        }
    })();
})

//update


//delete


exports.app = functions.https.onRequest(app);

