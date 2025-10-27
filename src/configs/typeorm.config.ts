import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

function ensureEnvVariable(variable: string): string {
  const value = process.env[variable];

  if (!value) {
    throw new Error(`Environment variable ${variable} is not defined`);
  }

  return value;
}

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: ensureEnvVariable('DB_HOST'),
  port: parseInt(ensureEnvVariable('DB_PORT')),
  username: ensureEnvVariable('DB_USERNAME'),
  password: ensureEnvVariable('DB_PASSWORD'),
  database: ensureEnvVariable('DB_DATABASE'),
  entities: [ `${__dirname}/../**/*.entity{.ts,.js}` ],
  migrations: [ `${__dirname}/../database/migrations/*{.ts,.js}` ]
};

export const dataSource = new DataSource(dataSourceOptions);

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

export const initializeDataSource = async (): Promise<DataSource> => {
  if (dataSource.isInitialized) {
    console.log('DataSource already initialized');
    return dataSource;
  }

  const tryInitialize = async (retriesLeft: number): Promise<DataSource> => {
    try {
      await dataSource.initialize();
      console.log('Database connection established');
      return dataSource;
    } catch (error) {
      if (retriesLeft <= 0) {
        console.error('Maximum retries reached. Could not connect to the database.');
        throw error;
      }

      console.error(`Database connection failed (retries left: ${retriesLeft}):`, error);
      console.log(`Retrying in ${RETRY_DELAY / 1000} seconds...`);

      await new Promise<void>((resolve) => {
        setTimeout(resolve, RETRY_DELAY);
      });
      return tryInitialize(retriesLeft - 1);
    }
  };

  return tryInitialize(MAX_RETRIES);
};
