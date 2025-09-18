import React, { useRef, useState, useCallback, forwardRef, useImperativeHandle } from "react";
import Cropper from "react-easy-crop";
import getCroppedImg from "./cropImage";

const CroppableImagePicker = forwardRef(({ onCropComplete }, ref) => {
  const inputRef = useRef(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  useImperativeHandle(ref, () => ({
    clickTrigger: () => inputRef.current?.click(),
  }));

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => setImageSrc(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const onCropCompleteInternal = useCallback((_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCrop = async () => {
  const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);

  // Convert Blob to Base64
  const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result;
      onCropComplete?.(base64data); // send base64 image to parent
      setImageSrc(null); // close the cropper
    };
    reader.readAsDataURL(croppedBlob);
  };


  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        onChange={handleFileChange}
        className="hidden"
      />
  
      {imageSrc && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex flex-col items-center justify-center">
          <div className="relative w-[200px] h-[200px] bg-white">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropCompleteInternal}
            />
          </div>
          <div className="mt-4 flex gap-5">
            <button
              className="px-5 py-2 text-[16px] w-[50px] bg-orange-500 text-white rounded hover:bg-orange-600"
              onClick={handleCrop}
            >
              Crop
            </button>
            <button
              className="px-5 py-2 text-[16px] w-[60px] bg-gray-500 text-white rounded hover:bg-gray-600"
              onClick={() => setImageSrc(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
  
});

export default CroppableImagePicker;
