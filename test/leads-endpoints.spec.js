const { expect } = require('chai');
const knex = require('knex');
const app = require('../src/app');
const { makeLeadsArray, makeMaliciousLead } = require('./leads.fixtures');
const supertest = require('supertest');

describe.only('Leads endpoints', function() {
    let db;

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        });
        app.set('db', db);
    });

    after('disconnect from db', () => db.destroy());

    before('clean the table', () => db('manobo_leads').truncate());

    afterEach('cleanup', () => db('manobo_leads').truncate());

    describe('GET /api/leads', () => {
        
        context('Given no leads', () => {
            it(`responds 200 with an empty list`, () => {
                return supertest(app)
                    .get('/api/leads')
                    .expect(200, [])
            });
        });

        context('Given there are leads in the database', () => {
            const testLeads = makeLeadsArray();
    
            beforeEach('insert leads', () => {
                return db
                    .into('manobo_leads')
                    .insert(testLeads)
            });
    
    
            it('GET /api/leads responds with 200 and all of the leads', () => {
                return supertest(app)
                    .get('/api/leads')
                    .expect(200, testLeads)
            });
        });

        context(`Given an XSS attack`, () => {
            const { maliciousLead, goodLead } = makeMaliciousLead();

            beforeEach('insert malicious lead', () => {
                return db
                    .into('manobo_leads')
                    .insert([ maliciousLead ])
            });

            it('removes XSS attack content', () => {
                return supertest(app)
                    .get('/api/leads')
                    .expect(200)
                    .expect(res => {
                        expect(res.body[0].name).to.eql(goodLead.name)
                        expect(res.body[0].comment).to.eql(goodLead.comment)
                    })
            });
        });
    });

    describe('GET api/leads/:lead_id', () => {
        context('Given an XSS attack lead', () => {
            const { maliciousLead, goodLead } = makeMaliciousLead()

            beforeEach('insert malicious lead', () => {
                return db
                    .into('manobo_leads')
                    .insert([ maliciousLead ]) 
            });

            it(`removes XSS attack content`, () => {
                return supertest(app)
                    .get(`/api/leads/${maliciousLead.id}`)
                    .expect(200)
                    .expect(res => {
                        expect(res.body).to.eql(goodLead)
                    })
            })
        })

        context('Given no leads', () => {
            (`it responds with 404`, () => {
                const leadId = 12345;
                return supertest(app)
                    .get(`/api/leads/${leadId}`)
                    .expect(404, { error: { message: `Lead doesn't exist` } })
            })
        })
        
        context('Given there are leads in the database', () => {
            const testLeads = makeLeadsArray();
    
            beforeEach('insert leads', () => {
                return db
                    .into('manobo_leads')
                    .insert(testLeads)
            });
    
            it('GET /api/leads/:lead_id responds with 200 and the specified lead', () => {
                const leadId = 2;
                const expectedLead = testLeads[leadId -1]
        
                return supertest(app)
                    .get(`/api/leads/${leadId}`)
                    .expect(200, expectedLead)
            });
        });
    });

    describe('POST /api/leads', () => {
        it(`creates a lead, responding with a 201 and the new lead`, () => {
            this.retries(3)

            const newLead = {
                name: 'Test lead',
                email: 'testemail@email.com',
                phone: '(111) 111-1111',
                comment: 'test 1 comment'    
            };

            return supertest(app)
                .post('/api/leads')
                .send(newLead)
                .expect(201)
                .expect(res => {
                    expect(res.body.name).to.eql(newLead.name)
                    expect(res.body.email).to.eql(newLead.email)
                    expect(res.body.phone).to.eql(newLead.phone)
                    expect(res.body.comment).to.eql(newLead.comment)
                    expect(res.body).to.have.property('id')
                    expect(res.header.location).to.eql(`/api/leads/${res.body.id}`)
                        const expected = new Date().toLocaleString()
                        const actual = new Date(res.body.date_added).toLocaleString()
                        expect(actual).to.eql(expected)
                })
                .then(postRes => 
                    supertest(app)
                        .get(`/api/leads/${postRes.body.id}`)
                        .expect(postRes.body)
                );
        }); 
    
        const requiredFields = ['name', 'email', 'phone'];

        requiredFields.forEach(field => {
            const newLead = {
                name: 'Test lead',
                email: 'Test email',
                phone: '(111) 111-1111'
            };
            
            it(`responds with 400 and an error message when the '${field}' is missing`, () => {
                delete newLead[field]
    
                return supertest(app)
                    .post('/api/leads')
                    .send(newLead)
                    .expect(400, { 
                        error: { message: `Missing '${field}' in request body`}
                    })
            });
        });

        it(`given an XSS attack`, () => {
            const { maliciousLead, goodLead } = makeMaliciousLead();

            return supertest(app)
                .post('/api/leads')
                .send(maliciousLead)
                .expect(201)
                .expect(res => {
                    expect(res.body.name).to.eql(goodLead.name)
                    expect(res.body.comment).to.eql(goodLead.comment)
                })
        });
    });

    describe(`DELETE /api/leads/:lead_id`, () => { 
        context('Given no leads in the database', () => {
            it('responds with 404', () => {
                const leadId = 12345;

                return supertest(app)
                    .delete(`/api/leads/${leadId}`)
                    .expect(404, { error: { message: `Lead doesn't exist` } })
                });
        });
        
        context('Given there are leads in the database', () => {
            const testLeads = makeLeadsArray()

            beforeEach('insert leads into database', () => {
                return db
                    .into('manobo_leads')
                    .insert(testLeads)
            })

            it('responds with a 204 and removes the lead', () => {
                const idToRemove = 2;
                const expectedLeads = testLeads.filter(lead => lead.id !== idToRemove)
                
                return supertest(app)
                    .delete(`/api/leads/${idToRemove}`)
                    .expect(204)
                    .then(res => 
                        supertest(app)
                            .get('/api/leads')
                            .expect(expectedLeads)
                );
            });
        });
    });

    describe.only('PATCH /api/leads/:lead_id', () => {
        context('Given no leads', () => {
            it('responds with a 404', () => {
                const leadId = 12345;
                return supertest(app)
                    .patch(`/api/leads/${leadId}`)
                    .expect(404, { error: { message: `Lead doesn't exist` } })
            });
        });

        context('Given there are leads in the database', () => {
            const testLeads = makeLeadsArray();

            beforeEach('insert leads into database', () => {
                return db
                    .into('manobo_leads')
                    .insert(testLeads);
            });

            it('returns a 204 and updates the lead', () => {
                const idToUpdate = 2;
                const updatedLead = {
                    name: 'updated lead name',
                    email: 'updated lead email',
                    phone: '(111) 111-1111',
                    comment: 'updated lead comment'
                };

                const expectedLead = {
                    ...testLeads[idToUpdate -1],
                    ...updatedLead
                }
                
                return supertest(app)
                    .patch(`/api/leads/${idToUpdate}`)
                    .send(updatedLead)
                    .expect(204)
                    .then(res => 
                        supertest(app)
                            .get(`/api/leads/${idToUpdate}`)
                            .expect(expectedLead)
                        )
            });

            it(`responds 400 when no required fields supplied`, () => {
                const idToUpdate = 2;
                return supertest(app)
                    .patch(`/api/leads/${idToUpdate}`)
                    .send({ irrelevantField: 'foo' })
                    .expect(400, { error: { 
                        message: `Request body must contain either 'name', 'email', 'phone', or 'comment`
                    }});
            });

            it('responds 204 when updating only a subset of fields', () => {
                const idToUpdate = 2;
                
                const updateLead = {
                    name: 'updated field name'
                };
                
                const expectedLead = {
                    ...testLeads[idToUpdate - 1],
                    ...updateLead
                };

                return supertest(app)
                    .patch(`/api/leads/${idToUpdate}`)
                    .send({
                        ...updateLead,
                        fieldToIgnore: 'Ignore this field'
                    })
                    .expect(204)
                    .then(res => 
                        supertest(app)
                            .get(`/api/leads/${idToUpdate}`)
                            .expect(expectedLead)
                    );
            });
        });
    });
});
