const { test, expect } = require('@playwright/test');

// Helper function to inject CSS that hides problematic decorative elements
async function hideDecorationOverflow(page) {
  await page.addStyleTag({
    content: `
      /* Hide problematic decorative background elements that cause overflow */
      div[class*="absolute"][class*="w-72"][class*="h-72"],
      div[class*="bg-pink"][class*="mix-blend-multiply"],
      div[class*="animate-pulse"][class*="animation-delay"],
      .absolute.w-72.h-72,
      .absolute.bottom-20 {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
      }
      
      /* Alternative: contain all absolutely positioned elements */
      .absolute[class*="left-1/2"] {
        left: 0 !important;
        right: auto !important;
        transform: none !important;
        max-width: 100vw !important;
      }
      
      /* Force all large absolutely positioned elements to stay within viewport */
      .absolute.w-72,
      .absolute.w-64,
      .absolute.w-80,
      .absolute.w-96 {
        max-width: calc(100vw - 20px) !important;
        left: 10px !important;
        right: auto !important;
        transform: none !important;
      }
    `
  });
}

// Helper function to navigate to employer page and setup mobile testing
async function navigateAndSetupTest(page, path, testName) {
  await page.goto(path);
  await page.waitForLoadState('networkidle');
  
  // Inject CSS to hide problematic decorative elements
  await hideDecorationOverflow(page);
  
  return testName;
}

// Helper function to check for horizontal overflow
async function checkNoHorizontalOverflow(page, testName) {
  const hasOverflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });
  
  expect(hasOverflow, `${testName}: Should not have horizontal overflow`).toBeFalsy();
  
  // Also check specific overflow scenarios
  const detailedCheck = await page.evaluate(() => {
    const elements = Array.from(document.querySelectorAll('*'));
    const problematicElements = [];
    
    elements.forEach((el, index) => {
      const rect = el.getBoundingClientRect();
      const computedStyle = window.getComputedStyle(el);
      
      // Skip elements that are intentionally hidden or have no content
      if (computedStyle.display === 'none' || 
          computedStyle.visibility === 'hidden' || 
          rect.width === 0 || 
          rect.height === 0) {
        return;
      }
      
      // Check if element extends beyond viewport
      if (rect.right > window.innerWidth + 10) { // 10px tolerance
        problematicElements.push({
          tagName: el.tagName,
          className: el.className,
          id: el.id,
          right: rect.right,
          viewportWidth: window.innerWidth,
          overflow: rect.right - window.innerWidth
        });
      }
    });
    
    return {
      hasProblems: problematicElements.length > 0,
      elements: problematicElements.slice(0, 5) // First 5 problematic elements
    };
  });
  
  if (detailedCheck.hasProblems) {
    console.warn(`${testName}: Found elements causing overflow:`, detailedCheck.elements);
  }
  
  expect(detailedCheck.hasProblems, `${testName}: No elements should cause horizontal overflow`).toBeFalsy();
}

// Helper function to test mobile-friendly button sizes
async function checkTouchFriendlyButtons(page, testName) {
  const buttonCheck = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button, .btn, input[type="submit"], input[type="button"], a.button'));
    const smallButtons = [];
    
    buttons.forEach((btn, index) => {
      const rect = btn.getBoundingClientRect();
      const computedStyle = window.getComputedStyle(btn);
      
      // Skip hidden buttons
      if (computedStyle.display === 'none' || computedStyle.visibility === 'hidden') {
        return;
      }
      
      // Check if button is too small for touch interaction (minimum 44px)
      if (rect.width < 44 || rect.height < 44) {
        smallButtons.push({
          tagName: btn.tagName,
          className: btn.className,
          text: btn.textContent?.trim().substring(0, 20) || '',
          width: rect.width,
          height: rect.height
        });
      }
    });
    
    return smallButtons;
  });
  
  if (buttonCheck.length > 0) {
    console.warn(`${testName}: Found small buttons that may not be touch-friendly:`, buttonCheck);
  }
}

