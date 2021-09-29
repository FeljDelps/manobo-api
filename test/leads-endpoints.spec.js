const { expect } = require('chai');
const knex = require('knex');
const app = require('../src/app');
const { makeLeadsArray } = require('./leads.fixtures');
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

    describe('GET /leads', () => {
        
        context('Given no leads', () => {
            it(`responds 200 with an empty list`, () => {
                return supertest(app)
                    .get('/leads')
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
    
    
            it('GET /leads responds with 200 and all of the leads', () => {
                return supertest(app)
                    .get('/leads')
                    .expect(200, testLeads)
            });
        });
    });

    describe('GET /leads/:lead_id', () => {
        
        context('Given no leads', () => {
            (`it responds with 404`, () => {
                const leadId = 12345;
                return supertest(app)
                    .get(`/leads/${leadId}`)
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
    
            it('GET /leads/:lead_id responds with 200 and the specified lead', () => {
                const leadId = 2;
                const expectedLead = testLeads[leadId -1]
        
                return supertest(app)
                    .get(`/leads/${leadId}`)
                    .expect(200, expectedLead)
            });
        });
    });

    describe('POST /leads', () => {
        it(`creates a lead, responding with a 201 and the new lead`, () => {
            this.retries(3)

            const newLead = {
                name: 'Test lead',
                email: 'testemail@email.com',
                phone: '(111) 111-1111',
                comment: 'test 1 comment'    
            };

            return supertest(app)
                .post('/leads')
                .send(newLead)
                .expect(201)
                .expect(res => {
                    expect(res.body.name).to.eql(newLead.name)
                    expect(res.body.email).to.eql(newLead.email)
                    expect(res.body.phone).to.eql(newLead.phone)
                    expect(res.body.comment).to.eql(newLead.comment)
                    expect(res.body).to.have.property('id')
                    expect(res.header.location).to.eql(`/leads/${res.body.id}`)
                        const expected = new Date().toLocaleString()
                        const actual = new Date(res.body.date_added).toLocaleString()
                        expect(actual).to.eql(expected)
                })
                .then(postRes => 
                    supertest(app)
                        .get(`/leads/${postRes.body.id}`)
                        .expect(postRes.body)
                );
        });
        
        
    });
    
    
    
    
        
   
});
