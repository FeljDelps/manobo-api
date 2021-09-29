function makeLeadsArray() {
    return [
        {
            id: 1,
            name: 'Test lead name 1',
            email: 'testemail1@email.com',
            phone: '(111) 111-1111',
            comment: 'test 1 comment',
            date_added: '2029-01-22T16:28:32.615Z'
        },
        {
            id: 2,
            name: 'Test lead name 2',
            email: 'testemail2@email.com',
            phone: '(222) 222-2222',
            comment: 'test 2 comment',
            date_added: '2029-01-22T16:28:32.615Z'
        },
        {
            id: 3,
            name: 'Test lead name 3',
            email: 'testemail3@email.com',
            phone: '(333) 333-3333',
            comment: 'test 3 comment',
            date_added: '2029-01-22T16:28:32.615Z'
        }
    ];
}

module.exports = {
    makeLeadsArray
}