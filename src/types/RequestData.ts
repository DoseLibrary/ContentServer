import { UserAgent } from "../util/http";
import { IncomingHttpHeaders } from 'http';

// Can we change from unknown somehow?
export interface RequestData<Body = unknown, Query = unknown, Params = unknown> {
  body: Body;
  query: Query;
  params: Params;
  headers: IncomingHttpHeaders
  userId: number;
  userAgent: UserAgent;
}