const express = require('express');
const LeadsService = require('./leads-service');

const leadsRouter = express.Router();
const jsonParser = express.json();

leadsRouter
    .route('/')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db');

        LeadsService.getAllLeads(knexInstance)
            .then(leads => {
                res.json(leads)
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const { name, email, phone, comment } = req.body;

        const newLead = { name, email, phone }
          

        for (const [key, value] of Object.entries(newLead)) {
            if (value == null) {
                return res.status(400).json({ 
                    error: { message: `Missing '${key}' in request body` }
                });
            };
        };

        newLead.comment = comment;

        LeadsService.insertLead(req.app.get('db'), newLead)
            .then(lead => {
                res
                .status(201)
                .location(`/leads/${lead.id}`)
                .json(lead)
            })
            .catch(next)
    })

leadsRouter
    .route('/:lead_id')
    .get((req, res, next) => {
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
    })

module.exports = leadsRouter;