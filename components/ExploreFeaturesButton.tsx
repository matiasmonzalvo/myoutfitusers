"use client";

export default function ExploreFeaturesButton() {
  const handleClick = () => {
    const element = document.getElementById("features");
    if (element) {
      const headerHeight = 32; // 16 * 4 = 64px (h-16)
      const elementPosition = element.offsetTop - headerHeight;
      window.scrollTo({
        top: elementPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <button
      onClick={handleClick}
      className="border border-border text-sm lg:text-base text-foreground font-medium rounded-full px-3 py-2 cursor-pointer"
    >
      Explore features
    </button>
  );
}
