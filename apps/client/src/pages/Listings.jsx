import AllListing from "../components/AllListing";


const Listings = () => {
    return (
        <div className="pb-32 min-h-screen bg-white">
            {/* Feeds Section */}
            <div className="border-t border-[#EBEBEB] bg-[#FAFAFA] pt-4">
                <div className="max-w-[1305px] mx-auto px-6 md:px-10 space-y-12">
                    <AllListing />
                </div>
            </div>
        </div>
    );
};

export default Listings;