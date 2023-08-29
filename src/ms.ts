import mysql from 'mysql2';
import { QueryManager } from './index';

const con = mysql.createConnection({
    host: 'localhost',
    database: 'nodejsmysql',
    user: 'root',
    password: '',
    port: 3306
});

const qm = new QueryManager('users', con);

qm.where('name', '=', 'oke');
qm.andWhere('age', '=', '20');

console.log(qm.compileQuerySelect());