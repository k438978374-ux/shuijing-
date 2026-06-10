import { ImagePlus, X } from "lucide-react";
import { useState } from "react";
import { resizeImageFile } from "../utils/image";

interface ImageInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function ImageInput({ value, onChange }: ImageInputProps) {
  const [error, setError] = useState("");

  async function handleFile(file: File | undefined) {
    if (!file) {
      return;
    }
    try {
      setError("");
      onChange(await resizeImageFile(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : "图片处理失败");
    }
  }

  return (
    <div className="image-input">
      {value ? <img src={value} alt="预览" /> : <div className="image-placeholder">无图片</div>}
      <div className="inline-actions">
        <label className="icon-button" title="上传图片">
          <ImagePlus size={18} />
          <input
            type="file"
            accept="image/*"
            onChange={(event) => handleFile(event.target.files?.[0])}
          />
        </label>
        {value ? (
          <button className="icon-button" type="button" title="移除图片" onClick={() => onChange("")}>
            <X size={18} />
          </button>
        ) : null}
      </div>
      {error ? <small className="error-text">{error}</small> : null}
    </div>
  );
}
