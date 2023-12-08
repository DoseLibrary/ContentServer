const API_URL = "https://api.themoviedb.org/3";

export abstract class TmdbClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  protected request<T>(path: string, queryParams?: Object): Promise<T> {
    let url = `${API_URL}${path}?api_key=${this.apiKey}`;
    if (queryParams) {
      Object.keys(queryParams).forEach(key => {
        url += `&${key}=${queryParams[key as keyof Object]}`
      })
    }
    return fetch(encodeURI(url))
      .then(res => res.json())
      .then(data => {
        if (data.success === false) {
          throw new Error(JSON.stringify(data));
        }
        return data;
      })
  }
}