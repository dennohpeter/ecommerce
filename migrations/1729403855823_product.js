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
  pgm.createTable('products', {
    id: { type: 'uuid', primaryKey: true },
    title: { type: 'varchar(100)', notNull: true },
    picture: { type: 'varchar(100)', notNull: false },
    summary: { type: 'text', notNull: true },
    description: { type: 'text', notNull: true },
    quantity: { type: 'integer', notNull: true },
    price: { type: 'float', notNull: true },
    category_id: {
      type: 'uuid',
      notNull: true,
      references: 'categories',
      onDelete: 'cascade',
    },
    tags: { type: 'text[]', notNull: true },
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

  pgm.createIndex('products', 'title');
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {};
