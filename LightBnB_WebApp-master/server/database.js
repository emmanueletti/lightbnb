const properties = require('./json/properties.json');
const users = require('./json/users.json');
const { Pool } = require('pg');

const pool = new Pool({
  user: 'vagrant',
  password: '123',
  host: 'localhost',
  database: 'lightbnb',
});

/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function (email) {
  const values = [email];
  const queryString = `
    SELECT *
    FROM users
    WHERE email = $1 
  `;
  return pool
    .query(queryString, values)
    .then((res) => {
      if (!res.rows.length) {
        return null;
      }
      return res.rows[0];
    })
    .catch((err) => {
      console.log(err);
    });
};

// sebastianguerra@ymail.com

exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function (id) {
  const values = [id];
  const queryString = `
    SELECT *
    FROM users
    WHERE id = $1 
  `;
  return pool
    .query(queryString, values)
    .then((res) => {
      if (!res.rows.length) {
        return null;
      }
      return res.rows[0];
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getUserWithId = getUserWithId;

/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser = function (user) {
  const { name, email, password } = user;
  const values = [name, email, password];
  const queryString = `
    INSERT INTO users (name, email, password)
    VALUES ($1, $2, $3)
    RETURNING * ;
  `;
  return pool
    .query(queryString, values)
    .then((res) => {
      return res.rows.id;
    })
    .catch((err) => {
      console.log(err.stack);
    });
};
exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function (guest_id, limit = 10) {
  const values = [guest_id, limit];
  const queryString = `
    SELECT *
    FROM reservations
    JOIN properties
      ON reservations.property_id = properties.id
    WHERE reservations.guest_id = $1
      AND reservations.start_date > Now()::date
    LIMIT $2;
  `;

  return pool
    .query(queryString, values)
    .then((res) => {
      console.log(res.rows);
      return res.rows;
    })
    .catch((err) => {
      console.log(err.stack);
    });
};
exports.getAllReservations = getAllReservations;
// sebastianguerra@ymail.com

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = function (options, limit = 10) {
  const values = [limit];
  const queryString = ` SELECT * FROM properties LIMIT $1`;

  return pool
    .query(queryString, values)
    .then((res) => {
      return res.rows;
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getAllProperties = getAllProperties;

/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function (property) {
  const propertyId = Object.keys(properties).length + 1;
  property.id = propertyId;
  properties[propertyId] = property;
  return Promise.resolve(property);
};
exports.addProperty = addProperty;
