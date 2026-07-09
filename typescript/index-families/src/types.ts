/**
 * Request/response shapes for index families API.
 */

export interface ChartDataPoint {
  date: string;
  value: number;
}

export interface PrimaryIndex {
  index_id: string;
  index_name: string;
  index_value: number | null;
  index_chart_data: ChartDataPoint[];
}

export interface IndexFamily {
  family_id: string;
  family_name: string;
  family_description: string;
  family_tickers: string[];
  primary_index: PrimaryIndex | null;
}

export interface PrimaryIndex {
  index_id: string;
  index_name: string;
  index_value: number | null;
  index_chart_data: ChartDataPoint[];
}

export interface IndexFamily {
  family_id: string;
  family_name: string;
  family_description: string;
  family_tickers: string[];
  primary_index: PrimaryIndex | null;
}
