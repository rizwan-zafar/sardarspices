import { existsSync } from "fs";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";

function parseDatabaseUrl(raw) {
  if (!raw) {
    throw new Error("DATABASE_URL is not set");
  }

  const url = new URL(raw.replace(/^mysql:\/\//i, "http://"));
  const database = decodeURIComponent(url.pathname.replace(/^\//, "").split("/")[0] || "");

  return {
    host: url.hostname,
    port: url.port ? Number(url.port) : 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database,
  };
}

function createPrismaClient() {
  const { host, port, user, password, database } = parseDatabaseUrl(process.env.DATABASE_URL);
  const socketPath =
    process.env.MYSQL_SOCKET && existsSync(process.env.MYSQL_SOCKET)
      ? process.env.MYSQL_SOCKET
      : undefined;
  const adapter = new PrismaMariaDb({
    ...(socketPath ? { socketPath } : { host, port }),
    user,
    password,
    database,
    connectionLimit: 5,
    connectTimeout: 15000,
    acquireTimeout: 15000,
    allowPublicKeyRetrieval: true,
  });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

const globalForPrisma = globalThis;

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
