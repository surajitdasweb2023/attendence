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

async function createProfile(company) {
  const { conn, query } = getMySqlDBConnection();
  try {
    const id = uuid();
    const {
      companyName,
      countryName,
      stateName,
      address,
      isDeleted,
      creationDateTime,
      otherField1,
      otherField2,
    } = company;
    return await query(
      `INSERT INTO company_profiles VALUES('${id}','${companyName}','${countryName}','${stateName}','${address}','${isDeleted}','${creationDateTime}','${otherField1}','${otherField2}')`
    );
  } finally {
    conn.end();
  }
}

async function deleteCompanyProfile(company) {
  const { conn, query } = getMySqlDBConnection();
  try {
    const { id, status } = company;
    return await query(
      `UPDATE company_profiles SET isDeleted='${status}' WHERE id='${id}'`
    );
  } finally {
    conn.end();
  }
}

async function getCompanyProfile(id) {
  const { conn, query } = getMySqlDBConnection();
  try {
    return await query(`SELECT * FROM company_profiles WHERE id='${id}'`);
  } finally {
    conn.end();
  }
}

async function updateProfile(profile) {
  const { conn, query } = getMySqlDBConnection();
  try {
    const {
      id,
      companyName,
      countryName,
      stateName,
      address,
      otherField1,
      otherField2,
    } = profile;
    return await query(
      `UPDATE company_profiles SET companyName='${companyName}', countryName='${countryName}', stateName='${stateName}', address='${address}', otherField1='${otherField1}', otherField2='${otherField2}' WHERE id='${id}'`
    );
  } finally {
    conn.end();
  }
}

async function getAllServices() {
  const { conn, query } = getMySqlDBConnection();
  try {
    return await query(`SELECT * FROM services ORDER BY creationDateTime DESC`);
  } finally {
    conn.end();
  }
}

async function getAllServicesById(id) {
  const { conn, query } = getMySqlDBConnection();
  try {
    return await query(`SELECT * FROM services WHERE id='${id}'`);
  } finally {
    conn.end();
  }
}

async function getAllServicesByCompanyId(id) {
  const { conn, query } = getMySqlDBConnection();
  try {
    return await query(
      `SELECT * FROM services WHERE companyId='${id}' ORDER BY creationDateTime DESC`
    );
  } finally {
    conn.end();
  }
}

async function getAllServicesByUserId(id) {
  const { conn, query } = getMySqlDBConnection();
  try {
    return await query(
      `SELECT * FROM services WHERE createdBy='${id}' ORDER BY creationDateTime DESC`
    );
  } finally {
    conn.end();
  }
}

async function createService(service) {
  const { conn, query } = getMySqlDBConnection();
  try {
    const id = uuid();
    const {
      companyId,
      createdBy,
      serviceName,
      category,
      status,
      creationDateTime,
      comments,
      otherField1,
      otherField2,
    } = service;
    return await query(
      `INSERT INTO services VALUES('${id}','${companyId}','${createdBy}','${serviceName}','${category}','${status}','${creationDateTime}','${comments}','${otherField1}','${otherField2}')`
    );
  } finally {
    conn.end();
  }
}

async function updateServiceComment(service) {
  const { conn, query } = getMySqlDBConnection();
  try {
    const { id, comments } = service;
    return await query(
      `UPDATE services SET comments='${comments}' WHERE id='${id}'`
    );
  } finally {
    conn.end();
  }
}

