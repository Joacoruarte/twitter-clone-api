import { executeQuery } from "../db.js";

export const pingForDb = async () => {
    const SQL = 'SELECT 1 + 1 AS result';
    const result = await executeQuery(SQL);
    return result;
}