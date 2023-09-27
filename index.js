const functions = require('firebase-functions')
const admin = require('firebase-admin')
const bcrypt = require("bcryptjs")
const crypto = require('crypto')
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
app.use(cors({origin: true}))
let hashedPassword = "";
class User {
    constructor (id, name, email , password , token ) {
        this.id = id;
        this.email = email;
        this.name = name;
        this.password = password;
        this.token = token;
    }
}


//gategory

//create category
app.post('/api/createCategory', (req, res) => {
    (async () => {
        try {
            await db.collection('categories').doc('/' + req.body.id + '/')
                .create({
                    id:req.body.id,
                    name: req.body.name,
                    stock: req.body.stock,
                    thumbnail: req.body.thumbnail
                })
            return res.status(200).send("Added");
        } catch (e) {
            console.log(e)
            return res.status(500).send(e)
        }
    })();
})
app.get('/api/categories', (req, res) => {
    (async () => {
        try {
            let query = db.collection('categories');
            let responce = [];

            await query.get().then(value => {
                let docs = value.docs;
                for (let doc of docs) {
                    const selectedItem = {
                        id:doc.data().id,
                        name: doc.data().name,
                        stock: doc.data().stock,
                        thumbnail:doc.data().thumbnail
                    };
                    responce.push(selectedItem);
                }
                return responce
            })
            return res.status(200).send(responce);
        } catch (e) {
            console.log(e)
            return res.status(500).send(e)
        }
    })();
})

//routes
app.get('/hello-world', (req, res) => {

    bcrypt.genSalt(10, function (err, Salt) {

        // The bcrypt is used for encrypting password.
        /*bcrypt.hash("123456", Salt, function (err, hash) {

            if (err) {
                return console.log('Cannot encrypt');
            }

            hashedPassword = hash;
            console.log(hash);
        })
    })*/

        /*bcrypt.compare("123456", "$2a$10$Qm.gXtx/K2JvNjzV2P4s7eAHci99Au8L6DLCOtJt334ElwP6EdpUy",
            async function (err, isMatch) {

                // Comparing the original password to
                // encrypted password
                if (isMatch) {
                    console.log("match")
                }

                if (!isMatch) {

                    // If password doesn't match the following
                    // message will be sent
                    console.log("not match")

                }
            })*/
    })
    return res.status(200).send(hashedPassword);
})

//create
app.post('/api/create', (req, res) => {
    (async () => {
        try {
            await db.collection('products').doc('/' + req.body.id + '/')
                .create({
                    id:req.body.id,
                    name: req.body.name,
                    description: req.body.description,
                    price: req.body.price,
                    discount:req.body.discount,
                    rate: req.body.rate,
                    category: req.body.category,
                    view: req.body.view,
                    thumbnail: req.body.thumbnail,
                    images: req.body.images,
                    reviewCount: req.body.reviewCount,
                    stock: req.body.stock,
                })
            return res.status(200).send();
        } catch (e) {
            console.log(e)
            return res.status(500).send(e)
        }
    })();
})

//read
app.get('/api/read/:id', (req, res) => {
    (async () => {
        try {
            const document = db.collection('products').doc(req.params.id);
            let product = await document.get();
            let response = product.data();
            console.log(response);
            return res.status(200).send(response);
        } catch (e) {
            console.log(e)
            return res.status(500).send(e)
        }
    })();
})

app.get('/api/read/', (req, res) => {
    (async () => {
        try {
            let query = db.collection('products');
            let responce = [];

            await query.get().then(value => {
                let docs = value.docs;
                for (let doc of docs) {
                    const selectedItem = {
                        id:doc.id,
                        name: doc.data().name,
                        description: doc.data().description,
                        price: doc.data().price,
                        discount:doc.data().discount,
                        rate: doc.data().rate,
                        category: doc.data().category,
                        view: doc.data().view,
                        thumbnail: doc.data().thumbnail,
                        images: doc.data().images,
                        reviewCount: doc.data().reviewCount,
                        stock: doc.data().stock,
                    };
                    responce.push(selectedItem);
                }
                return responce
            })
            return res.status(200).send(responce);
        } catch (e) {
            console.log(e)
            return res.status(500).send(e)
        }
    })();
})

