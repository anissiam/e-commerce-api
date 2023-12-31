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
const moment = require("moment/moment");
const {add} = require("nodemon/lib/rules");
app.use(cors({
    origin: true, credentials: true,
    optionSuccessStatus: 200
}))
const port = 3000;
let hashedPassword = "";

app.get('/', (req, res) => {
    res.send("API  ")
});


app.get('/api/home', (req, res) => {
    (async () => {
        try {
            let query = db.collection('home');
            let responce = [];

            await query.get().then(value => {
                let docs = value.docs;
                for (let doc of docs) {
                    responce.push(doc.data());
                }
                return responce[0];
            })
            return res.status(200).send(responce);
        } catch (e) {
            console.log(e)
            return res.status(500).send(e)
        }
    })();
})
app.post('/api/review/add', (req, res) => {
    (async () => {
        try {
            const dateString = moment().format('MMM DD,yyyy');

            const doc = db.collection('reviews').doc();
            await doc.create({
                reviewId: doc.id,
                productId: req.body.productId,
                name: req.body.name,
                rate: req.body.rate,
                text: req.body.text,
                image: req.body.image,
                dateCreated: dateString,
            })
            return res.status(200).send("Added");
        } catch (e) {
            console.log(e)
            return res.status(500).send(e)
        }
    })();
})


app.get('/api/review/:productId', (req, res) => {
    (async () => {
        try {
            const prodId = parseInt(req.params.productId);
            let query = db.collection('reviews').where("productId", "==", prodId);
            let responce = [];

            await query.get().then(value => {
                if (!value.empty) {
                    let docs = value.docs;
                    for (let doc of docs) {
                        const selectedItem = {
                            reviewId: doc.data().reviewId,
                            productId: doc.data().productId,
                            name: doc.data().name,
                            rate: doc.data().rate,
                            text: doc.data().text,
                            image: doc.data().image,
                            dateCreated: doc.data().dateCreated,
                        };
                        responce.push(selectedItem);
                    }
                    return responce
                }
            })
            return res.status(200).send(responce);
        } catch (e) {
            console.log(e)
            return res.status(500).send(e)
        }
    })();
})

app.post('/api/cart/add', (req, res) => {
    (async () => {
        try {
            const doc = db.collection('cart').doc();
            await doc.create({
                orderId: doc.id,
                userId: req.body.userId,
                products: req.body.products,
                totalPrice: req.body.totalPrice
            })
            return res.status(200).send("Added");
        } catch (e) {
            console.log(e)
            return res.status(500).send(e)
        }
    })();
})


