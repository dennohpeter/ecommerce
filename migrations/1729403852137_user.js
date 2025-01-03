/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
  pgm.createTable('users', {
    id: { type: 'uuid', primaryKey: true },
    name: { type: 'varchar(100)', notNull: true },
    email: { type: 'varchar(100)', notNull: true, unique: true },
    password: { type: 'varchar(100)', notNull: true },
    role: { type: 'varchar(100)', notNull: true, default: 'user' },
    address: { type: 'varchar(100)', notNull: false },
    email_verified: { type: 'boolean', notNull: true, default: false },
    avatar: { type: 'varchar(100)', notNull: false },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    updated_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {};
