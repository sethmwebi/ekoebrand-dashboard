import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { CheckIcon, ChevronsUpDownIcon, PlusIcon, XIcon } from "lucide-react";
import {
  UpdateProductSchema,
  type UpdateProductSchemaType,
} from "~/schemas/product-schema";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { useCallback, useEffect, useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { cn } from "~/lib/utils";
import { ScrollArea } from "./ui/scroll-area";
import { useDropzone } from "react-dropzone";
import Cropper from "react-easy-crop";
import { Typography } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { TiptapEditor } from "./tip-tap";

interface Category {
  id: string;
  name: string;
}

interface Tag {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  categoryId: string;
  tags: {
    productId: string;
    tagId: string;
    tag: Tag;
  }[];
}

interface ProductEditFormProps {
  product: Product | null;
  categories: Category[];
  tags: Tag[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function ProductEditForm({
  product,
  categories,
  tags,
  isOpen,
  setIsOpen,
}: ProductEditFormProps) {
  const queryClient = useQueryClient();
  const [openTags, setOpenTags] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [tagSearchTerm, setTagSearchTerm] = useState("");
  const [isFormDirty, setIsFormDirty] = useState(false);

  const form = useForm<UpdateProductSchemaType>({
    resolver: zodResolver(UpdateProductSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      stock: 0,
      images: undefined,
      categoryId: "",
      tagIds: [],
    },
    mode: "onChange",
  });

  useEffect(() => {
    const subscription = form.watch((values, { name }) => {
      if (name) {
        setIsFormDirty(true);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Initialize form with product data
  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        description: product.description,
        price: product.price / 100,
        stock: product.stock,
        categoryId: product.categoryId,
        tagIds: product.tags.map((t) => t.tagId),
      });
      setImagePreviews(product.images || []);
    }
  }, [product, form]);

  // Clean up object URLs
  useEffect(() => {
    return () => {
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
      if (cropImage) URL.revokeObjectURL(cropImage);
    };
  }, [imagePreviews, cropImage]);

  const updateMutation = useMutation({
    mutationFn: async (data: { id: string; formData: FormData }) => {
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/v1/api/product/${data.id}`,
        data.formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      handleClose();
    },
    onError: (error) => {
      console.error("Error updating product:", error);
    },
  });

  const handleFormSubmit = (data: UpdateProductSchemaType) => {
    if (!product) return;

    const formData = new FormData();
    if (data.name) formData.append("name", data.name);
    if (data.description) formData.append("description", data.description);
    if (data.price) formData.append("price", data.price.toString());
    if (data.stock) formData.append("stock", data.stock.toString());
    if (data.categoryId) formData.append("categoryId", data.categoryId);
    formData.append("tagIds", JSON.stringify(data.tagIds));

    if (data.images) {
      Array.from(data.images).forEach((file) => {
        formData.append("images", file);
      });
    }
    formData.forEach((item) => console.log(item));

    updateMutation.mutate({ id: product.id, formData });
  };

  const handleClose = () => {
    form.reset();
    setImagePreviews([]);
    setCropImage(null);
    setIsOpen(false);
  };

  const cropImageToFile = async (
    imageSrc: string,
    croppedAreaPixels: { x: number; y: number; width: number; height: number },
    originalFile: File
  ): Promise<File> => {
    const image = new Image();
    image.src = imageSrc;
    await new Promise((resolve) => {
      image.onload = resolve;
    });

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not get canvas context");

    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;

    ctx.drawImage(
      image,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      croppedAreaPixels.width,
      croppedAreaPixels.height
    );

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) throw new Error("Could not create blob from canvas");
          const croppedFile = new File([blob], originalFile.name, {
            type: "image/jpeg",
            lastModified: Date.now(),
          });
          resolve(croppedFile);
        },
        "image/jpeg",
        0.8
      );
    });
  };

  const onCropComplete = useCallback(
    (_croppedArea: any, croppedAreaPixels: any) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleCropConfirm = async () => {
    if (!cropImage || !croppedAreaPixels || !currentFile) return;

    try {
      const croppedFile = await cropImageToFile(
        cropImage,
        croppedAreaPixels,
        currentFile
      );

      const newPreviews = [...imagePreviews, URL.createObjectURL(croppedFile)];
      setImagePreviews(newPreviews);

      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(croppedFile);

      const currentImages = form.getValues("images");
      if (currentImages) {
        Array.from(currentImages).forEach((file) => {
          dataTransfer.items.add(file);
        });
      }

      form.setValue("images", dataTransfer.files);
      form.trigger("images");
      setIsFormDirty(true);

      setCropImage(null);
      setCurrentFile(null);
    } catch (err) {
      console.error("Error cropping image:", err);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;
      const file = acceptedFiles[0];
      if (file.type.startsWith("image/")) {
        setCropImage(URL.createObjectURL(file));
        setCurrentFile(file);
      }
    },
    accept: { "image/*": [] },
    multiple: false,
  });

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]);
    const newPreviews = [...imagePreviews];
    newPreviews.splice(index, 1);
    setImagePreviews(newPreviews);

    const dataTransfer = new DataTransfer();
    const currentImages = form.getValues("images");
    if (currentImages) {
      Array.from(currentImages).forEach((file, i) => {
        if (i !== index) dataTransfer.items.add(file);
      });
    }

    form.setValue(
      "images",
      dataTransfer.files.length > 0 ? dataTransfer.files : undefined
    );
    form.trigger("images");
  };

  const selectedTagIds = form.watch("tagIds") || [];
  const handleTagSelect = (tagId: string) => {
    const newTagIds = selectedTagIds.includes(tagId)
      ? selectedTagIds.filter((id) => id !== tagId)
      : [...selectedTagIds, tagId];
    form.setValue("tagIds", newTagIds);
    setTagSearchTerm("");
    form.trigger("tagIds");
  };

  const isSubmitting = updateMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-h-[90vh] w-full overflow-hidden">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>Update product details</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] w-full pr-4">
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="space-y-4"
          >
            {/* Name Field */}
            <div className="grid grid-cols-4 items-center gap-x-4 pr-2 pt-2 w-full">
              <Label className="text-right" htmlFor="name">
                Name
              </Label>
              <div className="col-span-3 w-full">
                <Input id="name" {...form.register("name")} />
              </div>
              {form.formState.errors.name && (
                <Typography
                  color="error"
                  sx={{ fontSize: 12, gridColumn: "2 / 5" }}
                >
                  {form.formState.errors.name.message}
                </Typography>
              )}
            </div>

            {/* Description Field */}
            <div className="grid grid-cols-4 items-start gap-x-4 pr-2 pt-2 w-full">
              <Label className="text-right pt-2" htmlFor="description">
                Description
              </Label>
              <div className="col-span-3 w-full focus-visible:ring-accent focus-visible:ring-2 rounded-md">
                <TiptapEditor
                  content={form.watch("description") || ""}
                  onChange={(content) => form.setValue("description", content)}
                />
                {form.formState.errors.description && (
                  <Typography
                    sx={{
                      fontSize: 12,
                      width: "100%",
                      pt: 0.5,
                    }}
                    color="error"
                  >
                    {form.formState.errors.description.message}
                  </Typography>
                )}
              </div>
            </div>

            {/* Price Field */}
            <div className="grid grid-cols-4 items-center gap-x-4 pr-2 pt-2 ">
              <Label htmlFor="price" className="text-right">
                Price
              </Label>

              <div className="col-span-3 w-full">
                <Input
                  id="price"
                  type="number"
                  {...form.register("price", { valueAsNumber: true })}
                  className="col-span-3"
                />
              </div>
              {form.formState.errors.price && (
                <Typography
                  color="error"
                  sx={{ fontSize: 12, gridColumn: "2 / 5" }}
                >
                  {form.formState.errors.price.message}
                </Typography>
              )}
            </div>

            {/* Stock Field */}
            <div className="grid grid-cols-4 items-center gap-x-4 pr-2 pt-2">
              <Label htmlFor="stock" className="text-right">
                Stock
              </Label>

              <div className="col-span-3 w-full">
                <Input
                  id="stock"
                  type="number"
                  min={0}
                  {...form.register("stock", { valueAsNumber: true })}
                  className="col-span-3"
                />
              </div>
              {form.formState.errors.stock && (
                <Typography
                  color="error"
                  sx={{ fontSize: 12, gridColumn: "2 / 5" }}
                >
                  {form.formState.errors.stock.message}
                </Typography>
              )}
            </div>

            {/* Images Field */}
            <div className="grid grid-cols-4 items-start gap-x-4 pr-2 pt-2">
              <Label className="text-right pt-2" htmlFor="images">
                Images
              </Label>
              <div className="col-span-3">
                {!cropImage ? (
                  <div
                    {...getRootProps()}
                    className={cn(
                      "border-2 border-dashed rounded-md p-4 text-center cursor-pointer",
                      isDragActive
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300",
                      imagePreviews.length > 0
                        ? "flex items-center justify-center h-12"
                        : ""
                    )}
                  >
                    <input {...getInputProps()} id="images" />
                    {imagePreviews.length > 0 ? (
                      <PlusIcon className="h-8 w-8 text-muted-foreground" />
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {isDragActive
                          ? "Drop image here"
                          : "Drag & drop or click to select"}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="relative h-64 w-full rounded-md overflow-hidden">
                      <Cropper
                        image={cropImage}
                        crop={crop}
                        aspect={1}
                        onCropChange={setCrop}
                        onCropComplete={onCropComplete}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          URL.revokeObjectURL(cropImage);
                          setCropImage(null);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button type="button" onClick={handleCropConfirm}>
                        Confirm Crop
                      </Button>
                    </div>
                  </div>
                )}
                <div className="flex flex-wrap gap-2 mt-2">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative h-20 w-20">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="h-full w-full rounded-md object-cover border"
                      />
                      <button
                        type="button"
                        className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                        onClick={() => removeImage(index)}
                      >
                        <XIcon className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
                {form.formState.errors.images && (
                  <Typography
                    color="error"
                    sx={{ fontSize: 12, gridColumn: "2 / 5" }}
                  >
                    {form.formState.errors.images.message}
                  </Typography>
                )}
              </div>
            </div>

            {/* Category Field */}
            <div className="grid grid-cols-4 items-center pr-2 pt-2 gap-x-4">
              <Label htmlFor="categoryId" className="text-right">
                Category
              </Label>
              <div className="col-span-3 w-full">
                <Select
                  onValueChange={(value) => {
                    form.setValue("categoryId", value);
                    form.trigger("categoryId");
                  }}
                  value={form.watch("categoryId")}
                >
                  <SelectTrigger className="col-span-3 w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {form.formState.errors.categoryId && (
                <Typography
                  color="error"
                  sx={{ fontSize: 12, gridColumn: "2 / 5" }}
                >
                  {form.formState.errors.categoryId.message}
                </Typography>
              )}
            </div>

            {/* Tags Field */}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="tagIds" className="text-right pt-2">
                Tags
              </Label>
              <div className="col-span-3">
                <Popover open={openTags} onOpenChange={setOpenTags}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openTags}
                      className="w-full justify-between"
                    >
                      {selectedTagIds.length > 0
                        ? tags
                            .filter((tag) => selectedTagIds.includes(tag.id))
                            .map((tag) => tag.name)
                            .join(", ")
                        : "Select tags..."}
                      <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0">
                    <Command>
                      <CommandInput
                        placeholder="Search tags..."
                        value={tagSearchTerm}
                        onValueChange={setTagSearchTerm}
                      />
                      <CommandList>
                        <CommandEmpty>No tags found</CommandEmpty>
                        <CommandGroup>
                          {tags
                            .filter((tag) =>
                              tag.name
                                .toLowerCase()
                                .includes(tagSearchTerm.toLowerCase())
                            )
                            .map((tag) => (
                              <CommandItem
                                key={tag.id}
                                value={tag.id}
                                onSelect={() => handleTagSelect(tag.id)}
                              >
                                <CheckIcon
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedTagIds.includes(tag.id)
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {tag.name}
                              </CommandItem>
                            ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {form.formState.errors.tagIds && (
                  <Typography
                    color="error"
                    sx={{ fontSize: 12, gridColumn: "2 / 5" }}
                  >
                    {form.formState.errors.tagIds.message}
                  </Typography>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={!isFormDirty || isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
