require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaLibSql } = require('@prisma/adapter-libsql');
const { createClient } = require('@libsql/client');

const libsql = createClient({
    url: process.env.DATABASE_URL || 'file:./prisma/dev.db',
});

const adapter = new PrismaLibSql(libsql);
const prisma = new PrismaClient({ adapter });

module.exports = prisma;