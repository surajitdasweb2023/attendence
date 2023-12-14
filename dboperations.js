require("dotenv").config();
const mysql = require("mysql2");
const util = require("util");
const uuid = require("uuid").v4;

function getMySqlDBConnection() {
  const conn = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    port: process.env.MYSQL_PORT,
    database: process.env.MYSQL_DATABASE,
  });
  const query = util.promisify(conn.query).bind(conn);
  return { conn, query };
}

async function getAllUsers() {
  const { conn, query } = getMySqlDBConnection();
  try {
    return await query(
      `SELECT * FROM users WHERE userType='normal' ORDER BY creationDateTime DESC`
    );
  } finally {
    conn.end();
  }
}

async function insertUserDetails(user) {
  const { conn, query } = getMySqlDBConnection();
  try {
    const {
      id,
      email,
      password,
      userType,
      passwordReset,
      isPasswordCreated,
      creationDateTime,
      lastUpdatedDateTime,
      isUserActive,
      otherField1,
      otherField2,
    } = user;
    return await query(
      `INSERT INTO users VALUES('${id}','${email}','${password}','${userType}','${passwordReset}','${isPasswordCreated}','${creationDateTime}','${lastUpdatedDateTime}','${isUserActive}','${otherField1}','${otherField2}')`
    );
  } finally {
    conn.end();
  }
}

async function registration(user) {
  const { conn, query } = getMySqlDBConnection();
  try {
    const id = uuid();
    const {
      email,
      password,
      userType,
      passwordReset,
      isPasswordCreated,
      creationDateTime,
      lastUpdatedDateTime,
      isUserActive,
      otherField1,
      otherField2,
    } = user;
    return await query(
      `INSERT INTO users VALUES('${id}','${email}','${password}','${userType}','${passwordReset}','${isPasswordCreated}','${creationDateTime}','${lastUpdatedDateTime}','${isUserActive}','${otherField1}','${otherField2}')`
    );
  } finally {
    conn.end();
  }
}

async function login(user) {
  const { conn, query } = getMySqlDBConnection();
  try {
    const { email, password } = user;
    return await query(
      `SELECT * FROM users WHERE email='${email}' and password='${password}'`
    );
  } finally {
    conn.end();
  }
}

async function updatePassword(user) {
  const { conn, query } = getMySqlDBConnection();
  try {
    const { id, password } = user;
    return await query(
      `UPDATE users SET password='${password}', passwordReset='false' WHERE id='${id}' and passwordReset='true'`
    );
  } finally {
    conn.end();
  }
}

async function updateLogin(user) {
  const { conn, query } = getMySqlDBConnection();
  try {
    const { id, isPasswordCreated } = user;
    return await query(
      `UPDATE users SET isPasswordCreated='${isPasswordCreated}' WHERE id='${id}'`
    );
  } finally {
    conn.end();
  }
}

async function updateUserStatus(user) {
  const { conn, query } = getMySqlDBConnection();
  try {
    const { id, otherField2 } = user;
    return await query(
      `UPDATE users SET otherField2='${otherField2}' WHERE id='${id}'`
    );
  } finally {
    conn.end();
  }
}

async function getUserDetailsById(id) {
  const { conn, query } = getMySqlDBConnection();
  try {
    return await query(`SELECT * FROM users WHERE id='${id}'`);
  } finally {
    conn.end();
  }
}

async function getUserDetailsByEmail(email) {
  const { conn, query } = getMySqlDBConnection();
  try {
    return await query(`SELECT * FROM users WHERE email='${email}'`);
  } finally {
    conn.end();
  }
}

async function deactivateUser(id) {
  const { conn, query } = getMySqlDBConnection();
  try {
    return await query(`UPDATE users SET isUserActive='false' WHERE id='${id}'`);
  } finally {
    conn.end();
  }
}

async function updatePasswordReset(data) {
  const { conn, query } = getMySqlDBConnection();
  try {
    const { id, password } = data;
    return await query(
      `UPDATE users SET passwordReset='true', password='${password}' WHERE id='${id}'`
    );
  } finally {
    conn.end();
  }
}

async function ifEmailAlreadyExist(email) {
  const { conn, query } = getMySqlDBConnection();
  try {
    return await query(`SELECT * FROM users WHERE email='${email}'`);
  } finally {
    conn.end();
  }
}



