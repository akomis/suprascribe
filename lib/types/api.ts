export type ApiSuccessResponse<T> = { data: T }
export type ApiErrorResponse = { error: string }
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse

export function isApiError(response: ApiResponse<unknown>): response is ApiErrorResponse {
  return 'error' in response
}
