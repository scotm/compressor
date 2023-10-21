const LoadingDots = ({ color = '#000' }: { color?: string }) => {
    return (
        <>
            <span className="sr-only">Loading...</span>
            <div className="h-4 w-4 bg-black rounded-full animate-bounce [animation-delay:-0.3s] m-1"></div>
            <div className="h-4 w-4 bg-black rounded-full animate-bounce [animation-delay:-0.15s] m-1"></div>
            <div className="h-4 w-4 bg-black rounded-full animate-bounce m-1"></div>
        </>
    );
};

export default LoadingDots;
