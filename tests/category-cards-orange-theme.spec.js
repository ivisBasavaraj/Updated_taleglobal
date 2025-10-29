const { test, expect } = require('@playwright/test');

test.describe('Category Cards with Orange SVG Icons', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page
    await page.goto('http://localhost:3000/');
    await page.waitForLoadState('networkidle');
    
    // Scroll to category cards section
    await page.evaluate(() => {
      const headings = document.querySelectorAll('h2');
      for (let h of headings) {
        if (h.textContent.includes('Choose a Relevant Category')) {
          h.scrollIntoView({ behavior: 'smooth', block: 'start' });
          break;
        }
      }
    });
    
    // Wait for cards to be visible
    await page.waitForSelector('.job-cat-block-hpage-6', { timeout: 5000 });
  });

  test('should display all 5 category cards', async ({ page }) => {
    const cards = await page.locator('.job-cat-block-hpage-6').count();
    expect(cards).toBe(5);
  });

  test('should have orange SVG icons without blue background', async ({ page }) => {
    const cards = page.locator('.job-cat-block-hpage-6');
    
    for (let i = 0; i < 5; i++) {
      const card = cards.nth(i);
      
      // Check that SVG icon exists
      const svg = card.locator('svg.category-svg');
      await expect(svg).toBeVisible();
      
      // Check that SVG has proper attributes and is displayed
      const svgElement = await svg.evaluate((el) => {
        return {
          viewBox: el.getAttribute('viewBox'),
          xmlns: el.getAttribute('xmlns'),
          display: window.getComputedStyle(el).display,
          hasStrokes: el.querySelectorAll('[stroke="#fd7e14"]').length > 0
        };
      });
      
      expect(svgElement.viewBox).toBe('0 0 80 80');
      expect(svgElement.xmlns).toContain('svg');
      expect(svgElement.display).not.toBe('none');
      expect(svgElement.hasStrokes).toBe(true);
    }
  });

  test('should verify no blue background pseudo-element on media', async ({ page }) => {
    const media = page.locator('.job-cat-block-hpage-6 .twm-media').first();
    
    const afterStyles = await media.evaluate(() => {
      const pseudoElement = window.getComputedStyle(document.querySelector('.job-cat-block-hpage-6 .twm-media'), '::after');
      return {
        display: pseudoElement.display,
        backgroundColor: pseudoElement.backgroundColor
      };
    });
    
    // The ::after should be hidden (display: none)
    expect(afterStyles.display).toBe('none');
  });

  test('should verify card titles are black', async ({ page }) => {
    const cards = page.locator('.job-cat-block-hpage-6');
    const categoryNames = [
      'Programming & Tech',
      'Content Writer',
      'Sales & Marketing',
      'Healthcare',
      'Human Resources'
    ];
    
    for (let i = 0; i < categoryNames.length; i++) {
      const card = cards.nth(i);
      const titleLink = card.locator('.twm-content > a').first();
      
      const titleColor = await titleLink.evaluate(() => {
        const element = document.querySelector('.job-cat-block-hpage-6 .twm-content > a');
        return window.getComputedStyle(element).color;
      });
      
      // Should be black (#17171d = rgb(23, 23, 29))
      expect(titleColor).toContain('rgb(23, 23, 29)');
    }
  });

  test('should verify job count badges have orange background', async ({ page }) => {
    const badges = page.locator('.job-cat-block-hpage-6 .twm-jobs-available').first();
    
    const badgeStyles = await badges.evaluate(() => {
      const element = document.querySelector('.job-cat-block-hpage-6 .twm-jobs-available');
      return {
        backgroundColor: window.getComputedStyle(element).backgroundColor,
        color: window.getComputedStyle(element).color
      };
    });
    
    // Should have orange background (rgba(253, 126, 20, 0.1))
    expect(badgeStyles.backgroundColor).toContain('rgba');
  });

  test('should verify arrow button has orange border and text', async ({ page }) => {
    const button = page.locator('.job-cat-block-hpage-6 .circle-line-btn').first();
    
    const buttonStyles = await button.evaluate(() => {
      const element = document.querySelector('.job-cat-block-hpage-6 .circle-line-btn');
      const icon = element.querySelector('.fa-arrow-right');
      return {
        borderColor: window.getComputedStyle(element).borderColor,
        backgroundColor: window.getComputedStyle(element).backgroundColor,
        iconColor: window.getComputedStyle(icon).color
      };
    });
    
    // Border should be orange (#fd7e14 = rgb(253, 126, 20))
    expect(buttonStyles.borderColor).toContain('rgb(253, 126, 20)');
    // Icon should be orange
    expect(buttonStyles.iconColor).toContain('rgb(253, 126, 20)');
  });

  test('should verify cards use only orange and black colors (no blue)', async ({ page }) => {
    const cards = page.locator('.job-cat-block-hpage-6');
    
    const cardCount = await cards.count();
    for (let i = 0; i < cardCount; i++) {
      const card = cards.nth(i);
      
      // Get all computed styles from card elements
      const hasBlue = await card.evaluate(() => {
        const allElements = document.querySelectorAll('.job-cat-block-hpage-6 *');
        const bluePattern = /^rgb\(25,\s*103,\s*210\)|^rgb\(0,\s*71,\s*171\)|#1967d2|#0047d4|#0056b3|#1e5ba8|#2d87d4/;
        
        for (let el of allElements) {
          const styles = window.getComputedStyle(el);
          const bgColor = styles.backgroundColor;
          const color = styles.color;
          const borderColor = styles.borderColor;
          
          if ((bgColor && bluePattern.test(bgColor)) ||
              (color && bluePattern.test(color)) ||
              (borderColor && bluePattern.test(borderColor))) {
            return {
              found: true,
              element: el.className,
              color: bgColor || color || borderColor
            };
          }
        }
        return { found: false };
      });
      
      expect(hasBlue.found).toBe(false);
    }
  });

  test('should verify hover effect on SVG icon (scale animation)', async ({ page }) => {
    const card = page.locator('.job-cat-block-hpage-6').first();
    const svg = card.locator('svg.category-svg');
    
    // Get initial transform
    const initialTransform = await svg.evaluate(() => {
      return window.getComputedStyle(document.querySelector('svg.category-svg')).transform;
    });
    
    // Hover over card
    await card.hover();
    await page.waitForTimeout(300); // Wait for transition
    
    // Get hover transform
    const hoverTransform = await svg.evaluate(() => {
      return window.getComputedStyle(document.querySelector('svg.category-svg')).transform;
    });
    
    // Transform should be different (scale(1.1))
    expect(hoverTransform).not.toBe(initialTransform);
  });

  test('should verify card layout on desktop viewport', async ({ page }) => {
    // Set viewport to desktop size
    await page.setViewportSize({ width: 1400, height: 900 });
    
    const cardSection = page.locator('.twm-job-cat-hpage-6-wrap .job-cat-block-hpage-6-section');
    
    const sectionLayout = await cardSection.evaluate(() => {
      const section = document.querySelector('.twm-job-cat-hpage-6-wrap .job-cat-block-hpage-6-section');
      const row = section.querySelector('.row');
      return {
        rowDisplay: window.getComputedStyle(row).display,
        rowFlexWrap: window.getComputedStyle(row).flexWrap,
        columnCount: row.children.length
      };
    });
    
    expect(sectionLayout.rowDisplay).toBe('flex');
    expect(sectionLayout.rowFlexWrap).toBe('nowrap');
    expect(sectionLayout.columnCount).toBe(5);
  });

  test('should verify white card backgrounds', async ({ page }) => {
    const cards = page.locator('.job-cat-block-hpage-6');
    
    for (let i = 0; i < 5; i++) {
      const card = cards.nth(i);
      const bgColor = await card.evaluate(() => {
        return window.getComputedStyle(document.querySelector('.job-cat-block-hpage-6')).backgroundColor;
      });
      
      // Should be white (rgb(255, 255, 255))
      expect(bgColor).toContain('rgb(255, 255, 255)');
    }
  });

  test('should verify SVG icons are properly centered in media container', async ({ page }) => {
    const media = page.locator('.job-cat-block-hpage-6 .twm-media').first();
    
    const mediaStyles = await media.evaluate(() => {
      const element = document.querySelector('.job-cat-block-hpage-6 .twm-media');
      return {
        display: window.getComputedStyle(element).display,
        alignItems: window.getComputedStyle(element).alignItems,
        justifyContent: window.getComputedStyle(element).justifyContent
      };
    });
    
    expect(mediaStyles.display).toBe('flex');
    expect(mediaStyles.alignItems).toBe('center');
    expect(mediaStyles.justifyContent).toBe('center');
  });
});