async function createProfile(company) {
  const { conn, query } = getMySqlDBConnection();
  try {
    const id = uuid();
    const {
      userId,
      name,
      age,
      address,
      designation,
      profileCreationDate,
      otherField1,
      otherField2,
      otherField3,
      otherField4,
    } = company;
    return await query(
      `INSERT INTO company_profiles VALUES('${id}','${userId}','${name}','${age}','${address}','${designation}','${profileCreationDate}','${otherField1}','${otherField2}',,'${otherField3}','${otherField4}')`
    );
  } finally {
    conn.end();
  }
}

async function getProfile(id) {
  const { conn, query } = getMySqlDBConnection();
  try {
    return await query(`SELECT * FROM profiles WHERE id='${id}'`);
  } finally {
    conn.end();
  }
}

async function updateProfile(profile) {
  const { conn, query } = getMySqlDBConnection();
  try {
    const {
      id,
      userId,
      name,
      age,
      address,
      designation,
      profileCreationDate,
      otherField1,
      otherField2,
      otherField3,
      otherField4,
    } = profile;
    return await query(
      `UPDATE company_profiles SET userId='${userId}', name='${name}', age='${age}', address='${address}', designation='${designation}', profileCreationDate='${profileCreationDate}', otherField1='${otherField1}', otherField2='${otherField2}', otherField1='${otherField3}', otherField2='${otherField4}' WHERE id='${id}'`
    );
  } finally {
    conn.end();
  }
}



async function getAllAttendence() {
  const { conn, query } = getMySqlDBConnection();
  try {
    return await query(`SELECT * FROM attendence ORDER BY lastUpdatedDateTime DESC`);
  } finally {
    conn.end();
  }
}

async function getAllAttendenceByEmail(service) {
  const { conn, query } = getMySqlDBConnection();
  try {
    const { id } = service;
    return await query(`SELECT * FROM attendence WHERE id='${id}' ORDER BY lastUpdatedDateTime DESC`);
  } finally {
    conn.end();
  }
}

async function createAttendence(service) {
  const { conn, query } = getMySqlDBConnection();
  try {
    const id = uuid();
    const {
      userId,
      currentDate,
      lastUpdatedDateTime,
      entryDateTime,
      exitDateTime,
      otherField1,
      otherField2,
      otherField3,
      otherField4,
    } = service;
    return await query(
      `INSERT INTO attendence VALUES('${id}','${userId}','${currentDate}','${lastUpdatedDateTime}','${entryDateTime}','${exitDateTime}','${otherField1}','${otherField2}','${otherField3}','${otherField4}')`
    );
  } finally {
    conn.end();
  }
}

async function updateAttendence(service) {
  const { conn, query } = getMySqlDBConnection();
  try {
    const { id, entryDateTime, exitDateTime } = service;
    return await query(
      `UPDATE attendence SET entryDateTime='${entryDateTime}', exitDateTime='${exitDateTime}' WHERE id='${id}'`
    );
  } finally {
    conn.end();
  }
}



async function getConfigurations() {
  const { conn, query } = getMySqlDBConnection();
  try {
    return await query(`SELECT * FROM configurations`);
  } finally {
    conn.end();
  }
}

async function updateConfiguration(configuration) {
  const { conn, query } = getMySqlDBConnection();
  try {
    const {
      id,
      conf1,
      conf2,
      conf3,
    } = configuration;
    return await query(`UPDATE configurations SET conf1='${conf1}', conf2='${conf2}', conf3='${conf3}' WHERE id='${id}'
    `);
  } finally {
    conn.end();
  }
}

module.exports = {
  getAllUsers: getAllUsers,
  insertUserDetails: insertUserDetails,
  registration: registration,
  login: login,
  updatePassword: updatePassword,
  updateLogin: updateLogin,
  updateUserStatus: updateUserStatus,
  getUserDetailsById: getUserDetailsById,
  getUserDetailsByEmail: getUserDetailsByEmail,
  deactivateUser: deactivateUser,
  updatePasswordReset: updatePasswordReset,
  ifEmailAlreadyExist: ifEmailAlreadyExist,
  
  createProfile: createProfile,
  getProfile: getProfile,
  updateProfile: updateProfile,
  
  getAllAttendence: getAllAttendence,
  getAllAttendenceByEmail: getAllAttendenceByEmail,
  createAttendence: createAttendence,
  updateAttendence: updateAttendence,

  getConfigurations: getConfigurations,
  updateConfiguration: updateConfiguration,
};
