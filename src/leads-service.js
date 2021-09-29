const LeadsService = {
    getAllLeads(db) {
        return db('manobo_leads')
            .select('*');
    },

    insertLead(db, data) {
        return db('manobo_leads')
            .insert(data)
            .returning('*')
            .then(rows => rows[0]);
    },

    getById(db, id) {
        return db('manobo_leads')
            .select('*')
            .where({ id })
            .first();
    },

    deleteLead(db, id) {
        return db('manobo_leads')
            .where({ id })
            .delete();
    },

    updateLead(db, id, data) {
        return db('manobo_leads')
            .where({ id })
            .update(data);
    }
};

module.exports = LeadsService;
