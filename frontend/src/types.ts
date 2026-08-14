export type Course = {
  id: number
  title: string
  description: string
  createdAt: string
  totalLessons?: number
  completedLessons?: number
  progress?: number
  lessons?: Lesson[]
}

export type Lesson = {
  id: number
  courseId: number
  title: string
  isCompleted: boolean
  description?: string
  createdAt: string
}

export type CreateCourseInput = {
  title: string
  description?: string
}

export type UpdateCourseInput = {
  title?: string
  description?: string
}

export type CreateLessonInput = {
  title: string
  description?: string
}

export type UpdateLessonInput = {
  isCompleted?: boolean
  title?: string
  description?: string
}