async function createApplicantInformation(applicant) {
  const { conn, query } = getMySqlDBConnection();
  try {
    const id = uuid();
    const {
      userId,
      name,
      gender,
      dateOfBirth,
      placeOfBirth,
      maritalStatus,
      degree,
      degreeName,
      address,
      telephone,
      email,
      nationality,
      passportIssueDate,
      passportIssuingEntity,
      validTillDate,
      noOfBlankPassportPages,
      otherApplicant1Details,
      otherApplicant2Details,
      otherApplicant3Details,
      otherApplicant4Details,
      otherApplicant5Details,
      otherApplicant6Details,
      otherApplicant7Details,
      otherApplicant8Details,
      otherApplicant9Details,
      otherApplicant10Details,
      currentJobTitle,
      currentEmployerName,
      currentEmployerAddress,
      withCurrentEmployerSince,
      jobTitleOnceInPortugal,
      employerNameInPortugal,
      employerAddressInPortutal,
      monthlySalaryInPortugal,
      otherIncomeSources,
      expectedTravelDateToPortugal,
      expectedDurationOfStayInPortugal,
      obtainedImmigrationPreviously,
      obtainedImmigrationPreviouslyDetails,
      refusedVisa,
      refusedVisaDetails,
      otherField1,
      otherField2,
    } = applicant;
    return await query(`INSERT INTO applicant_information VALUES(
      '${id}',
      '${userId}',
      '${name}',
      '${gender}',
      '${dateOfBirth}',
      '${placeOfBirth}',
      '${maritalStatus}',
      '${degree}',
      '${degreeName}',
      '${address}',
      '${telephone}',
      '${email}',
      '${nationality}',
      '${passportIssueDate}',
      '${passportIssuingEntity}',
      '${validTillDate}',
      '${noOfBlankPassportPages}',
      '${otherApplicant1Details}',
      '${otherApplicant2Details}',
      '${otherApplicant3Details}',
      '${otherApplicant4Details}',
      '${otherApplicant5Details}',
      '${otherApplicant6Details}',
      '${otherApplicant7Details}',
      '${otherApplicant8Details}',
      '${otherApplicant9Details}',
      '${otherApplicant10Details}',
      '${currentJobTitle}',
      '${currentEmployerName}',
      '${currentEmployerAddress}',
      '${withCurrentEmployerSince}',
      '${jobTitleOnceInPortugal}',
      '${employerNameInPortugal}',
      '${employerAddressInPortutal}',
      '${monthlySalaryInPortugal}',
      '${otherIncomeSources}',
      '${expectedTravelDateToPortugal}',
      '${expectedDurationOfStayInPortugal}',
      '${obtainedImmigrationPreviously}',
      '${obtainedImmigrationPreviouslyDetails}',
      '${refusedVisa}',
      '${refusedVisaDetails}',
      '${otherField1}',
      '${otherField2}'
      )`);
  } finally {
    conn.end();
  }
}

async function getApplicantInformation(userId) {
  const { conn, query } = getMySqlDBConnection();
  try {
    return await query(
      `SELECT * FROM applicant_information WHERE userId='${userId}'`
    );
  } finally {
    conn.end();
  }
}

async function updateApplicantInformation(applicant) {
  const { conn, query } = getMySqlDBConnection();
  try {
    const {
      id,
      name,
      gender,
      dateOfBirth,
      placeOfBirth,
      maritalStatus,
      degree,
      degreeName,
      address,
      telephone,
      email,
      nationality,
      passportIssueDate,
      passportIssuingEntity,
      validTillDate,
      noOfBlankPassportPages,
      otherApplicant1Details,
      otherApplicant2Details,
      otherApplicant3Details,
      otherApplicant4Details,
      otherApplicant5Details,
      otherApplicant6Details,
      otherApplicant7Details,
      otherApplicant8Details,
      otherApplicant9Details,
      otherApplicant10Details,
      currentJobTitle,
      currentEmployerName,
      currentEmployerAddress,
      withCurrentEmployerSince,
      jobTitleOnceInPortugal,
      employerNameInPortugal,
      employerAddressInPortutal,
      monthlySalaryInPortugal,
      otherIncomeSources,
      expectedTravelDateToPortugal,
      expectedDurationOfStayInPortugal,
      obtainedImmigrationPreviously,
      obtainedImmigrationPreviouslyDetails,
      refusedVisa,
      refusedVisaDetails,
      otherField1,
      otherField2,
    } = applicant;
    return await query(`UPDATE applicant_information SET
      name='${name}',
      gender='${gender}',
      dateOfBirth='${dateOfBirth}',
      placeOfBirth='${placeOfBirth}',
      maritalStatus='${maritalStatus}',
      degree='${degree}',
      degreeName='${degreeName}',
      address='${address}',
      telephone='${telephone}',
      email='${email}',
      nationality='${nationality}',
      passportIssueDate='${passportIssueDate}',
      passportIssuingEntity='${passportIssuingEntity}',
      validTillDate='${validTillDate}',
      noOfBlankPassportPages='${noOfBlankPassportPages}',
      otherApplicant1Details='${otherApplicant1Details}',
      otherApplicant2Details='${otherApplicant2Details}',
      otherApplicant3Details='${otherApplicant3Details}',
      otherApplicant4Details='${otherApplicant4Details}',
      otherApplicant5Details='${otherApplicant5Details}',
      otherApplicant6Details='${otherApplicant6Details}',
      otherApplicant7Details='${otherApplicant7Details}',
      otherApplicant8Details='${otherApplicant8Details}',
      otherApplicant9Details='${otherApplicant9Details}',
      otherApplicant10Details='${otherApplicant10Details}',
      currentJobTitle='${currentJobTitle}',
      currentEmployerName='${currentEmployerName}',
      currentEmployerAddress='${currentEmployerAddress}',
      withCurrentEmployerSince='${withCurrentEmployerSince}',
      jobTitleOnceInPortugal='${jobTitleOnceInPortugal}',
      employerNameInPortugal='${employerNameInPortugal}',
      employerAddressInPortutal='${employerAddressInPortutal}',
      monthlySalaryInPortugal='${monthlySalaryInPortugal}',
      otherIncomeSources='${otherIncomeSources}',
      expectedTravelDateToPortugal='${expectedTravelDateToPortugal}',
      expectedDurationOfStayInPortugal='${expectedDurationOfStayInPortugal}',
      obtainedImmigrationPreviously='${obtainedImmigrationPreviously}',
      obtainedImmigrationPreviouslyDetails='${obtainedImmigrationPreviouslyDetails}',
      refusedVisa='${refusedVisa}',
      refusedVisaDetails='${refusedVisaDetails}',
      otherField1='${otherField1}',
      otherField2='${otherField2}'
      WHERE id='${id}'
      `);
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
      conf4,
      conf5,
      conf6,
      conf7,
      conf8,
      conf9,
      conf10,
      conf11,
      conf12,
      conf13,
      conf14,
      conf15,
      conf16,
      conf17,
      conf18,
      conf19,
      conf20,
    } = configuration;
    return await query(`UPDATE configurations SET
      conf1='${conf1}', conf2='${conf2}', conf3='${conf3}', conf4='${conf4}', conf5='${conf5}',
      conf6='${conf6}', conf7='${conf7}', conf8='${conf8}', conf9='${conf9}', conf10='${conf10}',
      conf11='${conf11}', conf12='${conf12}', conf13='${conf13}', conf14='${conf14}', conf15='${conf15}',
      conf16='${conf16}', conf17='${conf17}', conf18='${conf18}', conf19='${conf19}', conf20='${conf20}'
      WHERE id='${id}'
    `);
  } finally {
    conn.end();
  }
}

