import type {
  Course,
  CreateCourseInput,
  CreateLessonInput,
  Lesson,
  UpdateCourseInput,
  UpdateLessonInput,
} from './types'

const API_BASE = import.meta.env.VITE_API_URL ?? '/api'

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!response.ok) {
    let message = response.statusText
    try {
      const body = (await response.json()) as { error?: string }
      if (typeof body.error === 'string') {
        message = body.error
      }
    } catch {
      // 204 or non-JSON error body
    }
    throw new ApiError(message, response.status)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

export function getCourses(): Promise<Course[]> {
  return request<Course[]>('/courses')
}

export function getCourse(id: number): Promise<Course> {
  return request<Course>(`/courses/${id}`)
}

export function createCourse(data: CreateCourseInput): Promise<Course> {
  return request<Course>('/courses', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updateCourse(id: number, data: UpdateCourseInput): Promise<Course> {
  return request<Course>(`/courses/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export function deleteCourse(id: number): Promise<void> {
  return request<void>(`/courses/${id}`, { method: 'DELETE' })
}

export function getLessons(courseId: number): Promise<Lesson[]> {
  return request<Lesson[]>(`/courses/${courseId}/lessons`)
}

export function createLesson(
  courseId: number,
  data: CreateLessonInput,
): Promise<Lesson> {
  return request<Lesson>(`/courses/${courseId}/lessons`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updateLesson(id: number, data: UpdateLessonInput): Promise<Lesson> {
  return request<Lesson>(`/lessons/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export function deleteLesson(id: number): Promise<void> {
  return request<void>(`/lessons/${id}`, { method: 'DELETE' })
}