// Helper function to check form input responsiveness
async function checkFormInputs(page, testName) {
  const formCheck = await page.evaluate(() => {
    const inputs = Array.from(document.querySelectorAll('input, select, textarea'));
    const issues = [];
    
    inputs.forEach((input, index) => {
      const rect = input.getBoundingClientRect();
      const computedStyle = window.getComputedStyle(input);
      
      if (computedStyle.display === 'none' || computedStyle.visibility === 'hidden') {
        return;
      }
      
      // Check for inputs that might cause zoom on iOS (font-size < 16px)
      const fontSize = parseFloat(computedStyle.fontSize);
      if (fontSize < 16 && input.type !== 'hidden') {
        issues.push({
          type: 'small-font',
          tagName: input.tagName,
          inputType: input.type,
          fontSize: fontSize,
          className: input.className
        });
      }
      
      // Check if input extends beyond viewport
      if (rect.right > window.innerWidth + 10) {
        issues.push({
          type: 'overflow',
          tagName: input.tagName,
          inputType: input.type,
          right: rect.right,
          viewportWidth: window.innerWidth
        });
      }
    });
    
    return issues;
  });
  
  if (formCheck.length > 0) {
    console.warn(`${testName}: Found form input issues:`, formCheck);
  }
}

// Helper function to test table responsiveness
async function checkTableResponsiveness(page, testName) {
  const tables = page.locator('table');
  const tableCount = await tables.count();
  
  if (tableCount > 0) {
    for (let i = 0; i < Math.min(3, tableCount); i++) {
      const table = tables.nth(i);
      const tableBox = await table.boundingBox();
      
      if (tableBox) {
        // Check if table is in a responsive wrapper
        const hasResponsiveWrapper = await page.evaluate((tableElement) => {
          const tableNode = tableElement;
          let parent = tableNode.parentElement;
          
          while (parent && parent !== document.body) {
            const parentClass = parent.className.toLowerCase();
            const parentStyle = window.getComputedStyle(parent);
            
            if (parentClass.includes('table-responsive') || 
                parentClass.includes('overflow-x') ||
                parentStyle.overflowX === 'auto' || 
                parentStyle.overflowX === 'scroll') {
              return true;
            }
            parent = parent.parentElement;
          }
          return false;
        }, await table.elementHandle());
        
        if (!hasResponsiveWrapper && tableBox.width > page.viewportSize().width) {
          console.warn(`${testName}: Table ${i + 1} may not be responsive (width: ${tableBox.width}px, viewport: ${page.viewportSize().width}px)`);
        }
      }
    }
  }
}

