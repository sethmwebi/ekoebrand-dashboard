import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { XIcon } from "lucide-react";
import { useTheme } from "~/providers/theme-provider";

interface SingleProductDeleteFormProps {
  productId: string | null;
  productName: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

export function SingleProductDeleteForm({
  productId,
  productName,
  isOpen,
  setIsOpen,
  onDelete,
  isDeleting = false,
}: SingleProductDeleteFormProps) {
  const { isDarkMode } = useTheme();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!productId) return;
    onDelete(productId);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md bg-background">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Delete Product
          </DialogTitle>
        </DialogHeader>
        <form
          id="single-delete-form"
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Are you sure you want to delete "{productName}"? This action cannot
            be undone.
          </p>
          <DialogFooter>
            <DialogClose asChild>
              <Button
                variant="outline"
                disabled={isDeleting}
                className={
                  isDarkMode
                    ? "border-gray-600 text-gray-200"
                    : "border-gray-300 text-gray-700"
                }
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              variant="destructive"
              disabled={isDeleting || !productId}
              className="bg-red-600 text-white hover:bg-red-700 cursor-pointer"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </form>
        <DialogClose asChild>
          <button
            className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label="Close"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
