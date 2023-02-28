module.exports = ({ env }) => ({
  connection: {
    client: 'postgres',
    connection: {
      host: env('DATABASE_HOST', 'localhost'),
      port: env.int('DATABASE_PORT', 5432),
      database: env('DATABASE_NAME', 'cerate_new_db'),
      user: env('DATABASE_USERNAME', 'postgres'),
      password: env('DATABASE_PASSWORD', 'postgres'),
      schema: env('DATABASE_SCHEMA', 'public'), // Not required
      ssl: env.bool('DATABASE_SSL', false),
    },
    debug: true,
  },
});
