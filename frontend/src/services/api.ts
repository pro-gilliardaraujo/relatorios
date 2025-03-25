import axios from 'axios'
import { ProcessedData } from '@/types'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'
})

export async function processFile(file: File): Promise<ProcessedData> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await api.post<ProcessedData>('/reports/process', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })

  return response.data
}

export async function uploadImage(file: File) {
  const formData = new FormData()
  formData.append('file', file)

  const response = await api.post('/images/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })

  return response.data
}

export async function uploadBase64Image(base64Data: string) {
  const response = await api.post('/images/upload', {
    base64_image: {
      data: base64Data
    }
  })

  return response.data
} 