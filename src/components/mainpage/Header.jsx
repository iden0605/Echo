const Header = () => {
  const handleHeaderClick = () => {
    if (window.innerWidth > 768) {
      window.location.reload();
    }
  };

  return (
    <header id="main-header" className="p-3 bg-transparent text-left z-10 w-full flex items-center">
      <img src="/echo-logo.png" alt="Echo Logo" className="h-5 w-5 md:h-6 md:w-6 mr-2" onClick={handleHeaderClick} />
      <h1
        className="text-lg select-none md:text-2xl font-bold text-cream-50"
        onClick={handleHeaderClick}
      >
        Echo
      </h1>
    </header>
  );
};

export default Header;
