
(function () {
    const footerData = `
    <div class="footer-content" style="display:flex;justify-content:space-around;padding:2rem;background:#f8f9fa;">
      <div class="footer-col">
        <h4>ShopKart</h4>
        <ul style="list-style:none;padding:0;">
          <li><a href="./index.html">Home</a></li>
          <li><a href="./plp.html?cat=all">All Products</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Help</h4>
        <ul style="list-style:none;padding:0;">
          <li><a href="./contact.html" aria-label="Contact Us">Contact Us</a></li>
          <li><a href="./faq.html">FAQs</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Social</h4>
        <ul style="list-style:none;padding:0;">
          <li><a href="https://facebook.com" target="_blank" rel="noopener">Facebook</a></li>
          <li><a href="https://twitter.com" target="_blank" rel="noopener">Twitter</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom" style="text-align:center;padding:1rem;background:#eee;">
      <p>&copy; 2026 ShopKart. All rights reserved.</p>
    </div>
  `;

    // Inject into all footer tags found
    const footers = document.querySelectorAll('footer');
    footers.forEach(f => {
        f.innerHTML = footerData;
    });
})();