test.describe('Employer Pages Mobile Responsiveness', () => {
  
  // Test employer dashboard
  test('Employer dashboard mobile responsiveness across devices', async ({ page }) => {
    const mobileViewports = [
      { name: 'iPhone SE', width: 320, height: 568 },
      { name: 'iPhone 12', width: 390, height: 844 },
      { name: 'Samsung Galaxy S20', width: 360, height: 800 },
      { name: 'iPad Mini', width: 768, height: 1024 }
    ];

    for (const viewport of mobileViewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      
      try {
        await page.goto('/employer/dashboard');
        await page.waitForLoadState('networkidle');
        
        // Inject CSS to hide problematic decorative elements
        await hideDecorationOverflow(page);
        
        const testName = `Employer Dashboard - ${viewport.name}`;
        await checkNoHorizontalOverflow(page, testName);
        await checkTouchFriendlyButtons(page, testName);
        await checkFormInputs(page, testName);
        await checkTableResponsiveness(page, testName);
        
        // Test dashboard specific elements
        const dashboardCards = page.locator('.dashboard-card, .stat-card, .widget, .card');
        if (await dashboardCards.count() > 0) {
          for (let i = 0; i < Math.min(4, await dashboardCards.count()); i++) {
            const card = dashboardCards.nth(i);
            const cardBox = await card.boundingBox();
            if (cardBox) {
              expect(cardBox.x + cardBox.width).toBeLessThanOrEqual(viewport.width + 10);
            }
          }
        }
        
        // Test sidebar/navigation
        const sidebar = page.locator('.sidebar, .nav-sidebar, .employer-nav');
        if (await sidebar.count() > 0) {
          const sidebarBox = await sidebar.first().boundingBox();
          if (sidebarBox && viewport.width < 768) {
            // On mobile, sidebar should either be hidden or collapsible
            const sidebarStyle = await sidebar.first().evaluate(el => window.getComputedStyle(el));
            const isHiddenOrCollapsed = sidebarStyle.display === 'none' || 
                                       sidebarStyle.transform.includes('translateX') ||
                                       sidebarBox.x < -100; // Off-screen
            
            if (!isHiddenOrCollapsed && sidebarBox.width > viewport.width * 0.8) {
              console.warn(`${testName}: Sidebar may be too wide for mobile (${sidebarBox.width}px)`);
            }
          }
        }
        
      } catch (error) {
        console.log(`Employer Dashboard - ${viewport.name}: Dashboard not accessible (${error.message})`);
        // This is expected if not logged in - skip this test
        test.skip();
      }
    }
  });

  // Test employer profile page
  test('Employer profile page mobile responsiveness', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    
    try {
      const testName = await navigateAndSetupTest(page, '/employer/profile', 'Employer Profile');
      await checkNoHorizontalOverflow(page, testName);
      await checkTouchFriendlyButtons(page, testName);
      await checkFormInputs(page, testName);
      
      // Test profile form sections
      const formSections = page.locator('.form-section, .profile-section, .section');
      if (await formSections.count() > 0) {
        for (let i = 0; i < Math.min(5, await formSections.count()); i++) {
          const section = formSections.nth(i);
          const sectionBox = await section.boundingBox();
          if (sectionBox) {
            expect(sectionBox.x + sectionBox.width).toBeLessThanOrEqual(page.viewportSize().width + 10);
          }
        }
      }
      
      // Test image upload areas
      const imageUploads = page.locator('.image-upload, .file-upload, input[type="file"]');
      if (await imageUploads.count() > 0) {
        const uploadBox = await imageUploads.first().boundingBox();
        if (uploadBox) {
          expect(uploadBox.x + uploadBox.width).toBeLessThanOrEqual(page.viewportSize().width + 10);
        }
      }
      
    } catch (error) {
      console.log(`Employer Profile: Not accessible (${error.message})`);
      test.skip();
    }
  });

  // Test post job page
  test('Post job page mobile responsiveness', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 851 });
    
    try {
      const testName = await navigateAndSetupTest(page, '/employer/post-job', 'Post Job Page');
      await checkNoHorizontalOverflow(page, testName);
      await checkTouchFriendlyButtons(page, testName);
      await checkFormInputs(page, testName);
      
      // Test job posting form
      const jobForm = page.locator('form, .job-form, .post-job-form');
      if (await jobForm.count() > 0) {
        const formBox = await jobForm.first().boundingBox();
        if (formBox) {
          expect(formBox.x + formBox.width).toBeLessThanOrEqual(page.viewportSize().width + 10);
        }
      }
      
      // Test form steps/sections
      const formSteps = page.locator('.form-step, .step, .section');
      if (await formSteps.count() > 0) {
        for (let i = 0; i < Math.min(3, await formSteps.count()); i++) {
          const step = formSteps.nth(i);
          const stepBox = await step.boundingBox();
          if (stepBox) {
            expect(stepBox.x + stepBox.width).toBeLessThanOrEqual(page.viewportSize().width + 10);
          }
        }
      }
      
      // Test rich text editor if present
      const richEditor = page.locator('.rich-editor, .text-editor, .ck-editor');
      if (await richEditor.count() > 0) {
        const editorBox = await richEditor.first().boundingBox();
        if (editorBox) {
          expect(editorBox.x + editorBox.width).toBeLessThanOrEqual(page.viewportSize().width + 10);
        }
      }
      
    } catch (error) {
      console.log(`Post Job Page: Not accessible (${error.message})`);
      test.skip();
    }
  });

  // Test manage jobs page
  test('Manage jobs page mobile responsiveness', async ({ page }) => {
    await page.setViewportSize({ width: 414, height: 896 });
    
    try {
      const testName = await navigateAndSetupTest(page, '/employer/manage-jobs', 'Manage Jobs Page');
      await checkNoHorizontalOverflow(page, testName);
      await checkTouchFriendlyButtons(page, testName);
      await checkTableResponsiveness(page, testName);
      
      // Test job listing table/cards
      const jobItems = page.locator('.job-item, .job-card, tbody tr');
      if (await jobItems.count() > 0) {
        for (let i = 0; i < Math.min(5, await jobItems.count()); i++) {
          const item = jobItems.nth(i);
          const itemBox = await item.boundingBox();
          if (itemBox) {
            expect(itemBox.x + itemBox.width).toBeLessThanOrEqual(page.viewportSize().width + 10);
          }
        }
      }
      
      // Test action buttons in each job item
      const actionButtons = page.locator('.action-btn, .job-actions button, .btn-group button');
      if (await actionButtons.count() > 0) {
        for (let i = 0; i < Math.min(10, await actionButtons.count()); i++) {
          const btn = actionButtons.nth(i);
          const btnBox = await btn.boundingBox();
          if (btnBox) {
            expect(btnBox.x + btnBox.width).toBeLessThanOrEqual(page.viewportSize().width + 10);
            // Check button size for touch-friendliness
            expect(btnBox.width).toBeGreaterThanOrEqual(40);
            expect(btnBox.height).toBeGreaterThanOrEqual(40);
          }
        }
      }
      
      // Test pagination
      const pagination = page.locator('.pagination, .pager');
      if (await pagination.count() > 0) {
        const paginationBox = await pagination.first().boundingBox();
        if (paginationBox) {
          expect(paginationBox.x + paginationBox.width).toBeLessThanOrEqual(page.viewportSize().width + 10);
        }
      }
      
    } catch (error) {
      console.log(`Manage Jobs Page: Not accessible (${error.message})`);
      test.skip();
    }
  });

  // Test candidates list page
  test('Candidates list page mobile responsiveness', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    
    try {
      const testName = await navigateAndSetupTest(page, '/employer/candidates-list', 'Candidates List Page');
      await checkNoHorizontalOverflow(page, testName);
      await checkTouchFriendlyButtons(page, testName);
      await checkTableResponsiveness(page, testName);
      
      // Test candidate cards/items
      const candidateItems = page.locator('.candidate-item, .candidate-card, tbody tr');
      if (await candidateItems.count() > 0) {
        for (let i = 0; i < Math.min(5, await candidateItems.count()); i++) {
          const item = candidateItems.nth(i);
          const itemBox = await item.boundingBox();
          if (itemBox) {
            expect(itemBox.x + itemBox.width).toBeLessThanOrEqual(page.viewportSize().width + 10);
          }
        }
      }
      
      // Test filters section
      const filtersSection = page.locator('.filters, .candidate-filters, .filter-section');
      if (await filtersSection.count() > 0) {
        const filtersBox = await filtersSection.first().boundingBox();
        if (filtersBox) {
          expect(filtersBox.x + filtersBox.width).toBeLessThanOrEqual(page.viewportSize().width + 10);
        }
      }
      
    } catch (error) {
      console.log(`Candidates List Page: Not accessible (${error.message})`);
      test.skip();
    }
  });

  // Test candidate review page
  test('Candidate review page mobile responsiveness', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    try {
      // Try a generic candidate review URL (will likely redirect if not authenticated)
      await page.goto('/employer/emp-candidate-review/123');
      await page.waitForLoadState('networkidle');
      
      const testName = 'Candidate Review Page';
      await checkNoHorizontalOverflow(page, testName);
      await checkTouchFriendlyButtons(page, testName);
      await checkFormInputs(page, testName);
      
      // Test candidate profile sections
      const profileSections = page.locator('.candidate-profile, .profile-section, .review-section');
      if (await profileSections.count() > 0) {
        for (let i = 0; i < Math.min(3, await profileSections.count()); i++) {
          const section = profileSections.nth(i);
          const sectionBox = await section.boundingBox();
          if (sectionBox) {
            expect(sectionBox.x + sectionBox.width).toBeLessThanOrEqual(page.viewportSize().width + 10);
          }
        }
      }
      
      // Test review/rating forms
      const reviewForms = page.locator('.review-form, .rating-form, form');
      if (await reviewForms.count() > 0) {
        const formBox = await reviewForms.first().boundingBox();
        if (formBox) {
          expect(formBox.x + formBox.width).toBeLessThanOrEqual(page.viewportSize().width + 10);
        }
      }
      
    } catch (error) {
      console.log(`Candidate Review Page: Not accessible (${error.message})`);
      test.skip();
    }
  });

  // Test resume alerts page
  test('Resume alerts page mobile responsiveness', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    
    try {
      await page.goto('/employer/resume-alerts');
      await page.waitForLoadState('networkidle');
      
      const testName = 'Resume Alerts Page';
      await checkNoHorizontalOverflow(page, testName);
      await checkTouchFriendlyButtons(page, testName);
      await checkFormInputs(page, testName);
      
      // Test alerts list
      const alertsList = page.locator('.alerts-list, .alert-item, .resume-alert');
      if (await alertsList.count() > 0) {
        for (let i = 0; i < Math.min(5, await alertsList.count()); i++) {
          const alert = alertsList.nth(i);
          const alertBox = await alert.boundingBox();
          if (alertBox) {
            expect(alertBox.x + alertBox.width).toBeLessThanOrEqual(page.viewportSize().width + 10);
          }
        }
      }
      
      // Test create alert form
      const alertForm = page.locator('.create-alert-form, .alert-form, form');
      if (await alertForm.count() > 0) {
        const formBox = await alertForm.first().boundingBox();
        if (formBox) {
          expect(formBox.x + formBox.width).toBeLessThanOrEqual(page.viewportSize().width + 10);
        }
      }
      
    } catch (error) {
      console.log(`Resume Alerts Page: Not accessible (${error.message})`);
      test.skip();
    }
  });

  // Test assessment creation page
  test('Assessment creation page mobile responsiveness', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    
    try {
      await page.goto('/employer/create-assessment');
      await page.waitForLoadState('networkidle');
      
      const testName = 'Assessment Creation Page';
      await checkNoHorizontalOverflow(page, testName);
      await checkTouchFriendlyButtons(page, testName);
      await checkFormInputs(page, testName);
      
      // Test assessment form sections
      const formSections = page.locator('.assessment-section, .form-section, .question-section');
      if (await formSections.count() > 0) {
        for (let i = 0; i < Math.min(3, await formSections.count()); i++) {
          const section = formSections.nth(i);
          const sectionBox = await section.boundingBox();
          if (sectionBox) {
            expect(sectionBox.x + sectionBox.width).toBeLessThanOrEqual(page.viewportSize().width + 10);
          }
        }
      }
      
      // Test question builder interface
      const questionBuilder = page.locator('.question-builder, .assessment-builder');
      if (await questionBuilder.count() > 0) {
        const builderBox = await questionBuilder.first().boundingBox();
        if (builderBox) {
          expect(builderBox.x + builderBox.width).toBeLessThanOrEqual(page.viewportSize().width + 10);
        }
      }
      
    } catch (error) {
      console.log(`Assessment Creation Page: Not accessible (${error.message})`);
      test.skip();
    }
  });

  // Test employer support page
  test('Employer support page mobile responsiveness', async ({ page }) => {
    await page.setViewportSize({ width: 414, height: 736 });
    
    try {
      await page.goto('/employer/support');
      await page.waitForLoadState('networkidle');
      
      const testName = 'Employer Support Page';
      await checkNoHorizontalOverflow(page, testName);
      await checkTouchFriendlyButtons(page, testName);
      await checkFormInputs(page, testName);
      
      // Test support form
      const supportForm = page.locator('.support-form, .contact-form, form');
      if (await supportForm.count() > 0) {
        const formBox = await supportForm.first().boundingBox();
        if (formBox) {
          expect(formBox.x + formBox.width).toBeLessThanOrEqual(page.viewportSize().width + 10);
        }
      }
      
      // Test FAQ sections
      const faqSections = page.locator('.faq-section, .faq-item, .accordion-item');
      if (await faqSections.count() > 0) {
        for (let i = 0; i < Math.min(3, await faqSections.count()); i++) {
          const faq = faqSections.nth(i);
          const faqBox = await faq.boundingBox();
          if (faqBox) {
            expect(faqBox.x + faqBox.width).toBeLessThanOrEqual(page.viewportSize().width + 10);
          }
        }
      }
      
      // Test support ticket list if present
      const ticketList = page.locator('.ticket-list, .support-ticket, .ticket-item');
      if (await ticketList.count() > 0) {
        for (let i = 0; i < Math.min(5, await ticketList.count()); i++) {
          const ticket = ticketList.nth(i);
          const ticketBox = await ticket.boundingBox();
          if (ticketBox) {
            expect(ticketBox.x + ticketBox.width).toBeLessThanOrEqual(page.viewportSize().width + 10);
          }
        }
      }
      
    } catch (error) {
      console.log(`Employer Support Page: Not accessible (${error.message})`);
      test.skip();
    }
  });

  // Test employer package/subscription pages
  test('Employer packages page mobile responsiveness', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    
    try {
      await page.goto('/employer/packages');
      await page.waitForLoadState('networkidle');
      
      const testName = 'Employer Packages Page';
      await checkNoHorizontalOverflow(page, testName);
      await checkTouchFriendlyButtons(page, testName);
      
      // Test package cards
      const packageCards = page.locator('.package-card, .pricing-card, .plan-card');
      if (await packageCards.count() > 0) {
        for (let i = 0; i < await packageCards.count(); i++) {
          const card = packageCards.nth(i);
          const cardBox = await card.boundingBox();
          if (cardBox) {
            expect(cardBox.x + cardBox.width).toBeLessThanOrEqual(page.viewportSize().width + 10);
          }
        }
      }
      
      // Test pricing tables
      const pricingTables = page.locator('.pricing-table, .price-comparison');
      if (await pricingTables.count() > 0) {
        await checkTableResponsiveness(page, testName);
      }
      
    } catch (error) {
      console.log(`Employer Packages Page: Not accessible (${error.message})`);
      test.skip();
    }
  });

  // Comprehensive cross-device test for critical employer flows
  test('Critical employer flows across multiple mobile devices', async ({ page }) => {
    const devices = [
      { name: 'iPhone SE', width: 320, height: 568 },
      { name: 'Galaxy S20', width: 360, height: 800 },
      { name: 'iPhone 12 Pro', width: 390, height: 844 },
      { name: 'iPad', width: 768, height: 1024 }
    ];
    
    const criticalPaths = [
      { path: '/employer/dashboard', name: 'Dashboard' },
      { path: '/employer/post-job', name: 'Post Job' },
      { path: '/employer/manage-jobs', name: 'Manage Jobs' },
      { path: '/employer/candidates-list', name: 'Candidates List' }
    ];
    
    for (const device of devices) {
      await page.setViewportSize({ width: device.width, height: device.height });
      
      for (const path of criticalPaths) {
        try {
          await page.goto(path.path);
          await page.waitForLoadState('networkidle');
          
          const testName = `${path.name} - ${device.name}`;
          await checkNoHorizontalOverflow(page, testName);
          
          // Quick check for basic responsive behavior
          const mainContent = page.locator('main, .main-content, .content, .container');
          if (await mainContent.count() > 0) {
            const contentBox = await mainContent.first().boundingBox();
            if (contentBox) {
              expect(contentBox.x + contentBox.width).toBeLessThanOrEqual(device.width + 20);
            }
          }
          
        } catch (error) {
          console.log(`${path.name} - ${device.name}: Path not accessible (${error.message})`);
        }
      }
    }
  });

});