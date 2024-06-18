require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const rateLimit = require('express-rate-limit');

const Port = process.env.Port;
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
})
const app = express();

//! Cors options
const corsOptions = {
    origin: ['http://localhost:5173'],
};

const API_KEY = process.env.ExchangeRate_API_KEY;
const apiUrl = "https://v6.exchangerate-api.com/v6/";

//! Middleware
app.use(express.json()); // passing incoming json data
app.use(apiLimiter);
app.use(cors(corsOptions));

//! Conversion route
app.post('/api/convert', async (req, res) => {
    try {
        // get the user data
        const { from, to, amount } = req.body;
        //Construct the api
        const url = `${apiUrl}/${API_KEY}/pair/${from}/${to}/${amount}`;
        const response = await axios.get(url);
        if (response.data && response.data.result === "success") {
            res.json({
                message: `The amount ${amount} ${from} in ${to} is ${response.data.conversion_result}`,
                conversionRate: response.data.conversion_rate,
            });
        } else {
            res.json({
                message: "Error converting currency",
                details: response.data,
            });
        }
    } catch (error) {
        res.json({ message: "Error converting currency", details: error.message });
    }
})

//! Start the server
app.listen(Port, () => { console.log(`Server is running on port: ${Port}`) });