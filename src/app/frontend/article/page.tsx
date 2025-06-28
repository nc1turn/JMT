import React from "react";

const CapaianJMTArchery = () => {
  return (
    <div className="font-sans text-gray-900">
      {/* Header */}
      <header className="flex justify-between items-center p-4 border-b">
        <div className="text-lg font-semibold">JMT Archery</div>
        <nav className="flex gap-4 items-center">
          <a href="#home">Home</a>
          <a href="#about">About Us</a>
          <a href="#market">Official Market</a>
          <button className="border px-4 py-1 rounded">Login</button>
        </nav>
      </header>

      {/* Title Section */}
      <section className="p-6">
        <h1 className="text-2xl font-bold">Capaian JMT Archey</h1>
        <p className="text-sm text-gray-600">Lorem ipsum dolor sit amet</p>
      </section>

      {/* Main Image and Paragraph */}
      <section className="p-6">
        <div className="items-center justify-center flex flex-col md:flex-row gap-4"> 
            <div className="bg-gray-200 h-90 w-200 mb-6"></div>
        </div>
        <p className="text-sm mb-6">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam tellus arcu, volutpat
          vitae nisi vitae, sollicitudin dictum velit. Pellentesque commodo rutrum ullamcorper.
          Donec porttitor, nisi vulputate mattis sagittis, magna ipsum euismod odio, non
          sollicitudin dui lacus eu erat. Etiam scelerisque odio at arcu tincidunt, sed consequat
          turpis dapibus. Quisque tincidunt aliquam ipsum, id tempus justo tristique ut.
          Suspendisse cursus risus eu ornare semper. Vivamus in ultricies enim. Ut pharetra risus
          a tortor rhoncus, eget ultricies sem luctus.
        </p>
        <p className="text-sm">
          Nunc sit amet nulla ut lacus suscipit consequat non. Curabitur eleifend libero quis
          eros efficitur cursus. Aliquam fringilla nisi dolor, fringilla maximus nisi scelerisque
          in. In ac lorem in consectetur fringilla. Aenean tortor dui, tempor sed dapibus eu,
          pharetra vel ex. Etiam sit amet bibendum felis. In nec urna metus. Pellentesque
          habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Cras
          sit amet ex. Vestibulum sit amet pharetra eros. Fusce faucibus eget nulla sit amet
          finibus. Mauris nec est eu sem molestie porta quis at augue. Fusce augue nisi, egestas
          eu enim sit amet, auctor vulputate ipsum.
        </p>
      </section>

      {/* Two Images Section */}
      <section className="p-6 grid md:grid-cols-2 gap-4">
        <div className="bg-gray-200 h-40"></div>
        <div className="bg-gray-200 h-40"></div>
      </section>

      {/* Second Paragraph */}
      <section className="p-6">
        <p className="text-sm">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam tellus arcu, volutpat
          vitae nisi vitae, sollicitudin dictum velit. Pellentesque commodo rutrum ullamcorper.
          Donec porttitor, nisi vulputate mattis sagittis, magna ipsum euismod odio, non
          sollicitudin dui lacus eu erat. Etiam scelerisque odio at arcu tincidunt, sed consequat
          turpis dapibus. Quisque tincidunt aliquam ipsum, id tempus justo tristique ut.
          Suspendisse cursus risus eu ornare semper. Vivamus in ultricies enim. Ut pharetra risus
          a tortor rhoncus, eget ultricies sem luctus.
        </p>
      </section>

      {/* Related Articles or Posts */}
      <section className="p-6">
        <h2 className="text-xl font-bold mb-4">Related articles or posts</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {[1, 2, 3].map((_, i) => (
            <div key={i}>
              <div className="bg-gray-200 h-32 mb-2"></div>
              <p className="text-sm font-semibold">Title</p>
              <p className="text-xs">Author</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="p-4 text-sm flex justify-between border-t">
        <div>JMT Archery</div>
        <div className="flex gap-2">
          <span className="w-4 h-4 bg-gray-400 rounded-full"></span>
          <span className="w-4 h-4 bg-gray-400 rounded-full"></span>
          <span className="w-4 h-4 bg-gray-400 rounded-full"></span>
        </div>
      </footer>
    </div>
  );
};

export default CapaianJMTArchery;