app.get('/api/getProduct?:q', (req, res) => {
    (async () => {
        try {
            let query = db.collection('products');
            let responce = [];
            let q = req.query.q;

            await query.get().then(value => {
                let docs = value.docs;
                for (let doc of docs) {
                    if (doc.data().name.toString().includes(q)) {
                        const selectedItem = {
                            id:doc.data().id,
                            name: doc.data().name,
                            description: doc.data().description,
                            price: doc.data().price,
                            discount:doc.data().discount,
                            rate: doc.data().rate,
                            category: doc.data().category,
                            view: doc.data().view,
                            thumbnail: doc.data().thumbnail,
                            images: doc.data().images,
                            reviewCount: doc.data().reviewCount,
                            stock: doc.data().stock,
                        };
                        responce.push(selectedItem);
                    }
                }
                return responce
            })
            return res.status(200).send(responce);
        } catch (e) {
            console.log(e)
            return res.status(500).send(e)
        }
    })();
})

//update


//delete

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//user

//create user
app.post('/api/createUser', (req, res) => {
    (async () => {
        try {
             bcrypt.genSalt(10, function (err, Salt) {
                bcrypt.hash(req.body.password, Salt, async function (err, hash) {
                    if (err) {
                        console.log(err);
                        return console.log('Cannot encrypt');
                    }
                    const token = crypto.randomBytes(64).toString('hex');
                    await db.collection('User').doc('/' + req.body.id + '/')
                        .create({
                            id: req.body.id,
                            name: req.body.name,
                            email: req.body.email,
                            password: hash,
                            token: token,


                        })
                    return res.status(200).send("User added");
                })
            })

        } catch (e) {
            console.log(e)
            return res.status(500).send(e)
        }
    })();
})

app.get('/api/allUser/', (req, res) => {
    (async () => {
        try {
            let query = db.collection('User');
            let responce = [];

            await query.get().then(value => {
                let docs = value.docs;
                for (let doc of docs) {
                    const selectedItem = {
                        id: doc.data().id,
                        name: doc.data().name,
                        email: doc.data().email,
                        token:doc.data().token,
                    };
                    responce.push(selectedItem);
                }
                return responce
            })
            return res.status(200).send(responce);
        } catch (e) {
            console.log(e)
            return res.status(500).send(e)
        }
    })();
})

app.get('/api/login?:id', (req, res) => {
    (async () => {
        try {
            const document = db.collection('User').doc(req.params.id);
            let user = await document.get();
            let response = user.data();
            console.log(response);
            return res.status(200).send(response);
        } catch (e) {
            console.log(e)
            return res.status(500).send(e)
        }
    })();
    return res.status(401).json({
        message: "Login not successful",
        error: "User not found",
    })
})

app.get('/api/user/:id', (req, res) => {
    (async () => {
        try {
            const document = db.collection('User').doc(req.params.id);
            let user = await document.get();
            let response = user.data();
            console.log(response);
            return res.status(200).send(response);
        } catch (e) {
            console.log(e)
            return res.status(500).send(e)
        }
    })();
})
app.get('/api/userToken?:token', (req, res) => {
    (async () => {
        try {
            let query = db.collection('User');
            let responce = [];
            let q = req.query.token;

            await query.get().then(value => {
                let docs = value.docs;
                for (let doc of docs) {
                    console.log(doc.data())
                    if (doc.data().token!=null && doc.data().token.toString().includes(q)) {
                        const selectedItem = {
                            id: doc.data().id,
                            name: doc.data().name,
                            email: doc.data().email,
                            token:doc.data().token,
                        };
                        responce.push(selectedItem);
                    }
                }
                return responce
            })
            return res.status(200).send(responce);
        } catch (e) {
            console.log(e)
            return res.status(500).send(e)
        }
    })();
})

//update
app.put('/api/update/:id', (req, res) => {
    (async () => {
        try {
            const document = db.collection('User').doc(req.params.id);
            let userFireStore = await document.get();
            let response = userFireStore.data();
            let name = response.name;
            if (req.body.name!==null){
                name = req.body.name;
            }

            let email = response.email;
            if (req.body.email!==null){
                email = req.body.email;
            }
            const  user = new User(response.id ,name ,email,response.password,response.token  )
            await document.update({
               user
            })
            return res.status(200).send("User Updated");
        } catch (e) {
            console.log(e)
            return res.status(500).send(e)
        }
    })();
})


exports.app = functions.https.onRequest(app);

