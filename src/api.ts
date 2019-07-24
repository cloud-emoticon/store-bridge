export interface GitHubFile {
    path: string
}

export interface MetaResponse {
    name: string,
    location: {
        type: "localJson" | "localXml" | "remoteJson",
        remoteUrl?: string
    },
    description: string,
    author: {
        name: string,
        url?: string,
        avatarUrl?: string
    }
}