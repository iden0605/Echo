const Header = () => {
  const handleHeaderClick = () => {
    if (window.innerWidth > 768) {
      window.location.reload();
    }
  };

  return (
    <header id="main-header" className="p-3 bg-transparent text-left z-10 w-full flex items-center">
      <h1
        className="text-xl select-none md:text-2xl font-bold pl-2 md:pl-4 text-cream-50"
        onClick={handleHeaderClick}
      >
        Echo
      </h1>
    </header>
  );
};

export default Header;