app.get('/api/carts/:id', (req, res) => {
    (async () => {
        try {
            let query = db.collection('cart').where("userId", "==", req.params.id);
            let responce = [];

            await query.get().then(value => {
                if (!value.empty) {
                    let docs = value.docs;
                    for (let doc of docs) {
                        const selectedItem = {
                            userId: doc.data().userId,
                            totalPrice: doc.data().totalPrice,
                            orderId: doc.data().orderId,
                            products: doc.data().products,
                        };
                        responce.push(selectedItem);
                    }
                    return responce
                }
            })
            return res.status(200).send(responce);
        } catch (e) {
            console.log(e)
            return res.status(500).send(e)
        }
    })();
})

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
                    const name = doc.data().name.toString().toLowerCase();
                    if (name.includes(q.toLowerCase())) {
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
            if (!req.body.email.toString().match(validRegex)) {
                return res.status(422).json({
                    message: "Signup not successful",
                    error: "Invalid email address",
                })
            } else if (req.body.password.toString().length < 6) {
                return res.status(422).json({
                    message: "Signup not successful",
                    error: "Password must be more than 6 digit",
                })
            } else {
                db.collection('User').where("email", "==", req.body.email)
                    .get()
                    .then(value => {
                        if (!value.empty) {
                            return res.status(409).json({
                                message: "Signup not successful",
                                error: "Email already used",
                            })
                        } else {
                            bcrypt.genSalt(10, function (err, Salt) {
                                bcrypt.hash(req.body.password, Salt, async function (err, hash) {
                                    if (err) {
                                        console.log(err);
                                        return console.log('Cannot encrypt');
                                    }
                                    const token = crypto.randomBytes(64).toString('hex');
                                    const doc = db.collection('User').doc();
                                    await doc.create({
                                        id: doc.id,
                                        name: req.body.name,
                                        email: req.body.email,
                                        firstName: "",
                                        image: "https://www.pngmart.com/files/22/User-Avatar-Profile-PNG-Isolated-Transparent-Picture.png",
                                        lastName: "",
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
            return res.status(500).send(e)
        }
    })();
})


app.post('/api/login', (req, res) => {
    (async () => {
        try {
            const {email, password} = req.body;
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
                                        return res.status(200).json({
                                            message: "Login successful",
                                            user,
                                        })
                                    } else {
                                        return res.status(400).json({
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


app.get('/api/user/:id', (req, res) => {
    (async () => {
        try {
            const document = db.collection('User').doc(req.params.id);
            let user = await document.get();
            let response = user.data();
            const user1 = {
                id: response['id'],
                name: response['name'],
                email: response['email'],
                token: response['token'],
                firstName: response['firstName'],
                lastName: response['lastName'],
                image: response['image']
            };
            return res.status(200).send(user1);
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
app.put('/api/user/update/:id', (req, res) => {
    (async () => {
        try {
            const document = db.collection('User').doc(req.params.id);
            let userFireStore = await document.get();
            let response = userFireStore.data();

            const user = req.body;

            const updatedUser = (({oldPassword, newPassword, ...o}) => o)(user)
            console.log(updatedUser)

            let password = response.password;
            if (req.body.oldPassword !== null && req.body.oldPassword !== undefined) {
                bcrypt.compare(req.body.oldPassword, password.toString(),
                    async function (err, isMatch) {
                        if (isMatch) {
                            bcrypt.genSalt(10, function (err, Salt) {
                                bcrypt.hash(req.body.newPassword, Salt, async function (err, hash) {
                                    if (err) {
                                        console.log(err);
                                        return console.log('Cannot encrypt');
                                    }
                                    updatedUser.password = hash;
                                    await document.update(
                                        updatedUser
                                    )
                                    return res.status(200).send("User Updated");
                                })
                            })
                        } else {
                            return res.status(422).json({
                                message: "Password not match",
                            })
                        }
                    })
            } else {
                await document.update(
                    updatedUser
                )
                return res.status(200).send("User Updated");
            }
        } catch (e) {
            console.log(e)
            return res.status(500).send(e)
        }
    })();
})

app.post('/api/address/create', (req, res) => {
    (async () => {
        const addressBody = req.body;
        try {
            const doc = db.collection('address').doc();
            addressBody.addressId = doc.id;
            await doc.create(
                addressBody,
            )
            return res.status(200).send("Added");
        } catch (e) {
            console.log(e)
            return res.status(500).send(e)
        }
    })();
})


app.get('/api/address/:userId', (req, res) => {
    (async () => {
        try {
            let query = db.collection('address').where("userId", "==", req.params.userId);
            let responce = [];

            await query.get().then(value => {
                if (!value.empty) {
                    let docs = value.docs;
                    for (let doc of docs) {
                        responce.push(doc.data());
                    }
                    return responce
                }
            })
            return res.status(200).send(responce);
        } catch (e) {
            console.log(e)
            return res.status(500).send(e)
        }
    })();
})

app.post('/api/order/create', async (req, res) => {
    try {
        const orderBody = req.body;
        orderBody.status = "placed"
        orderBody.createdAt = new Date();

        const doc = db.collection('orders').doc();
        orderBody.orderId = doc.id;
        await doc.create(orderBody);

        const address = await db.collection('address').where("userId", "==", orderBody.userId).limit(1).get();
        if (address.empty) {
            const addressBody = orderBody.address;
            addressBody.userId = orderBody.userId
            try {
                const doc = db.collection('address').doc();
                addressBody.addressId = doc.id;
                await doc.create(
                    addressBody,
                )
            } catch (e) {
                console.log(e)
                return res.status(500).send(e)
            }
        }


        return res.status(200).send("added");
    }catch (e){
        return res.status(500).send(e)
    }

})
app.listen(port, () => {
    console.log("Port is " + port);
})
exports.app = functions.https.onRequest(app);

