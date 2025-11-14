export default function NotFound() {
  return (
    <div className="flex items-center justify-center h-full w-full">
      <div className="text-center">
        <h2
          className="text-[16vw] font-bold text-foreground leading-none mb-2"
          style={{
            WebkitTextStroke: "1px currentColor",
            WebkitTextFillColor: "transparent",
          }}
        >
          404
        </h2>
        <p className="text-muted-foreground text-lg">
          The page you are looking for does not exist.
        </p>
      </div>
    </div>
  );
}
