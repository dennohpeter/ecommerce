import { Pool } from 'pg';
import { config } from '../config';

const { database, host, password, port, user } = config;

const pool = new Pool({
  user,
  password,
  host,
  port,
  database,
});

export const query = async (text: string, params: any[]) => {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log('executed query', { text, duration, rows: res.rowCount });
  return res;
};

export const connect = () => pool.connect();
