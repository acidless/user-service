class HttpError extends Error {
    public constructor(public readonly code: number, message: string) {
        super(message);
    }
}

export default HttpError;