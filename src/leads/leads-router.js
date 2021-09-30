const express = require('express');
const xss = require('xss');
const LeadsService = require('./leads-service');

const leadsRouter = express.Router();
const jsonParser = express.json();

const serializeLead = lead => ({
    id: lead.id,
    name: xss(lead.name),
    email: lead.email,
    phone: lead.phone,
    comment: xss(lead.comment),
    date_added: lead.date_added
})


leadsRouter
    .route('/')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db');

        LeadsService.getAllLeads(knexInstance)
            .then(leads => {
                res.json(leads.map(serializeLead))
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
                .json(serializeLead(lead))
            })
            .catch(next)
    })

leadsRouter
    .route('/:lead_id')
    .all((req, res, next) => {
        LeadsService.getById(req.app.get('db'), req.params.lead_id)
            .then(lead => {
                if (!lead) {
                    return res.status(404).json({
                        error: { message: `Lead doesn't exist` }
                    })
                };
                res.lead = lead
                next();
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json(serializeLead(lead))
        .catch(next)
    })
    .delete((req, res, next) => {
        const knexInstance = req.app.get('db')

        LeadsService.deleteLead(knexInstance, req.params.lead_id)
            .then(rowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    });

module.exports = leadsRouter;