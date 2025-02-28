

export class CustomError extends Error {
    success: boolean
    statusCode: number
    status: string
    isOperational: boolean

    constructor(message: string, statusCode: number) {
        super(message)
        this.status = statusCode >= 400 && statusCode < 500 ? 'fail' : 'error'
        this.success = false
        this.statusCode = statusCode
        this.isOperational = true

        Error.captureStackTrace(this, CustomError)

    }

}