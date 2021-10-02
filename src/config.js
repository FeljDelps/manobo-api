module.exports = {
    PORT: process.env.PORT || 8001,
    NODE_ENV: process.env.NODE_ENV || 'development',
    DATABASE_URL: process.env.DATABASE_URL || 'postgresql://manobo_admin@localhost/manobo',
    TEST_DATABASE_URL: process.env.TEST_DATABASE_URL || 'postgresql://manobo_admin@localhost/manobo-test'
};