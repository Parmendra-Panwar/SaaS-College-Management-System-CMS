const PageLayout = ({ children, title, description }) => {
    return (
        <div className="max-w-full mx-auto p-6 animate-in slide-in-from-bottom-4">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                <p className="text-gray-500">{description}</p>
            </div>
            {children}
        </div>
    );
};

export default PageLayout;