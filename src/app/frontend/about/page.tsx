import React from 'react';

const ContactPage: React.FC = () => {
  return (
    <div className="min-h-screen p-6 font-sans">
      {/* Navbar */}
      <header className="flex justify-between items-center mb-8">
        <div className="text-lg font-semibold">JMT Archery</div>
        <nav className="flex space-x-6">
          <a href="#" className="text-sm hover:underline">Home</a>
          <a href="#" className="text-sm hover:underline">About Us</a>
          <button className="border px-4 py-1 text-sm rounded hover:bg-gray-100">Login</button>
        </nav>
      </header>

      {/* Main Section */}
      <main className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16 items-start">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">JMT Archery</h1>
            <p className="text-gray-500 text-lg mt-1">Subheading for description or instructions</p>
            <p className="text-sm text-gray-600 mt-2">Lorem ipsum dolor sit amet</p>
          </div>

          <form className="space-y-4">
            <h2 className="text-lg font-semibold">Contact me</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">First name</label>
                <input
                  type="text"
                  placeholder="Jane"
                  className="w-full border px-3 py-2 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Last name</label>
                <input
                  type="text"
                  placeholder="Smitherton"
                  className="w-full border px-3 py-2 rounded text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-1">Email address</label>
              <input
                type="email"
                placeholder="email@janesfakedomain.net"
                className="w-full border px-3 py-2 rounded text-sm"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Your message</label>
              <textarea
                placeholder="Enter your question or message"
                rows={4}
                className="w-full border px-3 py-2 rounded text-sm"
              ></textarea>
            </div>

            <button type="submit" className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800">
              Submit
            </button>
          </form>
        </div>

        <div className="bg-gray-200 aspect-square flex items-center justify-center">
          <span className="text-gray-400">[Image]</span>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t pt-6 flex justify-between items-center text-sm text-gray-500">
        <p>JMT Archery</p>
        <div className="flex space-x-4">
          <a href="#"><i className="fab fa-facebook"></i></a>
          <a href="#"><i className="fab fa-linkedin"></i></a>
          <a href="#"><i className="fab fa-youtube"></i></a>
          <a href="#"><i className="fab fa-instagram"></i></a>
        </div>
      </footer>
    </div>
  );
};

export default ContactPage;
