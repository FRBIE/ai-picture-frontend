// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** testHealth GET /api/health */
export async function testHealthUsingGet(options?: { [key: string]: any }) {
  return request<API.BaseResponseString_>('/api/health', {
    method: 'GET',
    ...(options || {}),
  })
}
