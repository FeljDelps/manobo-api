function makeLeadsArray() {
    return [
        {
            id: 1,
            lead_name: 'Test lead name 1',
            email: 'testemail1@email.com',
            phone: '(111) 111-1111',
            comment: 'test 1 comment',
            date_added: '2029-01-22T16:28:32.615Z'
        },
        {
            id: 2,
            lead_name: 'Test lead name 2',
            email: 'testemail2@email.com',
            phone: '(222) 222-2222',
            comment: 'test 2 comment',
            date_added: '2029-01-22T16:28:32.615Z'
        },
        {
            id: 3,
            lead_name: 'Test lead name 3',
            email: 'testemail3@email.com',
            phone: '(333) 333-3333',
            comment: 'test 3 comment',
            date_added: '2029-01-22T16:28:32.615Z'
        }
    ];
}

function makeMaliciousLead() {
    
    const maliciousLead = {
        id: 911,
        lead_name: 'Naughty naughty very naughty <script>alert("xss");</script>',
        email: 'badlead@email.com',
        phone: '(111) 111-1111',
        comment: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
        date_added: new Date().toISOString()
    };

    const goodLead = {
        ...maliciousLead, 
        lead_name: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
        comment: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`
    }

    return {
        maliciousLead,
        goodLead
    }
}

module.exports = {
    makeLeadsArray, makeMaliciousLead
}