const express = require('express');
const cors = require('cors');
const fs = require('fs'); 
const app = express();
const port = 3001;

app.use(express.json());
app.use(cors());


const loadUsers = () => {
    try {
        const data = fs.readFileSync('users.json');
        return JSON.parse(data);
    } catch (error) {
        return []; 
    }
};


const saveUsers = (users) => {
    fs.writeFileSync('users.json', JSON.stringify(users, null, 2)); 
};

app.get("/", (req, res) => {
    res.status(200).send("Home Page...");
});

app.get("/about", (req, res) => {
    res.send("About Page....");
});

app.post('/register_user', (req, res) => {
    let user_id;
    const users = loadUsers();
    
    if (users.length === 0) {
        user_id = 1;
    } else {
        user_id = users[users.length - 1].id + 1;
    }

    const { fullName, username, email, phoneNumber, dateOfBirth, address, nationality, socialMediaPlatform, password, confirmPassword } = req.body;
    if (password !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match!" });
    }

    const bcrypt = require('bcrypt');
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            return res.status(500).json({ message: "Error hashing password" });
        }

        const new_user = {
            id: user_id,
            fullName,
            username,
            email,
            phoneNumber,
            dateOfBirth,
            address,
            nationality,
            socialMediaPlatform,
            password: hashedPassword, 
        };

        users.push(new_user);
        saveUsers(users); 

        const { password: _, ...userWithoutPassword } = new_user; 

        res.status(201).json({
            message: "User Registered successfully!",
            user: userWithoutPassword
        });
    });
});

app.listen(port, () => {
    console.log("Server Running on port", port);
});
