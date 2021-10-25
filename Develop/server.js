require('dotenv').config({ path: './config/.env' })
const express = require('express');
const routes = require('./routes');
const database = require('./config/connection')
const app = express();
const PORT = process.env.PORT || 3001;

const connect = async () => {
    await database.authenticate()
        .then(async () => {
            await database.sync()
            app.listen(PORT, () => {
                console.log(`Connected to PORT ${PORT}!`);
            });
        }).catch( error => {
            console.log('Failed to connect => ', error)
        })
}
connect()

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(routes);