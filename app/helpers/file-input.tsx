import { PlusIcon } from "lucide-react";
import { Label } from "~/components/ui/label";

// Replace your current FileInput component with this simpler version
export const FileInput = ({
  id,
  multiple,
  accept,
  onChange,
}: {
  id: string;
  multiple?: boolean;
  accept?: string;
  onChange: (files: FileList | null) => void;
}) => {
  return (
    <div className="relative">
      <Label
        htmlFor={id}
        className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-md border border-dashed bg-muted/50 hover:bg-muted"
      >
        <PlusIcon className="h-6 w-6" />
      </Label>
      <input
        id={id}
        type="file"
        multiple={multiple}
        accept={accept}
        className="absolute inset-0 h-full w-full opacity-0"
        onChange={(e) => onChange(e.target.files)}
      />
    </div>
  );
};
