export class JFApi {
    baseUrl: string;
    apiKey: string;
    constructor(baseUrl: string, apikey: string) {
        this.baseUrl = baseUrl;
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

    async getLibraries(): Promise<Array<any>> {
        const libraries = await this.fetchApi("/Library/VirtualFolders")

        return await libraries.json()
    }


    async getLibraryImages(library_id: string): Promise<Array<any>> {
        const content = await this.fetchApi(`/Items?ParentId=${library_id}`)

        let items = (await content.json()).Items

        const mapped = items.map((x: { Name: string; Id: string; }) => ({ name: x.Name, imageUrl: `${this.baseUrl}/Items/${x.Id}/Images/Primary?fillWidth=250` }))

        return mapped;
    }
}