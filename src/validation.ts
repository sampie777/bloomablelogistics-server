export namespace Validation {
    export class ValidationError extends Error {
    }

    export const validate = (result: boolean, message?: string) => {
        if (result) return;
        throw new ValidationError(message)
    }
}
