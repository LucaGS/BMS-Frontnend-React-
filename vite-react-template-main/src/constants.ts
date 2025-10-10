export const API_BASE_URL = 'http://localhost:5290';
export const APP_NAME = 'Baum Management System';
export const DEFAULT_LANGUAGE = 'de';


export interface Baum {
  userid : number;
  id : number;
  gruenFlaechenId: number;
  nummer: number;
  art: string;
  letzteKontrolleID: number
  laengengrad: number;
    breitengrad: number;
}