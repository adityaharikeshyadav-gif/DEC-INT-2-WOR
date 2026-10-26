import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ExperienceGalleryProps {
  images: string[];
}

export const ExperienceGallery: React.FC<ExperienceGalleryProps> = ({ images }) => {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + images.length) % images.length);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % images.length);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        Gallery
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {images.map((img, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.02 }}
            onClick={() => setLightboxIndex(index)}
            className="relative h-28 sm:h-36 rounded-xl overflow-hidden cursor-pointer border border-white/5"
          >
            <img src={img} alt={`Gallery ${index}`} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/10 hover:bg-black/0 transition-colors" />
          </motion.div>
        ))}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLightboxIndex(null)}
              className="absolute inset-0 bg-black/95 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-w-4xl w-full h-[70vh] flex items-center justify-center z-10"
            >
              {/* Close Button */}
              <button
                onClick={() => setLightboxIndex(null)}
                className="absolute -top-12 right-0 p-2 text-neutral-400 hover:text-white transition-colors bg-white/5 rounded-full"
              >
                <X size={20} />
              </button>

              {/* Prev Button */}
              <button
                onClick={handlePrev}
                className="absolute left-4 p-3 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all border border-white/10 z-20"
              >
                <ChevronLeft size={20} />
              </button>

              {/* Image Container */}
              <img
                src={images[lightboxIndex]}
                alt={`Gallery detail ${lightboxIndex}`}
                className="max-w-full max-h-full object-contain rounded-xl"
              />

              {/* Next Button */}
              <button
                onClick={handleNext}
                className="absolute right-4 p-3 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all border border-white/10 z-20"
              >
                <ChevronRight size={20} />
              </button>

              {/* Caption */}
              <div className="absolute -bottom-10 inset-x-0 text-center text-xs text-neutral-400">
                Image {lightboxIndex + 1} of {images.length}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExperienceGallery;
