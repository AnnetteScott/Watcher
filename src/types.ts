export const userData = {
    bookShelf: {'Unsorted': []},
    books: {},
    movies: {},
    tvShows: {},
    shelfNames: ['Unsorted']
} as UserData


export interface UserData {
    movies: {
        [key: string]: {
            name: string,
            watched: boolean,
        }
    },
    tvShows: {
        [key: string]: {
            name: string,
            seasons: {
                [key: string]: {
                    [key: string]: boolean
                }
            }
        }
    },
    books: {
        [key: string]: BookInfo
    },
    bookShelf: {
        [key: string]: string[]
    },
    shelfNames: string[]
}


export interface BookVolume {
    kind: string,
    totalItems: number,
    items: Item[]
}

export interface Item {
    kind: string,
    id: string,
    etag: string,
    selfLink: string
    volumeInfo: {
        title: string,
        authors: string[],
        publisher: string,
        publishedDate: string,
        description: string,
        industryIdentifiers: [
        {
            type: string,
            identifier: string
        }
        ],
        readingModes: {
            text: boolean,
            image: boolean
        },
        pageCount: number,
        printType: string,
        categories: string[],
        averageRating: number,
        ratingsCount: number,
        maturityRating: string,
        allowAnonLogging: boolean,
        contentVersion: string,
        panelizationSummary: {
            containsEpubBubbles: boolean,
            containsImageBubbles: boolean
        },
        imageLinks: {
            smallThumbnail: string,
            thumbnail: string
        },
        language: string,
        previewLink: string,
        infoLink: string,
        canonicalVolumeLink: string
    },
    saleInfo: {
        country: string,
        saleability: string,
        isEbook: boolean
    },
    accessInfo: {
        country: string,
        viewability: string,
        embeddable: boolean,
        publicDomain: boolean,
        textToSpeechPermission: string,
        epub: {
            isAvailable: boolean
        },
        pdf: {
            isAvailable: boolean
        },
        webReaderLink: string,
        accessViewStatus: string,
        quoteSharingAllowed: boolean
    },
    searchInfo: {
        textSnippet: string
    }
}

export interface BookInfo {
    title: string,
    bookShelf: string,
    authors: string[],
    publisher: string,
    ISBN: string,
    pageCount: number,
    thumbnail: string,
    read: boolean,
    reading: boolean,
    currentPage: string
}