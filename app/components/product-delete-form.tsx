import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Trash2Icon, XIcon } from "lucide-react";
import { useTheme } from "~/providers/theme-provider";
import { useEffect } from "react";

interface ProductDeleteFormProps {
  selectedRows: string[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onDelete: (ids: string[]) => void;
  isDeleting?: boolean;
}

export function ProductDeleteForm({
  selectedRows,
  isOpen,
  setIsOpen,
  onDelete,
  isDeleting = false,
}: ProductDeleteFormProps) {
  const { isDarkMode } = useTheme();

  const handleDelete = () => {
    if (selectedRows.length > 0) {
      onDelete(selectedRows);
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (!isDeleting && isOpen && selectedRows.length === 0) {
      setIsOpen(false);
    }
  }, [isDeleting, selectedRows, isOpen, setIsOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="destructive"
          disabled={selectedRows.length === 0}
          aria-label="Delete selected products"
          className={
            isDarkMode
              ? "border-gray-600 text-gray-200 cursor-pointer"
              : "border-gray-300 text-gray-700 cursor-pointer"
          }
        >
          <Trash2Icon className="h-4 w-4 text-white dark:text-shadow-white" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-background">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Delete Products
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Are you sure you want to delete {selectedRows.length} product
            {selectedRows.length !== 1 ? "s" : ""}? This action cannot be
            undone.
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
              onClick={handleDelete}
              variant="destructive"
              disabled={isDeleting || selectedRows.length === 0}
              className="bg-red-600 text-white hover:bg-red-700 cursor-pointer"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </div>
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
