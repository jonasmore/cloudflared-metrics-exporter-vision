import { useCallback } from 'react';
import { Upload, Shield } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileLoad: (content: string, filename: string) => void;
}

export function FileUpload({ onFileLoad }: FileUploadProps) {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    []
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    []
  );

  const handleFile = (file: File) => {
    if (!file.name.endsWith('.jsonl')) {
      alert('Please upload a .jsonl file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      onFileLoad(content, file.name);
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <Card className="border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
      <CardContent className="p-12">
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="flex flex-col items-center justify-center space-y-4 text-center"
        >
          <div className="rounded-full bg-gradient-to-br from-primary to-accent p-6 shadow-lg">
            <Upload className="h-12 w-12 text-white" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">
              Drop your metrics file here
            </h3>
            <p className="text-sm text-muted-foreground">
              or click to browse for a .jsonl file
            </p>
          </div>
          <label
            htmlFor="file-upload"
            className={cn(
              "inline-flex items-center justify-center rounded-md text-sm font-medium",
              "h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90",
              "cursor-pointer transition-colors"
            )}
          >
            Choose File
            <input
              id="file-upload"
              type="file"
              accept=".jsonl"
              onChange={handleFileInput}
              className="hidden"
            />
          </label>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-4 pt-4 border-t border-border/50">
            <Shield className="h-4 w-4 text-green-500" />
            <span>All data is processed locally in your browser. Nothing is uploaded or leaves your device.</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
