(function() {
  // Initialize the dynamic navbar functionality
  function initDynamicNavbar() {
    const navbar = document.getElementById('dynamicNav');
    if (!navbar) return;
    
    // Get the navbar's before pseudo-element
    const navbarBefore = navbar;
    
    // Function to apply styles based on section
    function updateNavbarStyle() {
      // Get all sections that might affect navbar
      const sections = document.querySelectorAll('section, header, .hero, .features, .content-area, .main-content');
      
      // Default styles
      let bgColor = 'rgba(255, 255, 240, 0.85)';
      let textColor = '#666';
      let shadowOpacity = 0.1;
      
      // Get navbar position
      const navRect = navbar.getBoundingClientRect();
      const navMidpoint = navRect.top + navRect.height / 2;
      
      // Initialize variables to track the best matching section
      let bestMatchSection = null;
      let minDistance = Infinity;
      
      // Find the section that best matches the navbar's position
      for (const section of sections) {
        const sectionRect = section.getBoundingClientRect();
        
        // Skip if section is not visible
        if (sectionRect.bottom < 0 || sectionRect.top > window.innerHeight) continue;
        
        // Calculate distance from section's center to navbar's position
        const sectionMidpoint = sectionRect.top + sectionRect.height / 2;
        const distance = Math.abs(navMidpoint - sectionMidpoint);
        
        // If this section is closer than our previous best match
        if (distance < minDistance) {
          minDistance = distance;
          bestMatchSection = section;
        }
      }
      
      // If we found a matching section
      if (bestMatchSection) {
        const sectionBgColor = window.getComputedStyle(bestMatchSection).backgroundColor;
        const sectionClasses = bestMatchSection.classList;
        
        // Handle different types of background
        if (sectionBgColor && sectionBgColor !== 'rgba(0, 0, 0, 0)') {
          // Extract RGB components
          const rgb = sectionBgColor.match(/\d+/g);
          if (rgb) {
            // Create a slightly transparent version of the section color
            bgColor = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.85)`;
            
            // Determine if we need light or dark text based on background brightness
            const brightness = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
            textColor = brightness > 128 ? '#333' : '#fff';
            
            // Adjust shadow opacity based on background
            shadowOpacity = brightness > 128 ? 0.1 : 0.3;
          }
        }
        
        // Special case handling for specific sections
        if (sectionClasses.contains('hero')) {
          // Get computed gradient if exists
          const computedStyle = window.getComputedStyle(bestMatchSection);
          const bgImage = computedStyle.backgroundImage;
          
          if (bgImage && bgImage.includes('gradient')) {
            // For gradients, use a color extracted from the hero section
            bgColor = 'rgba(217, 217, 182, 0.85)';
            textColor = '#333';
          }
          
          // Check for pseudo-elements with gradients
          const heroBefore = window.getComputedStyle(bestMatchSection, '::before');
          if (heroBefore.background && heroBefore.background.includes('gradient')) {
            // If hero has a gradient in ::before, extract its color
            bgColor = 'rgba(217, 217, 182, 0.85)';
            textColor = '#333';
          }
        }
        
        // Features section usually has light background
        if (sectionClasses.contains('features')) {
          if (sectionBgColor === 'rgba(0, 0, 0, 0)' || sectionBgColor === 'transparent') {
            bgColor = 'rgba(247, 247, 247, 0.85)';
            textColor = '#333';
          }
        }
      }
      
      // Apply styles with smooth transition
      navbarBefore.style.setProperty('box-shadow', `0 2px 8px rgba(0,0,0,${shadowOpacity})`);
      
      // Apply background color to the ::before pseudo-element
      document.documentElement.style.setProperty('--nav-bg-color', bgColor);
      
      // Update text colors
      const links = navbar.querySelectorAll('.nav-links a');
      links.forEach(link => {
        link.style.color = textColor;
        link.style.transition = 'color 0.3s ease';
      });
      
      // Update dropdown backgrounds to match
      const dropdowns = navbar.querySelectorAll('.dropdown-content');
      dropdowns.forEach(dropdown => {
        dropdown.style.backgroundColor = bgColor;
        dropdown.style.transition = 'background-color 0.3s ease';
      });
    }
    
    // Add the CSS variable for the navbar background
    const style = document.createElement('style');
    style.innerHTML = `
      nav::before {
        background-color: var(--nav-bg-color, rgba(255, 255, 240, 0.85));
      }
    `;
    document.head.appendChild(style);
    
    // Initial update
    updateNavbarStyle();
    
    // Update on scroll with debounce for performance
    let scrollTimeout;
    window.addEventListener('scroll', function() {
      if (scrollTimeout) {
        window.cancelAnimationFrame(scrollTimeout);
      }
      scrollTimeout = window.requestAnimationFrame(function() {
        updateNavbarStyle();
      });
    });
    
    // Update on resize too
    let resizeTimeout;
    window.addEventListener('resize', function() {
      if (resizeTimeout) {
        window.cancelAnimationFrame(resizeTimeout);
      }
      resizeTimeout = window.requestAnimationFrame(function() {
        updateNavbarStyle();
      });
    });
    
    // Check for DOM changes (dynamic content loading)
    const observer = new MutationObserver(function(mutations) {
      updateNavbarStyle();
    });
    
    observer.observe(document.body, { 
      childList: true, 
      subtree: true 
    });
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDynamicNavbar);
  } else {
    initDynamicNavbar();
  }
})();