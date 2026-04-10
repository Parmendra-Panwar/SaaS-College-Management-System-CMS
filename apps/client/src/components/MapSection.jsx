import { MapContainer, Marker, TileLayer } from "react-leaflet";

const MapSection = ({ lat, lng, location, country }) => {
    return (
        <div className="mt-16 pt-10 border-t border-slate-200 relative z-0">
            <h3 className="text-2xl font-bold text-slate-900 mb-6">Where you'll be</h3>
            <div className="h-[450px] w-full rounded-3xl overflow-hidden shadow-inner border border-slate-200">
                <div className="relative w-full h-full z-0">
                    <MapContainer
                        key={`${lat}-${lng}`}
                        center={[lat, lng]}
                        zoom={13}
                        scrollWheelZoom={false}
                        className="h-full w-full"
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={[lat, lng]}></Marker>
                    </MapContainer>
                </div>
            </div>
            <p className="mt-4 text-slate-600 font-medium">{location}, {country}</p>
        </div>
    );
}

export default MapSection;