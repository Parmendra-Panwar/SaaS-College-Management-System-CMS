import FallbackImage from './FallbackImage';

const ImageGallery = ({ images, openModal }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 rounded-[2rem] overflow-hidden h-[300px] md:h-[500px] mb-12 relative z-0">
            <div className="h-full cursor-pointer overflow-hidden group rounded-xl" onClick={() => openModal(0)}>
                <FallbackImage src={images[0]?.url} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" alt="Main" />
            </div>
            
            {/* Secondary Images (Only if more than 1 image) */}
            {images.length > 1 && (
                <div className="hidden md:grid gap-2 h-full grid-rows-2">
                    <div className="cursor-pointer overflow-hidden group rounded-xl" onClick={() => openModal(1)}>
                        <FallbackImage src={images[1]?.url || images[0]?.url} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" alt="Secondary 1" />
                    </div>
                    <div className="cursor-pointer overflow-hidden group rounded-xl" onClick={() => openModal(2)}>
                        <FallbackImage src={images[2]?.url || images[0]?.url} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" alt="Secondary 2" />
                    </div>
                </div>
            )}
        </div>
    )
}

export default ImageGallery;
