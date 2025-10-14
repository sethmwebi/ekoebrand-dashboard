import { Typography } from "@mui/material";
import type { FieldError, Merge, FieldErrorsImpl } from "react-hook-form";

type ComplexError = Merge<FieldError, FieldErrorsImpl<any>>;
type ArrayError = Merge<FieldError, (FieldError | undefined)[]>;
type FileListError = Merge<FieldError, FieldErrorsImpl<FileList | any[]>>;

interface FormErrorProps {
  error?: FieldError | ComplexError | ArrayError | FileListError;
}

export function FormError({ error }: FormErrorProps) {
  if (!error) return null;

  // 1. Handle array errors (like tagIds)
  if (Array.isArray(error)) {
    return (
      <>
        {error.map(
          (err, index) =>
            err &&
            "message" in err &&
            typeof err.message === "string" && (
              <Typography key={index} color="error" sx={{ fontSize: 12 }}>
                {err.message}
              </Typography>
            )
        )}
      </>
    );
  }

  // 2. Handle simple field errors with message
  if (isFieldErrorWithMessage(error)) {
    return (
      <Typography color="error" sx={{ fontSize: 12 }}>
        {error.message}
      </Typography>
    );
  }

  // 3. Handle file list/array validation errors
  if (hasLengthError(error)) {
    return (
      <Typography color="error" sx={{ fontSize: 12 }}>
        {error.length.message}
      </Typography>
    );
  }

  // 4. Handle nested validation errors (like image file validation)
  const nestedError = findNestedError(error);
  if (nestedError) {
    return (
      <Typography color="error" sx={{ fontSize: 12 }}>
        {nestedError.message}
      </Typography>
    );
  }

  // 5. Fallback for any other case
  return (
    <Typography color="error" sx={{ fontSize: 12 }}>
      Invalid input
    </Typography>
  );
}

// Helper type guards
function isFieldErrorWithMessage(error: unknown): error is { message: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as any).message === "string"
  );
}

function hasLengthError(
  error: unknown
): error is { length: { message: string } } {
  return (
    typeof error === "object" &&
    error !== null &&
    "length" in error &&
    isFieldErrorWithMessage((error as any).length)
  );
}

function findNestedError(error: unknown): { message: string } | undefined {
  if (typeof error !== "object" || error === null) return undefined;

  for (const value of Object.values(error)) {
    if (isFieldErrorWithMessage(value)) {
      return value;
    }
  }
  return undefined;
}
