require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const LeadsService = require('./leads-service');


const app = express();
const jsonParser = express.json();

const morganOption = (NODE_ENV === 'production') ? 'tiny' : 'common';

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());

app.get('/', (req,res) => {
    res.send("Hello, diva!");
})

app.get('/leads', (req, res, next) => {
    const knexInstance = req.app.get('db');

    LeadsService.getAllLeads(knexInstance)
        .then(leads => {
            res.json(leads)
        })
        .catch(next)
});

app.post('/leads', jsonParser, (req, res, next) => {
    const { name, email, phone, comment } = req.body;

    const newLead = { name, email, phone, comment };

    LeadsService.insertLead(req.app.get('db'), newLead)
        .then(lead => {
            res
            .status(201)
            .location(`/leads/${lead.id}`)
            .json(lead)
        })
        .catch(next)
});

app.get('/leads/:lead_id', (req, res, next) => {
    const knexInstance = req.app.get('db');
    
    LeadsService.getById(knexInstance, req.params.lead_id)
        .then(lead => {
            if(!lead) {
                return res.status(404).json({ 
                    error: { message: `Lead doesn't exist` }
                });
            };
            res.json(lead)
        })
        .catch(next)
});



app.use(function errorHandler(error, req, res, next) {
    let response;
    if (NODE_ENV === 'production') {
        response = { error: { message: 'server error' }};
    } else {
        console.error(error);
        response = { message: error.message, error };
    };
    res.status(500).json(response);
});

module.exports = app;

