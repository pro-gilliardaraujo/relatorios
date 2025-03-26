declare namespace GeoJSON {
  export type Position = number[];
  
  export interface Geometry {
    type: string;
    coordinates: Position | Position[] | Position[][] | Position[][][];
  }
  
  export interface Feature {
    type: "Feature";
    geometry: Geometry;
    properties: {
      [key: string]: any;
    };
  }
  
  export interface FeatureCollection {
    type: "FeatureCollection";
    features: Feature[];
  }
} 