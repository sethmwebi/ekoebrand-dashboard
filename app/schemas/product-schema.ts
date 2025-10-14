import { z } from "zod";

export const ProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.number().min(0, "Price must be non-negative"),
  stock: z.number().min(0, "Stock must be a non-negative integer"),
  categoryId: z.string().min(1, "Category is required"),
  tagIds: z.array(z.string()).min(1, "Atleast one tag is required"),
  images: z
    .any() // Use any for FileList, as zod doesn't natively support FileList
    .refine(
      (files) => files instanceof FileList || Array.isArray(files),
      "Atleast one image is required"
    )
    .refine(
      (files) =>
        !files ||
        files.length === 0 ||
        Array.from(files).every((file) => file instanceof File),
      "All images must be valid files"
    ),
});

export type ProductFormInput = z.input<typeof ProductSchema>;
export type ProductFormData = z.infer<typeof ProductSchema>;

export const UpdateProductSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  description: z.string().min(1, "Description is required").optional(),
  price: z.number().min(0, "Price must be non-negative").optional(),
  stock: z
    .number()
    .int()
    .min(0, "Stock must be a non-negative integer")
    .optional(),
  categoryId: z.string().optional(),
  tagIds: z.array(z.string()).optional(),
  images: z
    .any()
    .refine(
      (files) => files instanceof FileList || Array.isArray(files),
      "Images must be a FileList or array of files"
    )
    .refine(
      (files) =>
        !files ||
        files.length === 0 ||
        Array.from(files).every((file) => file instanceof File),
      "All images must be valid files"
    )
    .optional(),
});

export type UpdateProductSchemaType = z.infer<typeof UpdateProductSchema>;
