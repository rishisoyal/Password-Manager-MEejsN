// Imports
const express = require('express')
const dotenv = require('dotenv')
const { userModel } = require('./model/userModel.js')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')

// Loads .env file contents into process.env
dotenv.config()

// Get environment variables
const PORT = process.env.PORT || 8000

// App initialization
const app = express()

// Middlewares
// Parse req, res body to json
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
// Serve static files
app.use(express.static('./static'))
app.use(cookieParser())
// Set view engine (rendering template) to ejs
app.set('view engine', 'ejs');

// Routes
// Main page
app.get('/', async (req, res) => {
    if (req.cookies.user !== undefined) {
        try {
            // const user = await userModel.findOne({ name: req.cookies.user })
            // console.log(user);
            res.status(201).redirect('/user')
        } catch (error) {
            res.status(500).send({ success: false, message: "Could not fetch users from database", error: error.message })
        }
    }
    else {
        res.render('mainPage')
    }
})

// User page
app.get('/user', async (req, res) => {
    // console.log(req.cookies);

    if (req.cookies.user !== undefined) {
        try {
            const user = await userModel.findOne({ name: req.cookies.user })
            // console.log(user);
            res.status(201).render('userPage', { user: user })
        } catch (error) {
            res.status(500).send({ success: false, message: "Could not fetch users from database", error: error.message })
        }
    }
    else {
        res.redirect('/create')
    }
})

//Log out user
app.get('/logout', (rew, res) => {
    res.clearCookie("user").redirect('/')
})

// Log in user
app.get('/login', async (req, res) => {
    res.render('logInPage')
})

app.post('/userlogin', async (req, res) => {
    const user = await userModel.findOne({ name: req.body.name, logInPassword: req.body.password })

    if (user === null) {
        res.redirect('/login?error=User not found');
    }
    else {
        res.cookie("user", user.name)
        res.redirect('/user')
    }
})

// Create user
app.get('/create', (req, res) => {
    res.render('createNewUserPage')
})
app.post('/createuser', async (req, res) => {
    try {
        userModel.create({
            name: req.body.name,
            logInPassword: req.body.password,
            passwordList: []
        })
        // console.log("Created");
        res.cookie("user", req.body.name)
        res.status(201).redirect('/user')
    } catch (error) {
        res.status(500).json({ message: "Error Creating User", error: error.message });
    }
})

// Add entry
app.get('/addpassword/:user', async (req, res) => {
    const user = await userModel.findOne({ name: req.params.user })
    res.render('addPasswordPage', { user: user })
})

app.post('/addnewpassword/:user', async (req, res) => {
    await userModel.findOneAndUpdate(
        { name: req.params.user }, // Filter
        {
            $push: {
                passwordList: {
                    title: req.body.title,
                    password: req.body.password,
                    _id: new mongoose.Types.ObjectId()
                }
            }
        }, // Update
        { new: true } // Return the updated document
    )
        .then()
        .catch(err => console.error("Error:", err));

    res.redirect('/user')
})

// Delete entry
app.get('/deletepassword/:user/:id', async (req, res) => {
    userModel.findOneAndUpdate(
        { name: req.params.user }, // Filter
        { $pull: { passwordList: { _id: new mongoose.Types.ObjectId(req.params.id) } } }, // Update
        { new: true } // Return the updated document
    )
        .then()
        .catch(err => console.error("Error:", err));
    res.redirect('/user')
})

// update entry
app.get('/updatepassword/:user/:id', async (req, res) => {
    res.render('updatePasswordPage', { user: req.params.user, id: req.params.id })
})

// Update entry
app.post('/updpassword/:user/:id', async (req, res) => {
    try {
        const result = await userModel.findOneAndUpdate(
            {
                name: req.params.user,
                'passwordList._id': new mongoose.Types.ObjectId(req.params.id)
            },
            {
                $set: {
                    'passwordList.$.title': req.body.title,
                    'passwordList.$.password': req.body.password // Use a hashing method
                }
            },
            { new: true }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: 'User or password entry not found' });
        }

        res.status(200).redirect('/user');
    } catch (error) {
        res.status(500).json({ message: 'Error updating password', error });
    }
})

// App listener
app.listen(PORT, () => {
    console.log(`App running at http://127.0.0.1:${PORT}`);
})