import getServerSession, { type Session } from "next-auth";

import { authConfig } from "./config";

export const getSession = () => getServerSession(authConfig);

export type { Session };
