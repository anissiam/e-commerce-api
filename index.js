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
//const bodyParser = require("body-parser");
//app.use(express.bodyParser());
//app.use(bodyParser.json())
app.use(express.json());
const {error, log} = require("firebase-functions/logger");
app.use(cors({origin: true , credentials:true,
    optionSuccessStatus:200}))
const port = 3000;
let hashedPassword = "";




//Category

//create category
app.post('/api/createCategory', (req, res) => {
    (async () => {
        try {
            await db.collection('categories').doc('/' + req.body.id + '/')
                .create({
                    id: req.body.id,
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
                        id: doc.data().id,
                        name: doc.data().name,
                        stock: doc.data().stock,
                        thumbnail: doc.data().thumbnail
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
app.get('/test', (req, res) => {
    return res.status(200).send("API Connected");
})

//create
app.post('/api/product/add', (req, res) => {
    (async () => {
        try {
            await db.collection('products').doc('/' + req.body.id + '/')
                .create({
                    id: req.body.id,
                    name: req.body.name,
                    description: req.body.description,
                    price: req.body.price,
                    discount: req.body.discount,
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
app.get('/api/products/:id', (req, res) => {
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


app.get('/api/products/', (req, res) => {
    (async () => {
        try {
            let query = db.collection('products');
            let responce = [];

            await query.get().then(value => {
                let docs = value.docs;
                for (let doc of docs) {
                    const selectedItem = {
                        id: doc.id,
                        name: doc.data().name,
                        description: doc.data().description,
                        price: doc.data().price,
                        discount: doc.data().discount,
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

app.get('/api/product?:name', (req, res) => {
    (async () => {
        try {
            let query = db.collection('products');
            let responce = [];
            let q = req.query.name;

            await query.get().then(value => {
                let docs = value.docs;
                for (let doc of docs) {
                    if (doc.data().name.toString().includes(q)) {
                        const selectedItem = {
                            id: doc.data().id,
                            name: doc.data().name,
                            description: doc.data().description,
                            price: doc.data().price,
                            discount: doc.data().discount,
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
app.post('/api/register', (req, res) => {
    (async () => {
        try {
            const validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
            if (!req.body.email.toString().match(validRegex)){
                return res.status(422).json({
                    message: "Signup not successful",
                    error: "Invalid email address",
                })
            }else if(req.body.password.toString().length<6){
                return res.status(422).json({
                    message: "Signup not successful",
                    error: "Password must be more than 6 digit",
                })
            } else {
                db.collection('User').where("email", "==", req.body.email)
                    .get()
                    .then(value => {
                        if (!value.empty){
                            return res.status(409).json({
                                message: "Signup not successful",
                                error: "Email already used",
                            })
                        }else {
                            bcrypt.genSalt(10, function (err, Salt) {
                                bcrypt.hash(req.body.password, Salt, async function (err, hash) {
                                    if (err) {
                                        console.log(err);
                                        return console.log('Cannot encrypt');
                                    }
                                    const token = crypto.randomBytes(64).toString('hex');
                                    const doc=  db.collection('User').doc();
                                    await doc.create({
                                        id: doc.id,
                                        name: req.body.name,
                                        email: req.body.email,
                                        password: hash,
                                        token: token,
                                    })
                                    return res.status(200).send("User added");
                                })
                            })
                        }
                    })
            }


        } catch (e) {
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
                        token: doc.data().token,
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
app.delete('/api/user/delete/:id', (req, res) => {
    (async () => {
        try {
            const id = req.params.id;
             await db.collection('User').doc(id)
                 .delete();
             return res.status(200).json({
                message: "User deleted."
            })
        } catch (e) {
            return  res.status(500).send(e)
        }
    })();
})



app.post('/api/login', (req, res) => {
    (async () => {
        try {
            const { email, password } = req.body;
            db.collection('User').where("email", "==", email)
                .get().then(value => {
                if (value.empty) {
                    return res.status(401).json({
                        message: "Login not successful",
                        error: "User not found",
                    })
                } else {

                    value.docs.map((doc) => {
                        if (doc.data().email != null && doc.data().email.toString().includes(email)) {
                            const user = {
                                id: doc.data().id,
                                name: doc.data().name,
                                email: doc.data().email,
                                token: doc.data().token,
                            };
                            bcrypt.compare(password.toString(), doc.data().password,
                                async function (err, isMatch) {
                                    if (isMatch) {
                                        return  res.status(200).json({
                                            message: "Login successful",
                                            user,
                                        })
                                    }else {
                                        return  res.status(400).json({
                                            message: "Email or Password not correct",
                                        })
                                    }
                                })
                        }
                    })
                }
            });

        } catch (e) {
            console.log(e)
            return res.status(500).send(e)
        }
    })();
})

/*app.get('/api/login', (req, res) => {
    (async () => {
        try {
            let email = req.query.email;
            let password = req.query.password;
            db.collection('User').where("email", "==", email)
                .get().then(value => {
                if (value.empty) {

                    return res.status(401).json({
                        message: "Login not successful",
                        error: "User not found",
                    })
                } else {
                    value.docs.map((doc) => {
                        if (doc.data().email != null && doc.data().email.toString().includes(email)) {
                            const user = {
                                id: doc.data().id,
                                name: doc.data().name,
                                email: doc.data().email,
                                token: doc.data().token,
                            };
                            bcrypt.compare(password.toString(), doc.data().password,
                                async function (err, isMatch) {
                                    if (isMatch) {
                                        return  res.status(200).json({
                                            message: "Login successful",
                                            user,
                                        })
                                    }else {
                                       return  res.status(400).json({
                                            message: "Email or Password not correct",
                                        })
                                    }
                                })
                        }
                    })
                }
            });
        } catch (e) {
            console.log(e)
            return res.status(500).send(e)
        }
    })();
})*/


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
app.get('/api/user?:token', (req, res) => {
    (async () => {
        try {
            let query = db.collection('User');
            let responce = [];
            let q = req.query.token;

            await query.get().then(value => {
                let docs = value.docs;
                for (let doc of docs) {
                    console.log(doc.data())
                    if (doc.data().token != null && doc.data().token.toString().includes(q)) {
                        const selectedItem = {
                            id: doc.data().id,
                            name: doc.data().name,
                            email: doc.data().email,
                            token: doc.data().token,
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
            if (req.body.name !== null) {
                name = req.body.name;
            }

            let email = response.email;
            if (req.body.email !== null) {
                email = req.body.email;
            }
            /*const user = new User(response.id, name, email, response.password, response.token)
            await document.update({
                user
            })*/
            return res.status(200).send("User Updated");
        } catch (e) {
            console.log(e)
            return res.status(500).send(e)
        }
    })();
})

app.listen(port , () => {
    console.log("Port is " + port);
})
exports.app = functions.https.onRequest(app);

