/**
 * Types for the attestation API endpoint.
 */

export interface AttestationResponse {
  event_id: string;
  start_time: string;
  end_time: string;
  finalised_time: string | null;
  outcome: Record<string, unknown> | null;
}
