'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // The existing ENUM values are 'PAGE', 'PRE_TEST_QUIZ', 'POST_TEST_QUIZ'
    // We are adding 'PDF_DOCUMENT'
    // IMPORTANT: For PostgreSQL, altering ENUM types requires specific commands.
    // For other databases like MySQL or SQLite, changeColumn might work directly or might need a different approach.
    // This example assumes a general approach; you might need to adjust for your specific database.

    const tableName = 'Modules';
    const columnName = 'type';
    const enumName = 'enum_Modules_type'; // Default name Sequelize might use for ENUM constraint

    // Check current ENUM values (Optional, for verification or if you don't know them)
    // This step is more for manual debugging if needed.

    // For PostgreSQL, the typical way to add a value to an ENUM is:
    // await queryInterface.sequelize.query(`ALTER TYPE "${enumName}" ADD VALUE 'PDF_DOCUMENT';`);
    // However, queryInterface.changeColumn is generally preferred for cross-DB compatibility if it supports ENUM modification.

    // If changeColumn doesn't directly support ENUM modification for your DB,
    // you might need raw queries or a more complex migration (drop constraint, alter type, add constraint).
    // For simplicity, we'll try changeColumn first, which works for some DBs or with specific configurations.
    
    await queryInterface.changeColumn(tableName, columnName, {
      type: Sequelize.ENUM('PAGE', 'PRE_TEST_QUIZ', 'POST_TEST_QUIZ', 'PDF_DOCUMENT'),
      allowNull: false,
    });
  },

  async down (queryInterface, Sequelize) {
    // Reverting this requires removing 'PDF_DOCUMENT' from the ENUM.
    // This can be complex and database-specific, especially if data uses the new ENUM value.
    // A common approach for revert is to change it back to the original ENUM list.
    // Ensure no data uses 'PDF_DOCUMENT' before running down, or handle data conversion.

    const tableName = 'Modules';
    const columnName = 'type';

    await queryInterface.changeColumn(tableName, columnName, {
      type: Sequelize.ENUM('PAGE', 'PRE_TEST_QUIZ', 'POST_TEST_QUIZ'),
      allowNull: false,
    });

    // If you were using raw SQL for PostgreSQL to add the value in `up`:
    // await queryInterface.sequelize.query(`
    //   CREATE OR REPLACE FUNCTION pg_temp.remove_enum_value(enum_name TEXT, enum_value TEXT)
    //   RETURNS void AS $$
    //   BEGIN
    //     EXECUTE 'ALTER TYPE ' || enum_name || ' RENAME TO ' || enum_name || '_old;';
    //     EXECUTE 'CREATE TYPE ' || enum_name || ' AS ENUM (' ||
    //             (SELECT string_agg(quote_literal(e.enumlabel), ', ')
    //              FROM pg_enum e
    //              JOIN pg_type t ON e.enumtypid = t.oid
    //              WHERE t.typname = enum_name || '_old' AND e.enumlabel != enum_value) || ');';
    //     EXECUTE 'ALTER TABLE "Modules" ALTER COLUMN type TYPE ' || enum_name || ' USING type::text::' || enum_name || ';';
    //     EXECUTE 'DROP TYPE ' || enum_name || '_old;';
    //   END;
    //   $$ LANGUAGE plpgsql;
    //   SELECT pg_temp.remove_enum_value('${enumName}', 'PDF_DOCUMENT');
    // `);
    // The above PostgreSQL down script is complex and potentially risky.
    // Simpler `changeColumn` is preferred if it works for your DB.
  }
};
