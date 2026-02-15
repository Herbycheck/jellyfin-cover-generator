import type { JFItem, JFLibrary } from "./types/jellyfin";

export class JFApi {
    baseUrl: string;
    apiKey: string;
    constructor(baseUrl: string, apikey: string) {
        this.baseUrl = baseUrl.replace(/\/$/, ""); // Removes trailing slash
        this.apiKey = apikey;
    }

    async fetchApi(url: string) {
        const fullUrl = this.baseUrl + url;

        return await fetch(fullUrl, {
            headers: {
                "Authorization": `MediaBrowser Client="Jellyfin Cover", Device="Yes", DeviceId="TW96aWxsYS81LjAgKFgxMTsgTGludXggeDg2XzY0OyBydjo5NC4wKSBHZWNrby8yMDEwMDEwMSBGaXJlZm94Lzk0LjB8MTYzODA1MzA2OTY4Mw11", Version="1.0.0", Token="${this.apiKey}"`
            }
        })
    }

    async getLibraries(): Promise<Array<JFLibrary>> {
        const response = await this.fetchApi("/Library/VirtualFolders")
        const json = await response.json();

        const libraries: JFLibrary[] = [];

        for (const libraryData of json) {
            const library: JFLibrary = {
                name: libraryData.Name,
                id: libraryData.ItemId,
                imageUrl: `${this.baseUrl}/Items/${libraryData.ItemId}/Images/Primary`
            }

            libraries.push(library);
        }

        return libraries;
    }

    async getLibrary(id: string): Promise<JFLibrary | undefined> {
        const libraries = await this.getLibraries();

        return libraries.find(x => x.id == id);
    }

    async getLibraryItems(library_id: string): Promise<Array<JFItem>> {
        const content = await this.fetchApi(`/Items?ParentId=${library_id}`)

        const items = (await content.json()).Items

        const mapped = items.map((x: { Name: string; Id: string; }) =>
        ({
            name: x.Name,
            imageUrl: `${this.baseUrl}/Items/${x.Id}/Images/Primary`
        }))

        return mapped;
    }
}