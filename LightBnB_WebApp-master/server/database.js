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
  const queryParams = [];
  // create initial query string
  let queryString = `
  SELECT properties.*, avg(property_reviews.rating) as average_rating
  FROM properties
  JOIN property_reviews ON properties.id = property_id
  `;

  // check if city option is provided
  if (options.city) {
    queryParams.push(`%${options.city}%`);
    queryString += `WHERE city LIKE $${queryParams.length} `;

    // check for follow up filters
    if (options['minimum_price_per_night']) {
      queryParams.push(options['minimum_price_per_night'] * 100);
      queryString += `AND cost_per_night >= $${queryParams.length} `;
    }

    if (options['maximum_price_per_night']) {
      queryParams.push(options['maximum_price_per_night'] * 100);
      queryString += `AND cost_per_night <= $${queryParams.length} `;
    }

    if (options.owner_id) {
    }
  }

  queryString += `
  GROUP BY properties.id `;

  if (options['minimum_rating']) {
    queryParams.push(Number(options['minimum_rating']));
    queryString += `
    HAVING avg(property_reviews.rating) >= $${queryParams.length} `;
  }

  queryParams.push(limit);
  queryString += `  
  ORDER BY cost_per_night
  LIMIT $${queryParams.length};
  `;

  // 6
  return pool
    .query(queryString, queryParams)
    .then((res) => res.rows)
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
  const queryParams = [
    property.owner_id,
    property.title,
    property.description,
    property.thumbnail_photo_url,
    property.cover_photo_url,
    property.cost_per_night,
    property.street,
    property.city,
    property.province,
    property.post_code,
    property.country,
    property.parking_spaces,
    property.number_of_bathrooms,
    property.number_of_bedrooms,
  ];

  const queryString = `
    INSERT INTO properties (owner_id,title, description, thumbnail_photo_url, cover_photo_url, cost_per_night, street, city, province, post_code, country, parking_spaces, number_of_bathrooms, number_of_bedrooms)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
    RETURNING *;
  `;

  console.log(queryString);
  return pool
    .query(queryString, queryParams)
    .then((res) => res.rows)
    .catch((err) => {
      console.log(err.stack);
    });
};
exports.addProperty = addProperty;

// property object
/*
{
  owner_id: int,
  title: string,
  description: string,
  thumbnail_photo_url: string,
  cover_photo_url: string,
  cost_per_night: string,
  street: string,
  city: string,
  province: string,
  post_code: string,
  country: string,
  parking_spaces: int,
  number_of_bathrooms: int,
  number_of_bedrooms: int
}
*/
