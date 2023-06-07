import { DB_HOST, DB_PORT, DB_DATABASE, DB_USERNAME, DB_PASSWORD, DB_CONNECTION_STRING } from '@config';

const prepareUrl = () => {
  if (DB_CONNECTION_STRING) {
    return DB_CONNECTION_STRING
  }
  else if (DB_USERNAME && DB_PASSWORD) {
    const PASSWORD = encodeURIComponent(DB_PASSWORD);
    return `mongodb://${DB_USERNAME}:${PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_DATABASE}?authSource=admin`;
  } 
  else return `mongodb://${DB_HOST}:${DB_PORT}/${DB_DATABASE}`;
};

export const dbConnection = {
  url: prepareUrl(),
  options: {},
};
