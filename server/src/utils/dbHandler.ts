import sql, { config as SqlConfig, ISqlType, IResult } from "mssql";
import dotenv from "dotenv";

dotenv.config();

const config: SqlConfig = {
  server: process.env.DB_SERVER || "localhost",
  database: process.env.DB_NAME || "riomar",
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

interface InputParameter {
  name: string;
  type: ISqlType;
  value: any;
}

interface OutputParameter {
  name: string;
  type: ISqlType;
}

interface ExecuteRequestParams {
  query: string;
  inputs?: InputParameter[];
  outputs?: OutputParameter[];
  isStoredProcedure?: boolean;
}

let poolPromise: Promise<sql.ConnectionPool> | null = null;

function getPool(): Promise<sql.ConnectionPool> {
  if (!poolPromise) {
    poolPromise = new sql.ConnectionPool(config)
      .connect()
      .then((pool: sql.ConnectionPool) => {
        console.log("Conectado a la base de datos");
        return pool;
      })
      .catch((err: Error) => {
        console.error("Error al conectar a la base de datos:", err);
        poolPromise = null; // Reset para permitir reintentos
        throw err;
      });
  }
  return poolPromise as Promise<sql.ConnectionPool>;
}

export async function executeRequest({
  query,
  inputs = [],
  outputs = [],
  isStoredProcedure = false,
}: ExecuteRequestParams): Promise<IResult<any>> {
  //console.log("Parámetros enviados al SP:", inputs); <--  PARA VER QUE INPUTS ESTOY ENVIANDO
  try {
    const pool = await getPool();
    const request = pool.request();

    // Agregar parámetros de entrada
    inputs.forEach(({ name, type, value }) => {
      request.input(name, type, value);
    });

    // Agregar parámetros de salida
    outputs.forEach(({ name, type }) => {
      request.output(name, type);
    });

    const result = isStoredProcedure
      ? await request.execute(query)
      : await request.query(query);

    return result;
  } catch (error) {
    console.error("Error en executeRequest:", error);
    throw error;
  }
}

export { sql };