async function updateServiceFile(data) {
  const { conn, query } = getMySqlDBConnection();
  try {
    const { id, status } = data;
    return await query(`UPDATE services SET status='${status}' WHERE id='${id}'
    `);
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

async function userStatus(id) {
  const { conn, query } = getMySqlDBConnection();
  try {
    return await query(`SELECT * FROM users WHERE id='${id}'`);
  } finally {
    conn.end();
  }
}

async function getRequiredDocuments(id) {
  const { conn, query } = getMySqlDBConnection();
  try {
    return await query(`SELECT * FROM required_documents WHERE id='${id}'`);
  } finally {
    conn.end();
  }
}

async function insertRequiredDocuments(data) {
  const { conn, query } = getMySqlDBConnection();
  try {
    const { id, documents, otherField1, otherField2 } = data;
    return await query(
      `INSERT INTO required_documents VALUES('${id}','${documents}','${otherField1}','${otherField2}')`
    );
  } finally {
    conn.end();
  }
}

async function updateRequiredDocuments(data) {
  const { conn, query } = getMySqlDBConnection();
  try {
    const { id, documents, otherField1, otherField2 } = data;
    return await query(`UPDATE required_documents SET
      documents='${documents}',
      otherField1='${otherField1}',
      otherField2='${otherField2}'
      WHERE id='${id}'
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

  
  createProfile: createProfile,
  deleteCompanyProfile: deleteCompanyProfile,
  getCompanyProfile: getCompanyProfile,
  updateProfile: updateProfile,
  getAllServices: getAllServices,
  getAllServicesById: getAllServicesById,
  getAllServicesByCompanyId: getAllServicesByCompanyId,
  getAllServicesByUserId: getAllServicesByUserId,
  createService: createService,
  updateServiceComment: updateServiceComment,
  createApplicantInformation: createApplicantInformation,
  getApplicantInformation: getApplicantInformation,
  updateApplicantInformation: updateApplicantInformation,
  getConfigurations: getConfigurations,
  updateConfiguration: updateConfiguration,
  updateServiceFile: updateServiceFile,
  updatePasswordReset: updatePasswordReset,
  ifEmailAlreadyExist: ifEmailAlreadyExist,
  userStatus: userStatus,
  getRequiredDocuments: getRequiredDocuments,
  insertRequiredDocuments: insertRequiredDocuments,
  updateRequiredDocuments: updateRequiredDocuments,
};
