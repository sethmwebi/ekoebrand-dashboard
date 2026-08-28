import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Typography } from "@mui/material";
import { CheckIcon, ChevronsUpDownIcon, PlusIcon, XIcon } from "lucide-react";
import {
  ProductSchema,
  type ProductFormData,
  type ProductFormInput,
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
import { FormError } from "~/helpers/form-error";
import { ScrollArea } from "./ui/scroll-area";
import { useDropzone } from "react-dropzone";
import Cropper from "react-easy-crop";
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

interface ProductCreateFormProps {
  categories: Category[];
  tags: Tag[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function ProductCreateForm({
  categories,
  tags,
  isOpen,
  setIsOpen,
}: ProductCreateFormProps) {
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

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
      if (cropImage) URL.revokeObjectURL(cropImage);
    };
  }, [imagePreviews, cropImage]);

  const form = useForm<ProductFormInput, any, ProductFormData>({
    resolver: zodResolver(ProductSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      stock: 0,
      images: undefined,
      categoryId: "",
      tagIds: [],
    },
  });

  // Create product mutation with React Query
  const createProductMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/v1/api/product`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch products query
      queryClient.invalidateQueries({ queryKey: ["products"] });
      // Reset form and close dialog
      handleClose();
    },
    onError: (error) => {
      console.error("Error creating product:", error);
    },
  });

  const onSubmit = async (data: ProductFormData) => {
    const formData = new FormData();
    formData.append("intent", "create");
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("price", data.price.toString());
    formData.append("stock", data.stock.toString());
    formData.append("categoryId", data.categoryId || "");
    formData.append("tagIds", JSON.stringify(data.tagIds || []));

    if (data.images) {
      Array.from(data.images).forEach((file) => {
        formData.append("images", file);
      });
    }

    createProductMutation.mutate(formData);
  };

  const handleClose = () => {
    // Clean up image previews
    imagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
    setImagePreviews([]);
    setCropImage(null);
    setCurrentFile(null);
    // Reset form
    form.reset();
    // Close dialog
    setIsOpen(false);
  };

  // Image cropping functions
  const cropImageToFile = async (
    imageSrc: string,
    croppedAreaPixels: { x: number; y: number; width: number; height: number },
    originalFile: File
  ): Promise<File> => {
    const image = new Image();
    image.src = imageSrc;
    await new Promise((resolve) => (image.onload = resolve));

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;

    ctx?.drawImage(
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
          if (blob) {
            const croppedFile = new File([blob], originalFile.name, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            resolve(croppedFile);
          }
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
      // Add existing files if any
      if (form.getValues("images")) {
        Array.from(form.getValues("images") as FileList).forEach((file) => {
          dataTransfer.items.add(file);
        });
      }

      form.setValue("images", dataTransfer.files);
      form.clearErrors("images");

      // Clean up
      URL.revokeObjectURL(cropImage);
      setCropImage(null);
      setCurrentFile(null);
      setCrop({ x: 0, y: 0 });
      setCroppedAreaPixels(null);
    } catch (err) {
      console.error("Error cropping image:", err);
    }
  };

  // Dropzone configuration
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;
      const file = acceptedFiles[0];
      if (file.type.startsWith("image/")) {
        const previewUrl = URL.createObjectURL(file);
        setCropImage(previewUrl);
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
    // Add all files except the one being removed
    Array.from(form.getValues("images") as FileList).forEach((file, i) => {
      if (i !== index) {
        dataTransfer.items.add(file);
      }
    });

    form.setValue(
      "images",
      dataTransfer.files.length > 0 ? dataTransfer.files : undefined
    );
  };

  // Tag selection logic
  const selectedTagIds = form.watch("tagIds") || [];
  const handleTagSelect = (tagId: string) => {
    const newTagIds = selectedTagIds.includes(tagId)
      ? selectedTagIds.filter((id) => id !== tagId)
      : [...selectedTagIds, tagId];
    form.setValue("tagIds", newTagIds);
    setTagSearchTerm("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <PlusIcon
          className="cursor-pointer font-extrabold"
          aria-label="Add product"
        />
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] w-full overflow-hidden">
        <DialogHeader>
          <DialogTitle>Create New Product</DialogTitle>
          <DialogDescription>
            Fill in the details to add a new product
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] w-full pr-4">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4">
              {/* Name Field */}
              <div className="grid grid-cols-4 items-center gap-x-4 pr-2 pt-2 w-full">
                <Label className="text-right" htmlFor="name">
                  Name
                </Label>
                <div className="col-span-3 w-full">
                  <Input
                    id="name"
                    {...form.register("name")}
                    className="col-span-3"
                  />
                </div>
                {form.formState.errors.name && (
                  <Typography
                    sx={{
                      fontSize: 12,
                      gridColumn: "2 / 5",
                      width: "100%",
                      pt: 0.5,
                    }}
                    color="error"
                  >
                    {form.formState.errors.name.message}
                  </Typography>
                )}
              </div>

              {/* Description Field */}
              <div className="grid grid-cols-4 items-start gap-x-4 w-full">
                <Label className="text-right pt-2" htmlFor="description">
                  Description
                </Label>
                <div className="col-span-3 w-full">
                  {" "}
                  {/* Added w-full here */}
                  <TiptapEditor
                    content={form.watch("description") || ""}
                    onChange={(content) =>
                      form.setValue("description", content)
                    }
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
              <div className="grid grid-cols-4 items-center gap-x-4 pr-2">
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
                    sx={{
                      fontSize: 12,
                      gridColumn: "2 / 5",
                      width: "100%",
                      pt: 0.5,
                    }}
                    color="error"
                  >
                    {form.formState.errors.price.message}
                  </Typography>
                )}
              </div>

              {/* Stock Field */}
              <div className="grid grid-cols-4 items-center pr-2 gap-x-4">
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
                    sx={{
                      fontSize: 12,
                      gridColumn: "2 / 5",
                      width: "100%",
                      pt: 0.5,
                    }}
                    color="error"
                  >
                    {form.formState.errors.stock.message}
                  </Typography>
                )}
              </div>

              {/* Images Field */}
              <div className="grid grid-cols-4 items-start gap-x-4">
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
                        <PlusIcon className="h-8 w-8 text-[#f5f5f5]" />
                      ) : (
                        <p className="text-sm text-gray-600">
                          {isDragActive
                            ? "Drop the image here ..."
                            : "Drag & drop an image here, or click to select a file"}
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
                          style={{
                            containerStyle: { height: "100%", width: "100%" },
                          }}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            URL.revokeObjectURL(cropImage);
                            setCropImage(null);
                            setCurrentFile(null);
                            setCrop({ x: 0, y: 0 });
                            setCroppedAreaPixels(null);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          onClick={handleCropConfirm}
                          className="bg-accent-foreground"
                        >
                          Crop &amp; Add
                        </Button>
                      </div>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative h-18 w-18">
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
                        <span className="absolute bottom-1 right-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                          {index + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                  <FormError error={form.formState.errors.images} />
                </div>
              </div>

              {/* Category Field */}
              <div className="grid grid-cols-4 items-center gap-x-4 pr-2">
                <Label htmlFor="categoryId" className="text-right">
                  Category
                </Label>
                <div className="col-span-3 w-full">
                  <Select
                    onValueChange={(value) =>
                      form.setValue("categoryId", value)
                    }
                    defaultValue={form.getValues("categoryId")}
                  >
                    <SelectTrigger className="col-span-3 w-full">
                      <SelectValue placeholder="Select a category" />
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
                    sx={{
                      fontSize: 12,
                      gridColumn: "2 / 5",
                      width: "100%",
                      pt: 0.5,
                    }}
                    color="error"
                  >
                    {form.formState.errors.categoryId.message}
                  </Typography>
                )}
              </div>

              {/* Tags Field */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tagIds" className="text-right">
                  Tags
                </Label>
                <div className="col-span-3">
                  <Popover open={openTags} onOpenChange={setOpenTags}>
                    <PopoverTrigger className="max-w-full truncate" asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openTags}
                        className="min-w-full justify-between pr-2"
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
                    <PopoverContent className="w-full p-0">
                      <Command filter={() => 1}>
                        <CommandInput
                          onValueChange={setTagSearchTerm}
                          placeholder="Search tags..."
                        />
                        <CommandList>
                          <CommandEmpty>No tags found.</CommandEmpty>
                          <CommandGroup>
                            {(tagSearchTerm
                              ? tags.filter((tag) =>
                                  tag.name
                                    .toLowerCase()
                                    .includes(tagSearchTerm.toLowerCase())
                                )
                              : tags
                            ).map((tag) => (
                              <CommandItem
                                key={tag.id}
                                value={tag.name}
                                onSelect={() => {
                                  handleTagSelect(tag.id);
                                  setTagSearchTerm("");
                                }}
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
                      sx={{
                        fontSize: 12,
                        gridColumn: "2 / 5",
                        width: "100%",
                        pt: 0.5,
                      }}
                      color="error"
                    >
                      {form.formState.errors.tagIds.message}
                    </Typography>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button
                type="submit"
                className="cursor-pointer bg-accent-foreground"
                disabled={createProductMutation.isPending}
              >
                {createProductMutation.isPending ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
