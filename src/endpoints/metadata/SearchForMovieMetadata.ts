import { EventEmitter } from "events";
import { ValidationChain, query } from "express-validator";
import { GetEndpoint } from "../../lib/Endpoint";
import { RequestData } from "../../types/RequestData";
import { TmdbMetadataClient } from "../../lib/api/tmdb/TmdbMetadataClient";
import { MetadataClient, MinifiedMovieMetadata } from "../../lib/api/MetadataClient";

interface Query {
  query: string;
}

export class SearchForMovieMetadataEndpoint extends GetEndpoint {
  private metadataClient: MetadataClient;

  constructor(emitter: EventEmitter) {
    super('/movie/search', emitter);
    this.metadataClient = new TmdbMetadataClient('19065a8218d4c104a51afcc3e2a9b971');
    this.setAuthRequired(false);
  }

  protected getValidator(): ValidationChain[] {
    return [
      query('query').isString().notEmpty()
    ]
  }
  protected execute(data: RequestData<unknown, Query, unknown>): Promise<MinifiedMovieMetadata[]> {
    return this.metadataClient.searchMovieMetadata(data.query.query);
  }
}