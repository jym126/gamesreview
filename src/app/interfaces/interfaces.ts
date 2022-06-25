/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable eol-last */


/* eslint-disable @typescript-eslint/no-empty-interface */
export interface Game {
    count?: number;
    next?: string;
    results?: Games[];
}

export interface Games {
    id: number;
    name?: string;
    playtime?: number;
    platforms?: Platforms[];
    stores?: string;
    released?: string;
    background_image?: string;
    rating?: number;
    genres?: Genres[];
}

export interface Platforms {
    platform?: Platform;

}

export interface Platform {
    id?: number;
    name?: string;
}

export interface Genres {
    name?: string;
}


//Detalles de juegos

export interface Detalle {
    id?:                          number;
    slug?:                        string;
    name?:                        string;
    name_original?:               string;
    description?:                 string;
    metacritic?:                  null;
    metacritic_platforms?:        any[];
    released?:                    Date;
    tba?:                         boolean;
    updated?:                     Date;
    background_image?:            string;
    background_image_additional?: string;
    website?:                     string;
    rating?:                      number;
    rating_top?:                  number;
    ratings?:                     Rating[];
    reactions?:                   { [key: string]: number };
    added?:                       number;
    added_by_status?:             AddedByStatus;
    playtime?:                    number;
    screenshots_count?:           number;
    movies_count?:                number;
    creators_count?:              number;
    achievements_count?:          number;
    parent_achievements_count?:   number;
    reddit_url?:                  string;
    reddit_name?:                 string;
    reddit_description?:          string;
    reddit_logo?:                 string;
    reddit_count?:                number;
    twitch_count?:                number;
    youtube_count?:               number;
    reviews_text_count?:          number;
    ratings_count?:               number;
    suggestions_count?:           number;
    alternative_names?:           any[];
    metacritic_url?:              string;
    parents_count?:               number;
    additions_count?:             number;
    game_series_count?:           number;
    user_game?:                   null;
    reviews_count?:               number;
    saturated_color?:             string;
    dominant_color?:              string;
    parent_platforms?:            ParentPlatform[];
    platforms?:                   PlatformElement[];
    stores?:                      Store[];
    developers?:                  Developer[];
    genres?:                      Developer[];
    tags?:                        Developer[];
    publishers?:                  Developer[];
    esrb_rating?:                 EsrbRating;
    clip?:                        null;
    description_raw?:             string;
}

export interface AddedByStatus {
    yet?:     number;
    owned?:   number;
    beaten?:  number;
    toplay?:  number;
    playing?: number;
}

export interface Developer {
    id?:               number;
    name?:             string;
    slug?:             string;
    games_count?:      number;
    image_background?: string;
    domain?:          string;
    language?:        string;
}

export interface EsrbRating {
    id?:   number;
    name?: string;
    slug?: string;
}

export interface ParentPlatform {
    platform?: EsrbRating;
}

export interface PlatformElement {
    platform?:     PlatformPlatform;
    released_at?:  Date;
    requirements?: Requirements;
}

export interface PlatformPlatform {
    id?:               number;
    name?:             string;
    slug?:             string;
    image?:            null;
    year_end?:         null;
    year_start?:       number | null;
    games_count?:      number;
    image_background?: string;
}

export interface Requirements {
}

export interface Rating {
    id?:      number;
    title?:   string;
    count?:   number;
    percent?: number;
}

export interface Store {
    id?:    number;
    url?:   string;
    store?: Developer;
}
