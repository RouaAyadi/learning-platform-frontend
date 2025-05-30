'use client'

import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

const schema = yup.object({
  title: yup.string().required('Title is required'),
  description: yup.string().required('Description is required'),
  startDate: yup.string().required('Start date is required'),
  endDate: yup.string().required('End date is required'),
}).required()

type FormData = yup.InferType<typeof schema>

type Props = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: FormData) => void
}

export default function CreateCourseModal({ isOpen, onClose, onSubmit }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  })

  const handleFormSubmit = (data: FormData) => {
    onSubmit(data)
    reset()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">Create New Course</h3>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Title</span>
            </label>
            <input
              type="text"
              {...register('title')}
              className="input input-bordered"
              placeholder="Course title"
            />
            {errors.title && (
              <span className="text-error text-sm mt-1">{errors.title.message}</span>
            )}
          </div>

          <div className="form-control mt-4">
            <label className="label">
              <span className="label-text">Description</span>
            </label>
            <textarea
              {...register('description')}
              className="textarea textarea-bordered"
              placeholder="Course description"
            />
            {errors.description && (
              <span className="text-error text-sm mt-1">{errors.description.message}</span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Start Date</span>
              </label>
              <input
                type="date"
                {...register('startDate')}
                className="input input-bordered"
              />
              {errors.startDate && (
                <span className="text-error text-sm mt-1">{errors.startDate.message}</span>
              )}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">End Date</span>
              </label>
              <input
                type="date"
                {...register('endDate')}
                className="input input-bordered"
              />
              {errors.endDate && (
                <span className="text-error text-sm mt-1">{errors.endDate.message}</span>
              )}
            </div>
          </div>

          <div className="modal-action">
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Course
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 