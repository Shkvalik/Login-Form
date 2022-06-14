const bcrypt = require("bcryptjs");
require("dotenv").config();
const Pool = require('pg').Pool
//Create .env file and get data from it
const pool = new Pool({
    user: process.env.USER,
    password: process.env.PASSWORD,
    host: process.env.HOST,
    port: process.env.PORT,
    database: process.env.DATABASE
})

class DataBase {
    async createUser(email, login, real_name, password, birth_date, country, timestamp) {
        await pool.query(`INSERT INTO users(email, login, real_name, password, birth_date, country_id, user_timestamp_registration)
                          VALUES ($1, $2, $3, $4, $5, $6,
                                  $7)`, [email, login, real_name, password, birth_date, country, timestamp], (err) => {
            console.log(err)
        })
    }

    async getCountries() {
        const countrys = await pool.query(`SELECT country_name
                                           FROM country`)
        return countrys.rows
    }

    async checkUniqueData(what, column) {
        const result = await pool.query(`SELECT $1
                                         FROM users
                                         WHERE $1 = $2`, [column, what])
        return (result.rowCount === 0);
    }

    async checkPutData(inputData, password) {
        const loginOrEmail = await pool.query(`SELECT password
                                                 FROM users
                                                 WHERE email = $1
                                                    OR login = $1`, [inputData])
        if (loginOrEmail.rowCount !== 0){
            const storedPassword = await pool.query(`SELECT password
                                                 FROM users
                                                 WHERE email = $1
                                                    OR login = $1`, [inputData])
            const result =  await bcrypt.compare(password, storedPassword.rows[0].password)
            if (result) {
                return true
            } else {return 'uncorrected password'}
        } else {return 'uncorrected Login or Email'}

    }

    async getUserData(inputData) {
        const storedPassword = await pool.query(`SELECT email, real_name as name, birth_date, country_name as country
                                                 FROM users
                                                          LEFT JOIN country c on c.id = users.country_id
                                                 WHERE email = $1
                                                    OR login = $1`, [inputData])
        return storedPassword.rows[0]
    }

}


module.exports = new DataBase()
