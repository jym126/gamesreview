/* eslint-disable @typescript-eslint/naming-convention */

/**
 * Portada del juego
 */
export interface Cover {
  id?: number;
  url?: string;
  image_id?: string;
  width?: number;
  height?: number;
}

/**
 * Sitios web y redes sociales vinculados
 */
export interface Website {
  id?: number;
  category?: number;
  url?: string;
  trusted?: boolean;
}

/**
 * Géneros
 */
export interface Genre {
  id?: number;
  name?: string;
  slug?: string;
}

/**
 * Plataformas
 */
export interface Platform {
  id?: number;
  name?: string;
  slug?: string;
  abbreviation?: string;
}

/**
 * Modos de juego (Singleplayer, Multiplayer, Co-op, etc.)
 */
export interface GameMode {
  id?: number;
  name?: string;
  slug?: string;
}

/**
 * Capturas de pantalla
 */
export interface Screenshot {
  id?: number;
  url?: string;
  image_id?: string;
}

/**
 * Desarrolladores / Empresas
 */
export interface Company {
  id?: number;
  name?: string;
  slug?: string;
}

export interface InvolvedCompany {
  id?: number;
  company?: Company;
  developer?: boolean;
  publisher?: boolean;
}

/**
 * Modelo de Juego (Listados y Favoritos)
 */
export interface Game {
  id: number;
  name?: string;
  summary?: string;         // Descripción general
  storyline?: string;       // Historia/Trama
  first_release_date?: number; // Timestamp Unix en segundos
  rating?: number;          // Puntuación IGDB (0-100)
  rating_count?: number;
  total_rating?: number;
  cover?: Cover;
  websites?: Website[];
  genres?: Genre[];
  platforms?: Platform[];
  screenshots?: Screenshot[];
  url?: string;            // Enlace oficial de la ficha en IGDB
  slug?: string;
  expanded?: boolean;
  
  // Propiedad auxiliar formateada en el cliente
  background_image?: string;
}

/**
 * Detalle completo del juego
 */
export interface Detalle extends Game {
  aggregated_rating?: number;
  website?: string;
  aggregated_rating_count?: number;
  game_modes?: GameMode[];
  involved_companies?: InvolvedCompany[];
  similar_games?: Game[];
  videos?: { id?: number; name?: string; video_id?: string }[];
}